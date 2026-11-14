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

export function FormStep({ step, stepIndex, totalSteps, answers, onChange, onNext, onBack }: FormStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const questions = ASSESSMENT_QUESTIONS.filter((q) => q.step === step.step);
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);
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
    const next = current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue];
    updateField(id, next);
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
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onNext();
  };

  const numberQuestions = questions.filter((q) => q.type === 'number');
  const choiceQuestions = questions.filter((q) => q.type !== 'number');

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">
          <span className="truncate">Langkah {stepIndex + 1} dari {totalSteps} • {step.title}</span>
          <span className="shrink-0 tabular-nums text-[#059669]">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
          <div className="h-full rounded-full bg-[#059669] transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">{step.subtitle}</p>
      </div>

      <div className="space-y-6">
        {choiceQuestions.map((q) => {
          const val = answers[q.id];
          const error = errors[q.id];
          const isMulti = q.type === 'multi-choice';
          return (
            <fieldset key={q.id} className="space-y-2.5">
              <legend className="text-base font-bold leading-snug text-[#1E293B]">
                {q.label}
                {isMulti && <span className="ml-1.5 text-xs font-medium text-slate-500">(bisa pilih lebih dari 1)</span>}
              </legend>
              <div className={q.type === 'gender' ? 'grid grid-cols-2 gap-3' : 'space-y-2.5'}>
                {q.options?.map((opt) => {
                  const selected = isMulti ? Array.isArray(val) && val.includes(opt.value) : val === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => (isMulti ? toggleMulti(q.id, opt.value) : updateField(q.id, opt.value))}
                      aria-pressed={selected}
                      className={`flex min-h-[50px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-150 active:scale-[0.99] ${
                        selected ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46] shadow-xs' : 'border-slate-200 bg-white text-[#1E293B] hover:border-slate-300'
                      }`}
                    >
                      <span className="leading-snug">{opt.label}</span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${isMulti ? 'rounded-md' : 'rounded-full'} ${
                          selected ? (isMulti ? 'border-[#059669] bg-[#059669] text-white' : 'border-[#059669] bg-white') : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selected && isMulti && <Check className="h-3.5 w-3.5" />}
                        {selected && !isMulti && <span className="h-2.5 w-2.5 rounded-full bg-[#059669]" />}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {numberQuestions.map((q) => {
              const val = answers[q.id];
              const error = errors[q.id];
              return (
                <div key={q.id} className={`rounded-2xl border bg-white p-4 ${error ? 'border-rose-300' : 'border-slate-200/80'}`}>
                  <label htmlFor={`field-${q.id}`} className="block text-sm font-semibold text-[#1E293B]">{q.label}</label>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustNumber(q, -1)}
                      aria-label={`Kurangi ${q.label}`}
                      className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-[#FAFBF9] text-slate-700 hover:bg-slate-100 active:scale-95"
                    >
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
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          updateField(q.id, digits === '' ? '' : Number(digits));
                        }}
                        className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-[#FAFBF9] px-3 pr-12 text-center text-base font-bold tabular-nums text-[#1E293B] outline-none focus:border-[#059669] focus:bg-white"
                      />
                      {q.unit && (
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                          {q.unit}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => adjustNumber(q, 1)}
                      aria-label={`Tambah ${q.label}`}
                      className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-[#FAFBF9] text-slate-700 hover:bg-slate-100 active:scale-95"
                    >
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

      <div className="mt-8 flex items-center gap-3 border-t border-slate-200/80 pt-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" /><span>Kembali</span>
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#059669] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#047857] active:scale-[0.98]"
        >
          <span>{isFinalStep ? 'Lihat Hasil Analisa' : 'Lanjut'}</span><ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
