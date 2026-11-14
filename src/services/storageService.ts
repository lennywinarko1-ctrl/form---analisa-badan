import { GOOGLE_SCRIPT_WEBHOOK_URL } from '../config/appConfig';
import type { AssessmentAnswers, SubmissionPayload } from '../types/assessment';
import { buildInstagramDmUrl, normalizeIndonesianPhone } from '../utils/phoneFormatter';

const DRAFT_STORAGE_KEY = 'transformwithst_draft_v1';
const UTM_STORAGE_KEY = 'transformwithst_utm_v1';
const SUBMISSION_BACKUP_KEY = 'transformwithst_submissions_v1';
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
      const merged = { ...getUtmParams(), ...captured };
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
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ answers, stepIndex, updatedAt: new Date().toISOString() }));
  } catch {
    // Ignore storage errors
  }
}

export function loadDraft(): SavedDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedDraft>;
    if (!parsed.answers || typeof parsed.stepIndex !== 'number') return null;
    return { answers: { ...EMPTY_ANSWERS, ...parsed.answers }, stepIndex: Math.max(0, parsed.stepIndex), updatedAt: parsed.updatedAt ?? new Date().toISOString() };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(DRAFT_STORAGE_KEY); } catch { /* ignore */ }
}

function flattenForSheet(payload: SubmissionPayload): Record<string, string | number> {
  const utm = getUtmParams();
  const waNorm = payload.contact.whatsapp ? normalizeIndonesianPhone(payload.contact.whatsapp) : '';
  const { answers: a, analysis, contact } = payload;

  return {
    submittedAt: payload.submittedAt,
    appVersion: payload.appVersion,
    leadPriority: analysis.leadPriority,
    nickname: contact.nickname,
    igUsername: contact.igUsername,
    igProfileUrl: buildInstagramDmUrl(contact.igUsername),
    whatsappNormalized: waNorm,
    whatsappLink: waNorm ? `https://api.whatsapp.com/send?phone=${waNorm}` : '',
    overallScore: analysis.overallScore,
    bmi: analysis.bmi,
    bmiCategory: analysis.bmiCategory,
    proteinRange: analysis.proteinRange,
    insightsText: analysis.insights.join(' | '),
    utmSource: utm.utm_source ?? '',
    utmMedium: utm.utm_medium ?? '',
    utmCampaign: utm.utm_campaign ?? '',
    igAd: utm.ig_ad ?? '',
    goal: a.goal.join(', '),
    history: a.history,
    gender: a.gender,
    age: String(a.age),
    height_cm: String(a.height_cm),
    weight_kg: String(a.weight_kg),
    eating_out: a.eating_out,
    sugar_snacking: a.sugar_snacking,
    afternoon_energy: a.afternoon_energy,
    sleep_quality: a.sleep_quality,
    activity_level: a.activity_level,
    readiness: a.readiness,
  };
}

export async function submitToWebhook(payload: SubmissionPayload): Promise<{ ok: boolean }> {
  const flatPayload = flattenForSheet(payload);
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(SUBMISSION_BACKUP_KEY);
      const list = raw ? (JSON.parse(raw) as Record<string, string | number>[]) : [];
      list.push(flatPayload);
      window.localStorage.setItem(SUBMISSION_BACKUP_KEY, JSON.stringify(list.slice(-20)));
    } catch { /* ignore */ }
  }
  if (GOOGLE_SCRIPT_WEBHOOK_URL.trim()) {
    try {
      await fetch(GOOGLE_SCRIPT_WEBHOOK_URL.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(flatPayload),
      });
    } catch { /* never block SummaryView */ }
  }
  return { ok: true };
}
