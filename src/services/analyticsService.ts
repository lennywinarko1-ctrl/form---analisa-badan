import type { LeadPriority } from '../types/assessment';

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[][];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: unknown;
    gtag?: (...args: unknown[]) => void;
  }
}

export type ContactChannel = 'whatsapp' | 'instagram_dm' | 'header_whatsapp';

function safeFbq(...args: unknown[]): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq(...args);
    }
  } catch {
    // Ignore when blocked by ad blockers or restricted WebViews
  }
}

function safeGtag(...args: unknown[]): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag(...args);
    }
  } catch {
    // Ignore when GA4 is not loaded or blocked
  }
}

export function initAnalytics(pixelId: string): void {
  if (typeof window === 'undefined' || !pixelId.trim()) return;
  try {
    if (!window.fbq) {
      const fbqFn = ((...args: unknown[]) => {
        if (fbqFn.callMethod) {
          fbqFn.callMethod(...args);
        } else {
          fbqFn.queue?.push(args);
        }
      }) as NonNullable<Window['fbq']>;
      fbqFn.queue = [];
      fbqFn.loaded = true;
      fbqFn.version = '2.0';
      fbqFn.push = (...args: unknown[]) => fbqFn(...args);
      window.fbq = fbqFn;
      if (!window._fbq) window._fbq = fbqFn;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head?.appendChild(script);
    }
    safeFbq('init', pixelId.trim());
    safeFbq('track', 'PageView');
  } catch {
    // Ignore script injection errors in restricted environments
  }
}

export function trackAssessmentStart(): void {
  safeFbq('trackCustom', 'AssessmentStart');
  safeFbq('track', 'ViewContent', { content_name: 'transformwithST Health Assessment' });
  safeGtag('event', 'assessment_start');
  safeGtag('event', 'view_item', { item_name: 'transformwithST Health Assessment' });
}

export function trackStepComplete(stepNumber: number, stepTitle: string): void {
  safeFbq('trackCustom', 'StepComplete', { step_number: stepNumber, step_title: stepTitle });
  safeGtag('event', 'step_complete', { step_number: stepNumber, step_title: stepTitle });
}

export function trackLeadSubmitted(leadPriority: LeadPriority, hasWhatsapp: boolean): void {
  safeFbq('track', 'Lead', { content_category: leadPriority, has_whatsapp: hasWhatsapp });
  safeGtag('event', 'generate_lead', { lead_priority: leadPriority, has_whatsapp: hasWhatsapp });
}

export function trackContactClick(channel: ContactChannel): void {
  safeFbq('track', 'Contact', { channel });
  safeGtag('event', 'contact_click', { channel });
}
