import { useState, type MouseEvent } from 'react';
import { Check, CheckCircle2, ChevronDown, ChevronUp, Copy, Instagram, Sparkles } from 'lucide-react';
import { BRAND_NAME, COACH_NAME, INSTAGRAM_USERNAME, WHATSAPP_NUMBER } from '../config/appConfig';
import { trackContactClick } from '../services/analyticsService';
import type { AnalysisResult, AssessmentAnswers, ContactInfo } from '../types/assessment';
import { formatIgDmSummary, formatWhatsAppSummary } from '../utils/assessmentAnalyzer';
import { buildInstagramDmUrl, buildWhatsAppUrl, detectIsMobileDevice, openInstagramAppWithFallback } from '../utils/phoneFormatter';
import { AnswerRecap } from './AnswerRecap';
import { CoachAvatar } from './CoachAvatar';

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
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (analysis.overallScore / 100) * circumference;

  const subScoreItems = [
    { label: 'Nutrisi', value: analysis.subScores.nutrition },
    { label: 'Energi', value: analysis.subScores.energy },
    { label: 'Tidur', value: analysis.subScores.recovery },
    { label: 'Aktivitas', value: analysis.subScores.activity },
  ];

  const copyDmText = () => {
    setShowDmBox(true);
    try {
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(dmSummaryText).then(() => setDmCopied(true)).catch(() => setShowDmBox(true));
        setDmCopied(true);
      }
    } catch {
      setShowDmBox(true);
    }
  };

  const handleInstagramClick = (e: MouseEvent<HTMLAnchorElement>) => {
    trackContactClick('instagram_dm');
    copyDmText();
    if (isMobile && openInstagramAppWithFallback(INSTAGRAM_USERNAME)) e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-gradient-to-br from-[#244C40] via-[#265345] to-[#1D3E33] p-5 text-white shadow-md shadow-stone-900/10">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#F3D5CA]">Evaluasi Personal • {BRAND_NAME}</p>
            <h2 className="truncate text-lg font-extrabold tracking-tight text-white">Hasil untuk {contact.nickname}</h2>
          </div>
          <CoachAvatar size="sm" />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <linearGradient id="scoreRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8A88A" />
                  <stop offset="100%" stopColor="#FDF2EE" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="8" />
              <circle cx="50" cy="50" r={radius} fill="none" stroke="url(#scoreRingGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold tabular-nums text-white">{analysis.overallScore}<span className="text-xs font-semibold text-[#F3D5CA]">/100</span></span>
              <span className="text-[10px] font-semibold text-[#F3D5CA]">Skor Gaya Hidup</span>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
              <p className="text-[11px] font-medium text-[#F3D5CA]">BMI Kamu</p>
              <p className="text-base font-extrabold tabular-nums text-white">{analysis.bmi} <span className="text-xs font-semibold text-[#FDF2EE]">• {analysis.bmiCategory}</span></p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
              <p className="text-[11px] font-medium text-[#F3D5CA]">Estimasi Protein</p>
              <p className="text-sm font-extrabold tabular-nums text-white">{analysis.proteinRange}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
        <p className="mb-3 text-[15px] font-bold text-stone-800">Rincian 4 Pilar Kebiasaan</p>
        <div className="space-y-3">
          {subScoreItems.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span className="font-semibold text-stone-700">{item.label}</span>
                <span className="font-bold tabular-nums text-[#265345]">{item.value}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-gradient-to-r from-[#265345] to-[#C96A50]" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C96A50]" />
          <h3 className="text-[15px] font-bold text-stone-800">Temuan Utama {COACH_NAME}</h3>
        </div>
        <ul className="space-y-2.5">
          {analysis.insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2.5 rounded-2xl border border-[#F3D5CA] bg-[#FDF2EE] p-3.5 text-[14px] leading-relaxed text-stone-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#265345]" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
        <h3 className="text-base font-extrabold text-stone-800">Pilih Cara Konsultasi yang Nyaman Buat Kamu</h3>
        <div className="mt-3.5 space-y-2.5">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick('whatsapp')} className="flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl bg-[#059669] px-4 py-3 text-white shadow-xs transition-colors hover:bg-[#047857] active:scale-[0.99]">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6 shrink-0">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.77 14.01c-.24.68-1.42 1.3-1.97 1.38-.5.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.03-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.58.83 2.02.9 2.17.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.37 1.46.3.15.47.13.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.34.08.13.08.73-.16 1.41z" />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">Chat {COACH_NAME} via WhatsApp</p>
              <p className="mt-0.5 text-xs text-emerald-50">Kirim hasil &amp; diskusi gratis 15 menit</p>
            </div>
          </a>

          <a href={igDmUrl} target="_blank" rel="noopener noreferrer" onClick={handleInstagramClick} className="flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl border border-[#EABEB0] bg-gradient-to-r from-[#FDF2EE] to-[#FCE7E1] px-4 py-3 text-stone-800 shadow-xs transition-opacity hover:opacity-95 active:scale-[0.99]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#C96A50] via-rose-500 to-amber-500 text-white">
              <Instagram className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight text-stone-800">DM Instagram @{INSTAGRAM_USERNAME}</p>
              <p className="mt-0.5 text-xs text-stone-600">
                {isMobile ? 'Buka aplikasi Instagram & otomatis salin ringkasan DM' : 'Buka profil Instagram Web — klik Message lalu Paste ringkasan'}
              </p>
            </div>
          </a>
        </div>

        {dmCopied && (
          <div role="status" className="mt-3 flex items-center gap-2 rounded-2xl border border-[#F3D5CA] bg-[#FDF2EE] px-3.5 py-2.5 text-xs font-semibold text-[#265345]">
            <Check className="h-4 w-4 shrink-0 text-[#265345]" />
            <span>Ringkasan tersalin! Tinggal Paste &amp; Kirim di DM Instagram {COACH_NAME}.</span>
          </div>
        )}

        <div className="mt-3">
          <button type="button" onClick={() => setShowDmBox((prev) => !prev)} className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-bold text-[#265345] hover:text-[#1E4337]">
            <span>Lihat / Salin Teks DM</span>
            {showDmBox ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showDmBox && (
            <div className="mt-1 rounded-2xl border border-stone-200/80 bg-[#FAF7F2] p-3">
              {!isMobile && (
                <p className="mb-2 text-xs text-stone-600">Klik &ldquo;Salin Teks&rdquo; di bawah, lalu tekan tombol Message di profil Instagram {COACH_NAME}.</p>
              )}
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-stone-800 select-all">{dmSummaryText}</pre>
              <button type="button" onClick={copyDmText} className="mt-2 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-bold text-[#265345] shadow-xs transition-colors hover:bg-[#265345] hover:text-white">
                <Copy className="h-3.5 w-3.5" /><span>{dmCopied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <AnswerRecap answers={answers} onReset={onReset} />

      <p className="px-2 text-center text-xs leading-relaxed text-stone-600">
        Catatan: Evaluasi ini bersifat edukasi gaya hidup &amp; nutrisi oleh {COACH_NAME}, bukan diagnosis medis.
      </p>
    </div>
  );
}
