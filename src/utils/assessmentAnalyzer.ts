import { ASSESSMENT_QUESTIONS } from '../data/questions';
import type { AnalysisResult, AssessmentAnswers, ContactInfo, LeadPriority } from '../types/assessment';

const NUTRITION_OUT_SCORES: Record<string, number> = { '0-2': 92, '3-5': 74, '6-10': 54, '10+': 36 };
const SUGAR_SCORES: Record<string, number> = { '0': 94, '1': 76, '2': 56, '3+': 36 };
const ENERGY_SCORES: Record<string, number> = { stable: 90, sluggish: 60, crash: 36 };
const SLEEP_SCORES: Record<string, number> = { good: 90, fair: 62, poor: 36 };
const ACTIVITY_SCORES: Record<string, number> = { active: 92, moderate: 78, light: 58, sedentary: 36 };

function getOptionLabel(questionId: keyof AssessmentAnswers, value: string): string {
  const q = ASSESSMENT_QUESTIONS.find((item) => item.id === questionId);
  return q?.options?.find((opt) => opt.value === value)?.label ?? value;
}

function getGoalSummary(goals: string[]): string {
  if (!goals.length) return 'Perbaikan pola hidup sehat';
  return goals.map((g) => getOptionLabel('goal', g)).join(', ');
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Ideal / Normal';
  if (bmi < 28) return 'Overweight Ringan';
  return 'Perlu Perhatian Khusus';
}

function calculateProteinRange(weightKg: number, bmi: number, heightM: number, goals: string[]): string {
  const effectiveWeight = bmi >= 28 ? Math.round(heightM * heightM * 24) : weightKg;
  const wantsMuscle = goals.includes('tone_muscle');
  const wantsFatLoss = goals.includes('fat_loss');

  const minMult = wantsMuscle ? 1.5 : wantsFatLoss ? 1.3 : 1.1;
  const maxMult = wantsMuscle ? 1.8 : wantsFatLoss ? 1.6 : 1.4;

  const round5 = (n: number) => Math.round(n / 5) * 5;
  const minGrams = Math.min(150, Math.max(50, round5(effectiveWeight * minMult)));
  const maxGrams = Math.min(175, Math.max(minGrams + 15, round5(effectiveWeight * maxMult)));
  return `${minGrams}–${maxGrams} gram/hari`;
}

function determinePriority(readiness: string): LeadPriority {
  if (readiness === 'now' || readiness === 'this_week') return 'HOT';
  if (readiness === 'next_month') return 'WARM';
  return 'COLD';
}

function buildInsights(answers: AssessmentAnswers): string[] {
  const list: string[] = [];

  if ((answers.sugar_snacking === '2' || answers.sugar_snacking === '3+') && answers.afternoon_energy !== 'stable') {
    list.push(
      'Minuman manis atau camilan harian memicu lonjakan gula darah yang membuat energimu cepat drop di jam 2–4 sore. Menggantinya dengan camilan tinggi protein membantu fokus tetap stabil.',
    );
  }
  if (answers.eating_out === '6-10' || answers.eating_out === '10+') {
    list.push(
      'Frekuensi makan di luar/pesan online cukup tinggi—tanpa strategi pilih menu & porsi protein dulu, kalori harian mudah surplus tanpa terasa kenyang.',
    );
  }
  if (answers.history === 'yoyo_diet') {
    list.push(
      'Riwayat diet ketat atau yoyo membuat tubuh lebih mudah lapar saat defisit ekstrem. Pendekatan defisit moderat + protein cukup jauh lebih bertahan lama.',
    );
  }
  if (answers.sleep_quality === 'fair' || answers.sleep_quality === 'poor') {
    list.push(
      'Tidur kurang dari 7 jam atau kurang nyenyak meningkatkan hormon lapar keesokan harinya, sehingga dorongan ngemil manis jadi lebih tinggi.',
    );
  }
  if (answers.activity_level === 'sedentary') {
    list.push(
      'Aktivitas harian masih tergolong duduk dominan. Menambah target langkah harian secara bertahap dan latihan ringan 2x seminggu efektif membangkitkan metabolisme.',
    );
  } else if (answers.history === 'plateau') {
    list.push(
      'Progres yang mentok walau sudah olahraga biasanya terjadi karena asupan protein dan komposisi makan harian belum selaras dengan kebutuhan tubuhmu.',
    );
  }

  if (list.length < 2) {
    list.push(
      'Fondasi kebiasaan sehatmu sudah cukup baik—fokus berikutnya adalah merapikan konsistensi protein harian dan menjaga ritme istirahat agar hasil terasa maksimal.',
    );
  }
  if (list.length < 2) {
    list.push(
      'Dengan penyesuaian pola makan yang realistis tanpa pantangan ekstrem, target tubuh dan energimu bisa dicapai lebih stabil bersama pendampingan.',
    );
  }

  return list.slice(0, 3);
}

