import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { ASSESSMENT_QUESTIONS, ASSESSMENT_STEPS } from '../data/questions';
import type { AssessmentAnswers, Question } from '../types/assessment';

interface AnswerRecapProps {
  answers: AssessmentAnswers;
  onReset: () => void;
}

function formatAnswerValue(q: Question, answers: AssessmentAnswers): string {
  const val = answers[q.id];
  if (Array.isArray(val)) {
    if (val.length === 0) return '-';
    return val
      .map((item) => q.options?.find((o) => o.value === item)?.label ?? item)
      .join(', ');
  }
  if (q.type === 'number') {
    return val === '' ? '-' : `${val}${q.unit ? ` ${q.unit}` : ''}`;
  }
  if (!val) return '-';
  return q.options?.find((o) => o.value === val)?.label ?? String(val);
}

export function AnswerRecap({ answers, onReset }: AnswerRecapProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-3xl border border-stone-200/80 bg-white shadow-xs">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-3xl px-5 py-3.5 text-left text-sm font-bold text-stone-800 transition-colors hover:bg-[#FAF7F2]/80"
      >
        <span>Lihat Ringkasan 12 Jawaban Saya</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-stone-600" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-stone-600" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-stone-200/70 px-5 pb-5 pt-4">
          <div className="space-y-4">
            {ASSESSMENT_STEPS.map((step) => {
              const stepQuestions = ASSESSMENT_QUESTIONS.filter((q) => q.step === step.step);
              return (
                <div key={step.step}>
                  <h4 className="mb-2 text-xs font-bold text-[#265345]">
                    Tahap {step.step} · {step.title}
                  </h4>
                  <dl className="divide-y divide-stone-200/70 rounded-2xl border border-stone-200/70 bg-[#FAF7F2] px-3.5">
                    {stepQuestions.map((q) => (
                      <div key={q.id} className="py-2.5">
                        <dt className="text-xs text-stone-600">{q.label}</dt>
                        <dd className="mt-0.5 text-[13px] font-semibold text-stone-800">
                          {formatAnswerValue(q, answers)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onReset}
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-[#FAF7F2] hover:text-stone-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Ulangi Evaluasi</span>
          </button>
        </div>
      )}
    </section>
  );
}
