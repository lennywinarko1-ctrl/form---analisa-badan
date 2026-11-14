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
    <div className="min-h-[100dvh] bg-[#EFE9DF] text-stone-800 sm:py-4">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-[#FAF7F2] sm:min-h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:border sm:border-stone-200/80 sm:shadow-xl sm:shadow-stone-900/5">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,#FDECE6_0%,rgba(253,236,230,0.45)_55%,transparent_80%)] sm:rounded-t-[2rem]" />
        <Header />

        <main className="relative flex flex-1 flex-col px-4 py-5">
          {screen === 'intro' && (
            <div className="space-y-4">
              <section className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <CoachAvatar size="lg" />
                  <div>
                    <p className="text-xs font-bold text-[#265345]">{COACH_NAME} • {BRAND_NAME}</p>
                    <h2 className="mt-0.5 text-balance text-xl font-extrabold leading-tight tracking-tight text-stone-800">Kenali Pola Metabolisme &amp; Kebutuhan Proteinmu dalam 90 Detik</h2>
                  </div>
                </div>
                <blockquote className="mt-4 rounded-2xl border border-[#F3D5CA] bg-[#FDF2EE] p-3.5 text-[13px] font-medium leading-relaxed text-stone-700">
                  &ldquo;Nggak perlu diet menyiksa—yuk temukan pola makan &amp; energi yang paling pas buat rutinitasmu ✨&rdquo;
                </blockquote>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-[#FAF7F2] px-3 py-1 text-xs font-bold text-stone-700"><Clock className="h-3.5 w-3.5 text-[#C96A50]" />± 90 Detik</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-[#FAF7F2] px-3 py-1 text-xs font-bold text-stone-700"><ShieldCheck className="h-3.5 w-3.5 text-[#265345]" />Gratis</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-[#FAF7F2] px-3 py-1 text-xs font-bold text-stone-700"><Sparkles className="h-3.5 w-3.5 text-[#C96A50]" />Analisa Personal</span>
                </div>
                {hasDraft && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#F3D5CA] bg-[#FDF2EE] px-3.5 py-2.5 text-xs text-stone-800">
                    <span className="font-semibold">Lanjut langkah {stepIndex + 1} dari {ASSESSMENT_STEPS.length}</span>
                    <button type="button" onClick={() => handleStartFromIntro(true)} className="inline-flex items-center gap-1 font-bold text-[#A8513A] underline underline-offset-2"><RotateCcw className="h-3.5 w-3.5" />Mulai Ulang</button>
                  </div>
                )}
                <button type="button" onClick={() => handleStartFromIntro(!hasDraft)} className="mt-5 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-[#265345] px-6 py-3 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-[#1E4337] active:scale-[0.98]">
                  <span>{hasDraft ? 'Lanjutkan Evaluasi' : 'Mulai Evaluasi Gratis'}</span><ArrowRight className="h-4 w-4 shrink-0" />
                </button>
                <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl text-xs font-semibold text-stone-600 hover:text-[#265345]">Atau tanya {COACH_NAME} dulu via WhatsApp</a>
              </section>
              <section className="rounded-3xl border border-stone-200/80 bg-white p-4 shadow-xs">
                <div className="mb-2.5 flex items-center justify-between text-xs">
                  <h3 className="font-bold text-stone-800">4 Tahap ({ASSESSMENT_QUESTIONS.length} Pertanyaan)</h3>
                  <span className="font-semibold text-stone-600">@{INSTAGRAM_USERNAME}</span>
                </div>
                <ol className="divide-y divide-stone-100">
                  {ASSESSMENT_STEPS.map((item) => (
                    <li key={item.step} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FDF2EE] text-xs font-extrabold tabular-nums text-[#A8513A]">{item.step}</span>
                      <div className="min-w-0"><p className="text-[13px] font-bold text-stone-800">{item.title}</p><p className="truncate text-xs text-stone-600">{item.subtitle}</p></div>
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

        <footer className="py-3 text-center text-xs font-medium text-stone-600">
          © {new Date().getFullYear()} {BRAND_NAME} · {COACH_NAME}
        </footer>
      </div>
    </div>
  );
}