export function analyzeAssessment(answers: AssessmentAnswers): AnalysisResult {
  const heightCm = typeof answers.height_cm === 'number' && answers.height_cm > 0 ? answers.height_cm : 165;
  const weightKg = typeof answers.weight_kg === 'number' && answers.weight_kg > 0 ? answers.weight_kg : 65;
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  const bmiCategory = getBmiCategory(bmi);

  const eatScore = NUTRITION_OUT_SCORES[answers.eating_out] ?? 65;
  const sugarScore = SUGAR_SCORES[answers.sugar_snacking] ?? 65;
  const nutrition = Math.round((eatScore + sugarScore) / 2);
  const energy = ENERGY_SCORES[answers.afternoon_energy] ?? 65;
  const recovery = SLEEP_SCORES[answers.sleep_quality] ?? 65;
  const activity = ACTIVITY_SCORES[answers.activity_level] ?? 60;

  const weighted = nutrition * 0.35 + energy * 0.2 + recovery * 0.25 + activity * 0.2;
  const overallScore = Math.min(94, Math.max(38, Math.round(weighted)));

  return {
    bmi,
    bmiCategory,
    proteinRange: calculateProteinRange(weightKg, bmi, heightM, answers.goal),
    overallScore,
    subScores: { nutrition, energy, recovery, activity },
    insights: buildInsights(answers),
    leadPriority: determinePriority(answers.readiness),
  };
}

export function formatWhatsAppSummary(
  contact: ContactInfo,
  answers: AssessmentAnswers,
  analysis: AnalysisResult,
): string {
  const goals = getGoalSummary(answers.goal);
  const readiness = getOptionLabel('readiness', answers.readiness);
  return [
    `Halo Coach Vera! Saya *${contact.nickname}* (@${contact.igUsername}) baru saja menyelesaikan evaluasi kesehatan transformwithST.`,
    '',
    `• Goal: ${goals}`,
    `• Skor Gaya Hidup: ${analysis.overallScore}/100`,
    `• BMI: ${analysis.bmi} (${analysis.bmiCategory})`,
    `• Estimasi Protein: ${analysis.proteinRange}`,
    `• Kesiapan Mulai: ${readiness}`,
    '',
    'Boleh bantu arahkan langkah paling pas untuk kondisi saya sekarang? Terima kasih Coach! 😊',
  ].join('\n');
}

export function formatIgDmSummary(
  contact: ContactInfo,
  answers: AssessmentAnswers,
  analysis: AnalysisResult,
): string {
  const goals = getGoalSummary(answers.goal);
  const readiness = getOptionLabel('readiness', answers.readiness);
  return [
    `Halo Coach Vera! Hasil evaluasi transformwithST saya:`,
    `Nama: ${contact.nickname} (@${contact.igUsername})`,
    `Skor: ${analysis.overallScore}/100 | BMI: ${analysis.bmi} (${analysis.bmiCategory})`,
    `Goal: ${goals} | Protein: ${analysis.proteinRange}`,
    `Kesiapan mulai: ${readiness}`,
  ].join('\n');
}
