import { useEffect, useState } from 'react';
import { ArrowRight, Clock, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { CoachAvatar } from './components/CoachAvatar';
import { ContactGate } from './components/ContactGate';
import { FormStep } from './components/FormStep';
import { Header } from './components/Header';
import { SummaryView } from './components/SummaryView';
import { APP_VERSION, BRAND_NAME, COACH_NAME, INSTAGRAM_USERNAME, META_PIXEL_ID, buildWhatsAppUrl } from './config/appConfig';
import { ASSESSMENT_QUESTIONS, ASSESSMENT_STEPS } from './data/questions';
import { initAnalytics, trackAssessmentStart, trackLeadSubmitted, trackStepComplete } from './services/analyticsService';
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
    initAnalytics(META_PIXEL_ID);
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

  const handleStartFromIntro = (fresh: boolean) => {
    trackAssessmentStart();
    if (fresh) resetTo('form');
    else { setScreen('form'); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const handleNext = () => {
    const currentStep = ASSESSMENT_STEPS[stepIndex];
    trackStepComplete(currentStep.step, currentStep.title);
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
    } else setScreen('intro');
  };

  const handleContactSubmit = async (contactInfo: ContactInfo) => {
    setIsSubmitting(true);
    try {
      const result = analyzeAssessment(answers);
      setContact(contactInfo);
      setAnalysis(result);
      if (!contactInfo.honeypot?.trim()) {
        trackLeadSubmitted(result.leadPriority, Boolean(contactInfo.whatsapp?.trim()));
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
    <div className="min-h-[100dvh] bg-[#E8F1ED] text-[#1E293B] sm:py-4">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-[#F4F9F7] sm:min-h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:border sm:border-emerald-100/90 sm:shadow-xl sm:shadow-emerald-950/5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.16),rgba(20,184,166,0.06)_55%,transparent_80%)] sm:rounded-t-[2rem]" />
        <Header />

        <main className="relative flex flex-1 flex-col px-4 py-5">
          {screen === 'intro' && (
            <div className="space-y-4">
              <section className="rounded-3xl border border-emerald-100/80 bg-white/90 p-5 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3.5">
                  <CoachAvatar size="lg" />
                  <div>
                    <p className="text-xs font-bold text-emerald-700">{COACH_NAME} • {BRAND_NAME}</p>
                    <h2 className="mt-0.5 text-balance text-xl font-extrabold leading-tight tracking-tight text-[#1E293B]">Cek Skor Metabolisme &amp; Nutrisi Tubuhmu</h2>
                  </div>
                </div>
                <blockquote className="mt-4 rounded-2xl bg-[#F4F9F7] p-3.5 text-xs font-medium leading-relaxed text-slate-700">
                  &ldquo;Yuk cek kondisi metabolisme &amp; kebutuhan proteinmu dalam 90 detik—biar nggak salah langkah lagi!&rdquo;
                </blockquote>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800"><Clock className="h-3.5 w-3.5 text-emerald-600" />± 90 Detik</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />Gratis</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800"><Sparkles className="h-3.5 w-3.5 text-emerald-600" />Analisa Personal</span>
                </div>
                {hasDraft && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 text-xs text-emerald-900">
                    <span className="font-semibold">Lanjut langkah {stepIndex + 1} dari {ASSESSMENT_STEPS.length}</span>
                    <button type="button" onClick={() => handleStartFromIntro(true)} className="inline-flex items-center gap-1 font-bold text-emerald-700 underline underline-offset-2"><RotateCcw className="h-3.5 w-3.5" />Mulai Ulang</button>
                  </div>
                )}
                <button type="button" onClick={() => handleStartFromIntro(!hasDraft)} className="mt-5 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/25 transition-all active:scale-[0.98]">
                  <span>{hasDraft ? 'Lanjutkan Evaluasi' : 'Mulai Evaluasi Gratis'}</span><ArrowRight className="h-4 w-4 shrink-0" />
                </button>
                <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-[40px] w-full items-center justify-center rounded-xl text-xs font-semibold text-slate-500 hover:text-emerald-700">Atau tanya {COACH_NAME} dulu via WhatsApp</a>
              </section>
              <section className="rounded-3xl border border-emerald-100/80 bg-white/90 p-4 shadow-xs backdrop-blur-md">
                <div className="mb-2.5 flex items-center justify-between text-xs">
                  <h3 className="font-bold text-[#1E293B]">4 Tahap ({ASSESSMENT_QUESTIONS.length} Pertanyaan)</h3>
                  <span className="font-medium text-slate-400">@{INSTAGRAM_USERNAME}</span>
                </div>
                <ol className="divide-y divide-emerald-50">
                  {ASSESSMENT_STEPS.map((item) => (
                    <li key={item.step} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-extrabold tabular-nums text-emerald-700">{item.step}</span>
                      <div className="min-w-0"><p className="text-xs font-bold text-[#1E293B]">{item.title}</p><p className="truncate text-[11px] text-slate-500">{item.subtitle}</p></div>
                    </li>
                  ))}
                </ol>
              </section>
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

        <footer className="py-3 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} {BRAND_NAME} · {COACH_NAME}
        </footer>
      </div>
    </div>
  );
}
