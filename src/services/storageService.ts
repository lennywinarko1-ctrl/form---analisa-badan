import type { AssessmentAnswers, SubmissionPayload } from '../types/assessment';

const DRAFT_STORAGE_KEY = 'transformwithst_draft_v1';
const UTM_STORAGE_KEY = 'transformwithst_utm_v1';
const SUBMISSION_BACKUP_KEY = 'transformwithst_submissions_backup_v1';

const TRACKED_UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'ig_ad', 'ref'] as const;

export interface SavedDraft {
  answers: AssessmentAnswers;
  stepIndex: number;
  updatedAt: string;
}

export type UtmParams = Partial<Record<(typeof TRACKED_UTM_KEYS)[number], string>>;

export const EMPTY_ANSWERS: AssessmentAnswers = {
  goal: [],
  history: '',
  gender: '',
  age: '',
  height_cm: '',
  weight_kg: '',
  eating_out: '',
  sugar_snacking: '',
  afternoon_energy: '',
  sleep_quality: '',
  activity_level: '',
  readiness: '',
};

export function captureUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const captured: UtmParams = {};
    for (const key of TRACKED_UTM_KEYS) {
      const value = params.get(key)?.trim();
      if (value) captured[key] = value;
    }
    if (Object.keys(captured).length > 0) {
      const existing = getUtmParams();
      const merged = { ...existing, ...captured };
      window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return getUtmParams();
  } catch {
    return {};
  }
}

export function getUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(UTM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

export function saveDraft(answers: AssessmentAnswers, stepIndex: number): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: SavedDraft = {
      answers,
      stepIndex,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or private-browsing errors in IG WebView
  }
}

export function loadDraft(): SavedDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedDraft>;
    if (!parsed.answers || typeof parsed.stepIndex !== 'number') return null;
    return {
      answers: { ...EMPTY_ANSWERS, ...parsed.answers },
      stepIndex: Math.max(0, parsed.stepIndex),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export async function submitToWebhook(payload: SubmissionPayload): Promise<{ ok: boolean }> {
  console.info('[transformwithST] Webhook stub payload:', payload);
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(SUBMISSION_BACKUP_KEY);
      const list = raw ? (JSON.parse(raw) as SubmissionPayload[]) : [];
      list.push(payload);
      window.localStorage.setItem(SUBMISSION_BACKUP_KEY, JSON.stringify(list.slice(-10)));
    } catch {
      // Ignore storage errors
    }
  }
  return { ok: true };
}
