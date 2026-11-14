import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Minus, Plus } from 'lucide-react';
import { ASSESSMENT_QUESTIONS } from '../data/questions';
import type { AssessmentAnswers, FormStepConfig, Question } from '../types/assessment';

interface FormStepProps {
  step: FormStepConfig;
  stepIndex: number;
  totalSteps: number;
  answers: AssessmentAnswers;
  onChange: (questionId: string, value: string | string[] | number) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEFAULT_START: Record<string, number> = { age: 28, height_cm: 165, weight_kg: 65 };
const COACH_TIPS: Record<number, string> = {
  1: 'Jujur aja ya, nggak ada jawaban benar atau salah!',
  2: 'Data ini dipakai khusus buat hitung estimasi metabolisme & proteinmu.',
  3: 'Kebiasaan kecil di siang & sore hari sering jadi kunci energi harian.',
  4: 'Satu langkah lagi sebelum skor & insight personalmu terbuka!',
};
const OPTION_ICONS: Record<string, string> = {
  fat_loss: '🔥', tone_muscle: '💪', boost_energy: '⚡', fix_diet: '🥗',
  never_serious: '🌱', yoyo_diet: '🔄', plateau: '📉', gradual_gain: '📈',
  male: '👨', female: '👩', '0-2': '🏠', '3-5': '🥡', '6-10': '🛵', '10+': '🍱',
  '0': '💧', '1': '☕', '2': '🧋', '3+': '🍬', stable: '✨', sluggish: '🥱', crash: '🔋',
  good: '😴', fair: '🌙', poor: '⏰', sedentary: '🪑', light: '🚶', moderate: '🏋️', active: '🏃',
  now: '🚀', this_week: '📅', next_month: '🗓️', browsing: '👀',
};

export function FormStep({ step, stepIndex, totalSteps, answers, onChange, onNext, onBack }: FormStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const questions = ASSESSMENT_QUESTIONS.filter((q) => q.step === step.step);
  const isFinalStep = stepIndex === totalSteps - 1;

  useEffect(() => {
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  const updateField = (id: string, value: string | string[] | number) => {
    onChange(id, value);
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const toggleMulti = (id: string, optionValue: string) => {
    const raw = answers[id as keyof AssessmentAnswers];
    const current = Array.isArray(raw) ? raw : [];
    updateField(id, current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue]);
  };

  const adjustNumber = (q: Question, delta: number) => {
    const min = q.min ?? 0;
    const max = q.max ?? 999;
    const raw = answers[q.id];
    const base = typeof raw === 'number' ? raw : (DEFAULT_START[q.id] ?? min);
    updateField(q.id, Math.min(max, Math.max(min, base + delta)));
  };

  const handleNextClick = () => {
    const nextErrors: Record<string, string> = {};
    for (const q of questions) {
      if (!q.required) continue;
      const val = answers[q.id];
      if (q.type === 'multi-choice') {
        if (!Array.isArray(val) || val.length === 0) nextErrors[q.id] = 'Pilih minimal 1 jawaban ya';
      } else if (q.type === 'number') {
        const min = q.min ?? 0;
        const max = q.max ?? 999;
        if (val === '' || typeof val !== 'number' || Number.isNaN(val) || val < min || val > max) {
          nextErrors[q.id] = `Masukkan angka antara ${min}–${max}${q.unit ? ` ${q.unit}` : ''}`;
        }
      } else if (!val) {
        nextErrors[q.id] = 'Pilih salah satu jawaban dulu ya';
      }
    }
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return; }
    onNext();
  };

  const numberQuestions = questions.filter((q) => q.type === 'number');
  const choiceQuestions = questions.filter((q) => q.type !== 'number');

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
          <span className="tabular-nums text-emerald-700">Langkah {stepIndex + 1} dari {totalSteps}</span>
          <span className="truncate text-slate-500">{step.title}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx <= stepIndex ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-emerald-100'}`} />
          ))}
        </div>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white/90 px-3.5 py-2.5 text-xs text-slate-600 shadow-xs backdrop-blur-md">
        <span className="shrink-0 font-bold text-emerald-700">Coach Vera Tip:</span>
        <span className="leading-snug">{COACH_TIPS[step.step] ?? step.subtitle}</span>
      </div>

      <div className="flex-1 space-y-5 pb-4">
        {choiceQuestions.map((q) => {
          const val = answers[q.id];
          const error = errors[q.id];
          const isMulti = q.type === 'multi-choice';
          return (
            <fieldset key={q.id} className="space-y-2.5">
              <legend className="text-[15px] font-bold leading-snug text-[#1E293B]">
                {q.label}
                {isMulti && <span className="ml-1.5 text-xs font-medium text-slate-500">(bisa pilih &gt;1)</span>}
              </legend>
              <div className={q.type === 'gender' ? 'grid grid-cols-2 gap-2.5' : 'space-y-2.5'}>
                {q.options?.map((opt) => {
                  const selected = isMulti ? Array.isArray(val) && val.includes(opt.value) : val === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => (isMulti ? toggleMulti(q.id, opt.value) : updateField(q.id, opt.value))}
                      aria-pressed={selected}
                      className={`flex min-h-[54px] w-full items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-3 text-left text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50/90 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-emerald-100/80 bg-white/90 text-[#1E293B] shadow-xs backdrop-blur-md hover:border-emerald-200'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span aria-hidden="true" className="text-base leading-none">{OPTION_ICONS[opt.value] ?? '•'}</span>
                        <span className="leading-snug">{opt.label}</span>
                      </span>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${isMulti ? 'rounded-md' : 'rounded-full'} ${selected ? (isMulti ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-emerald-600 bg-white') : 'border-slate-300 bg-white'}`}>
                        {selected && isMulti && <Check className="h-3.5 w-3.5" />}
                        {selected && !isMulti && <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {error && (
                <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /><span>{error}</span>
                </p>
              )}
            </fieldset>
          );
        })}

        {numberQuestions.length > 0 && (
          <div className="space-y-3">
            {numberQuestions.map((q) => {
              const val = answers[q.id];
              const error = errors[q.id];
              return (
                <div key={q.id} className={`rounded-2xl border bg-white/90 p-3.5 shadow-xs backdrop-blur-md ${error ? 'border-rose-300' : 'border-emerald-100/80'}`}>
                  <label htmlFor={`field-${q.id}`} className="block text-sm font-bold text-[#1E293B]">{q.label}</label>
                  <div className="mt-2 flex items-center gap-2">
                    <button type="button" onClick={() => adjustNumber(q, -1)} aria-label={`Kurangi ${q.label}`} className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-[#F4F9F7] text-slate-700 active:scale-95">
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="relative flex-1">
                      <input
                        id={`field-${q.id}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder={q.placeholder}
                        value={val === '' ? '' : String(val)}
                        onChange={(e) => { const d = e.target.value.replace(/\D/g, ''); updateField(q.id, d === '' ? '' : Number(d)); }}
                        className="min-h-[44px] w-full rounded-xl border border-emerald-100 bg-[#F4F9F7] px-3 pr-12 text-center text-base font-extrabold tabular-nums text-[#1E293B] outline-none focus:border-emerald-500 focus:bg-white"
                      />
                      {q.unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{q.unit}</span>}
                    </div>
                    <button type="button" onClick={() => adjustNumber(q, 1)} aria-label={`Tambah ${q.label}`} className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-[#F4F9F7] text-slate-700 active:scale-95">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {error && (
                    <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /><span>{error}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 mt-4 flex items-center gap-2.5 border-t border-emerald-100/80 bg-[#F4F9F7]/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <button type="button" onClick={onBack} className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-emerald-100 bg-white/90 px-4 py-3 text-sm font-bold text-slate-700 shadow-xs active:scale-[0.98]">
          <ArrowLeft className="h-4 w-4" /><span>Kembali</span>
        </button>
        <button type="button" onClick={handleNextClick} className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 active:scale-[0.98]">
          <span>{isFinalStep ? 'Lihat Hasil Analisa' : 'Lanjut'}</span><ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
