import { useState, type MouseEvent } from 'react';
import { Check, CheckCircle2, ChevronDown, ChevronUp, Copy, Instagram, Sparkles } from 'lucide-react';
import { BRAND_NAME, COACH_NAME, INSTAGRAM_USERNAME, WHATSAPP_NUMBER } from '../config/appConfig';
import type { AnalysisResult, AssessmentAnswers, ContactInfo } from '../types/assessment';
import { formatIgDmSummary, formatWhatsAppSummary } from '../utils/assessmentAnalyzer';
import { buildInstagramDmUrl, buildWhatsAppUrl, detectIsMobileDevice, openInstagramAppWithFallback } from '../utils/phoneFormatter';
import { AnswerRecap } from './AnswerRecap';

interface SummaryViewProps {
  contact: ContactInfo;
  answers: AssessmentAnswers;
  analysis: AnalysisResult;
  onReset: () => void;
}

export function SummaryView({ contact, answers, analysis, onReset }: SummaryViewProps) {
  const [isMobile] = useState(() => detectIsMobileDevice());
  const [dmCopied, setDmCopied] = useState(false);
  const [showDmBox, setShowDmBox] = useState(() => !detectIsMobileDevice());

  const waUrl = buildWhatsAppUrl(WHATSAPP_NUMBER, formatWhatsAppSummary(contact, answers, analysis));
  const igDmUrl = buildInstagramDmUrl(INSTAGRAM_USERNAME);
  const dmSummaryText = formatIgDmSummary(contact, answers, analysis);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (analysis.overallScore / 100) * circumference;

  const subScoreItems = [
    { label: 'Nutrisi', value: analysis.subScores.nutrition },
    { label: 'Energi & Fokus', value: analysis.subScores.energy },
    { label: 'Tidur & Pemulihan', value: analysis.subScores.recovery },
    { label: 'Aktivitas Fisik', value: analysis.subScores.activity },
  ];

  const copyDmText = () => {
    setShowDmBox(true);
    try {
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard
          .writeText(dmSummaryText)
          .then(() => setDmCopied(true))
          .catch(() => setShowDmBox(true));
        setDmCopied(true);
      }
    } catch {
      setShowDmBox(true);
    }
  };

  const handleInstagramClick = (e: MouseEvent<HTMLAnchorElement>) => {
    copyDmText();
    if (isMobile && openInstagramAppWithFallback(INSTAGRAM_USERNAME)) {
      e.preventDefault();
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <header className="px-1">
        <h2 className="text-balance text-2xl font-extrabold tracking-tight text-[#1E293B]">Hasil Analisa untuk {contact.nickname}</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">Evaluasi Personal • {BRAND_NAME} oleh {COACH_NAME}</p>
      </header>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#059669" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold tabular-nums text-[#1E293B]">{analysis.overallScore}</span>
              <span className="text-[11px] font-semibold text-slate-400">dari 100</span>
            </div>
          </div>

          <div className="w-full flex-1">
            <p className="mb-3 text-sm font-bold text-[#1E293B]">Skor Gaya Hidup &amp; Metabolisme</p>
            <div className="space-y-2.5">
              {subScoreItems.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="font-bold tabular-nums text-[#1E293B]">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#059669]" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <p className="text-xs font-medium text-slate-500">BMI Kamu</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#1E293B]">{analysis.bmi}</p>
          <span className="mt-2 inline-block rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-semibold text-[#059669]">
            {analysis.bmiCategory}
          </span>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <p className="text-xs font-medium text-slate-500">Estimasi Protein Harian</p>
          <p className="mt-1 text-lg font-extrabold tabular-nums text-[#1E293B] sm:text-xl">
            {analysis.proteinRange}
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-slate-500">Bantu jaga massa otot &amp; kenyang lebih lama</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#059669]" />
          <h3 className="text-sm font-bold text-[#1E293B]">Temuan Utama {COACH_NAME}</h3>
        </div>
        <ul className="space-y-2.5">
          {analysis.insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2.5 rounded-2xl bg-[#FAFBF9] p-3.5 text-sm leading-relaxed text-slate-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-[#059669]/20 bg-[#ECFDF5]/60 p-5 sm:p-6">
        <h3 className="text-base font-extrabold text-[#1E293B]">Pilih Cara Konsultasi yang Nyaman Buat Kamu</h3>
        <div className="mt-4 space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl bg-[#059669] px-4 py-3 text-white shadow-sm transition-all hover:bg-[#047857] active:scale-[0.99]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6 shrink-0">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.77 14.01c-.24.68-1.42 1.3-1.97 1.38-.5.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.03-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.58.83 2.02.9 2.17.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.37 1.46.3.15.47.13.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.34.08.13.08.73-.16 1.41z" />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">Chat {COACH_NAME} via WhatsApp</p>
              <p className="mt-0.5 text-xs text-emerald-50">Kirim hasil &amp; diskusi gratis 15 menit</p>
            </div>
          </a>

          <a
            href={igDmUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInstagramClick}
            className="flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[#1E293B] shadow-xs transition-all hover:border-slate-300 active:scale-[0.99]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white">
              <Instagram className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">DM Instagram @{INSTAGRAM_USERNAME}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {isMobile
                  ? 'Buka aplikasi Instagram & otomatis salin ringkasan DM'
                  : 'Buka profil Instagram Web — klik Message lalu Paste ringkasan'}
              </p>
            </div>
          </a>
        </div>

        {dmCopied && (
          <div role="status" className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-medium text-[#065F46]">
            <Check className="h-4 w-4 shrink-0 text-[#059669]" />
            <span>Ringkasan tersalin! Tinggal Paste &amp; Kirim di DM Instagram {COACH_NAME}.</span>
          </div>
        )}

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowDmBox((prev) => !prev)}
            className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-[#059669] hover:text-[#047857]"
          >
            <span>Lihat / Salin Teks DM</span>
            {showDmBox ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showDmBox && (
            <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3">
              {!isMobile && (
                <p className="mb-2 text-[11px] text-slate-500">
                  Klik &ldquo;Salin Teks&rdquo; di bawah, lalu tekan tombol Message di profil Instagram {COACH_NAME}.
                </p>
              )}
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700 select-all">
                {dmSummaryText}
              </pre>
              <button
                type="button"
                onClick={copyDmText}
                className="mt-2 inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-[#ECFDF5] px-3 py-1.5 text-xs font-semibold text-[#059669] hover:bg-[#059669] hover:text-white"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{dmCopied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <AnswerRecap answers={answers} onReset={onReset} />

      <p className="px-2 text-center text-[11px] leading-relaxed text-slate-400">
        Catatan: Evaluasi ini bersifat edukasi gaya hidup &amp; nutrisi oleh {COACH_NAME}, bukan diagnosis medis.
      </p>
    </div>
  );
}
