import { useEffect, useState } from 'react';
import { ArrowRight, Clock, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { ContactGate } from './components/ContactGate';
import { FormStep } from './components/FormStep';
import { Header } from './components/Header';
import { SummaryView } from './components/SummaryView';
import { APP_VERSION, COACH_NAME, INSTAGRAM_USERNAME, buildWhatsAppUrl } from './config/appConfig';
import { ASSESSMENT_QUESTIONS, ASSESSMENT_STEPS } from './data/questions';
import { EMPTY_ANSWERS, captureUtmParams, clearDraft, getUtmParams, loadDraft, saveDraft, submitToWebhook } from './services/storageService';
import type { AnalysisResult, AssessmentAnswers, ContactInfo } from './types/assessment';
import { analyzeAssessment } from './utils/assessmentAnalyzer';

type ScreenState = 'intro' | 'form' | 'gate' | 'summary';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>(EMPTY_ANSWERS);
  const [hasDraft, setHasDraft] = useState(false);
  const [contact, setContact] = useState<ContactInfo | undefined>(undefined);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    captureUtmParams();
    const saved = loadDraft();
    if (saved) {
      setAnswers(saved.answers);
      setStepIndex(Math.min(saved.stepIndex, ASSESSMENT_STEPS.length - 1));
      setHasDraft(true);
    }
  }, []);

  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: value };
      saveDraft(updated, stepIndex);
      setHasDraft(true);
      return updated;
    });
  };

  const resetTo = (target: ScreenState) => {
    clearDraft();
    setAnswers(EMPTY_ANSWERS);
    setStepIndex(0);
    setHasDraft(false);
    setAnalysis(null);
    setScreen(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (stepIndex < ASSESSMENT_STEPS.length - 1) {
      const nextStep = stepIndex + 1;
      setStepIndex(nextStep);
      saveDraft(answers, nextStep);
    } else {
      saveDraft(answers, stepIndex);
      setScreen('gate');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      const prevStep = stepIndex - 1;
      setStepIndex(prevStep);
      saveDraft(answers, prevStep);
    } else {
      setScreen('intro');
    }
  };

  const handleContactSubmit = async (contactInfo: ContactInfo) => {
    setIsSubmitting(true);
    try {
      const result = analyzeAssessment(answers);
      setContact(contactInfo);
      setAnalysis(result);
      if (!contactInfo.honeypot?.trim()) {
        const utm = getUtmParams();
        const source = utm.utm_source || utm.ig_ad ? 'instagram-bio' : 'direct';
        await submitToWebhook({ submittedAt: new Date().toISOString(), appVersion: APP_VERSION, contact: contactInfo, answers, analysis: result, source });
      }
      clearDraft();
      setHasDraft(false);
      setScreen('summary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#FAFBF9] text-[#1E293B]">
      <Header />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-10">
        {screen === 'intro' && (
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
              <p className="mb-3 text-xs font-semibold tracking-wide text-[#059669]">Evaluasi Mandiri · {ASSESSMENT_QUESTIONS.length} Pertanyaan Singkat</p>
              <h2 className="text-balance text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">Cek Skor Metabolisme &amp; Pola Makanmu dalam 90 Detik</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Jawab pertanyaan singkat seputar target tubuh, pola makan, energi sore, dan tidurmu untuk mendapat gambaran skor gaya hidup dari {COACH_NAME}.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 border-y border-slate-100 py-4 text-xs text-slate-600 sm:grid-cols-3">
                <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#059669]" />Durasi ± 90 detik</span>
                <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#059669]" />Hasil personal instan</span>
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#059669]" />Gratis &amp; privat</span>
              </div>
              {hasDraft && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#059669]/20 bg-[#ECFDF5] px-4 py-3 text-xs text-[#065F46]">
                  <span className="font-medium">Lanjutkan pengisian sebelumnya (Langkah {stepIndex + 1} dari {ASSESSMENT_STEPS.length})</span>
                  <button type="button" onClick={() => resetTo('form')} className="inline-flex items-center gap-1 font-semibold text-[#059669] underline underline-offset-2"><RotateCcw className="h-3.5 w-3.5" />Mulai Ulang</button>
                </div>
              )}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={hasDraft ? () => setScreen('form') : () => resetTo('form')} className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#059669] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#047857] active:scale-[0.98] sm:w-auto">
                  <span>{hasDraft ? 'Lanjutkan Evaluasi' : 'Mulai Evaluasi Gratis'}</span><ArrowRight className="h-4 w-4 shrink-0" />
                </button>
                <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center justify-center rounded-2xl px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100">Atau tanya {COACH_NAME} dulu via WA</a>
              </div>
            </section>
            <aside className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 lg:col-span-5">
              <h3 className="text-sm font-bold">4 Tahap Evaluasi Singkat</h3>
              <p className="mt-1 text-xs text-slate-500">Dirancang ringan untuk bio @{INSTAGRAM_USERNAME}.</p>
              <ol className="mt-4 divide-y divide-slate-100">
                {ASSESSMENT_STEPS.map((item) => (
                  <li key={item.step} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-xs font-bold tabular-nums text-[#059669]">{item.step}</span>
                    <div className="min-w-0"><p className="text-sm font-semibold">{item.title}</p><p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.subtitle}</p></div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        )}
        {screen === 'form' && (
          <FormStep step={ASSESSMENT_STEPS[stepIndex]} stepIndex={stepIndex} totalSteps={ASSESSMENT_STEPS.length} answers={answers} onChange={handleAnswerChange} onNext={handleNext} onBack={handleBack} />
        )}
        {screen === 'gate' && (
          <ContactGate initialContact={contact} isSubmitting={isSubmitting} onSubmit={handleContactSubmit} onBack={() => setScreen('form')} />
        )}
        {screen === 'summary' && contact && analysis && (
          <SummaryView contact={contact} answers={answers} analysis={analysis} onReset={() => resetTo('intro')} />
        )}
      </main>
      <footer className="border-t border-slate-200/70 py-4 text-center text-xs text-slate-400">© {new Date().getFullYear()} transformwithST · {COACH_NAME}</footer>
    </div>
  );
}
