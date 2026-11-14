# Changelog

All notable changes to the **transformwithST** health assessment web application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-11-14

### Changed
- **60-30-10 Warm Wellness Palette** (`index.html`, `src/index.css`, `src/App.tsx`, `src/config/appConfig.ts`): Bumped `APP_VERSION` to `1.1.1` and shifted from ice-mint/emerald to a warm ivory canvas (`#FAF7F2`), soft peach-blush top ambient glow (`#FDECE6`), crisp white cards (`border-stone-200/80`), deep muted sage primary anchor (`#265345`), and soft blush/terracotta accents (`#FDF2EE`, `#C96A50`, `#F3D5CA`).
- **Readability for Indonesian Women Aged 20–60** (`src/App.tsx`, `src/components/FormStep.tsx`, `src/components/ContactGate.tsx`, `src/components/SummaryView.tsx`, `src/components/AnswerRecap.tsx`): Upgraded question option labels and inputs to `text-[15px]` (`font-medium`), raised helper/caption contrast to `text-stone-600`, and updated intro hero headline and Coach Vera quote card.
- **Coach Brand & Form Polish** (`src/components/CoachAvatar.tsx`, `src/components/Header.tsx`, `src/components/FormStep.tsx`, `src/components/ContactGate.tsx`): Updated avatar ring to sage-to-terracotta gradient, kept header WhatsApp pill in recognizable WhatsApp emerald (`#059669`), styled Coach Vera Tip micro-bubble and selected choice cards with `#FDF2EE` / `#265345`, and refined `44px` numeric steppers and warm ivory sticky thumb bar.
- **Editorial Summary Card & Dual Consultation CTAs** (`src/components/SummaryView.tsx`): Styled the summary hero card in deep muted sage (`#244C40`) with a champagne-to-blush SVG score ring, sage-to-terracotta sub-score bars, blush insight cards, recognizable WhatsApp emerald primary CTA, and warm blush/rose-terracotta Instagram DM CTA.

## [1.1.0] - 2026-11-14

### Added
- `src/components/CoachAvatar.tsx`: Reusable circular Coach Vera avatar with emerald gradient ring, active indicator dot, and graceful `"CV"` initials fallback when `/coach-vera.webp` is absent.
- `COACH_AVATAR_URL` config constant and `APP_VERSION = '1.1.0'` in `src/config/appConfig.ts`.

### Changed
- **Visual Theme & Mobile App Shell** (`index.html`, `src/index.css`, `src/App.tsx`): Adopted `Plus Jakarta Sans` (400–800) globally, ice-mint `#F4F9F7` canvas with ambient emerald/teal top glow, frosted glass cards, and a centered `max-w-[430px]` elevated phone frame on desktop.
- **Personal Brand Header & Intro** (`src/components/Header.tsx`, `src/App.tsx`): Integrated `CoachAvatar`, Coach Vera quote card, 3 benefit pills (`± 90 Detik`, `Gratis`, `Analisa Personal`), and gradient CTA button.
- **Tactile Form UX** (`src/components/FormStep.tsx`): Added 4-segment pill progress bar, `"Coach Vera Tip"` micro-bubble, icon-enhanced tactile choice cards with emerald glow ring, and sticky thumb-zone bottom navigation with safe-area padding.
- **ContactGate & Summary Hero** (`src/components/ContactGate.tsx`, `src/components/SummaryView.tsx`): Added `CoachAvatar` conversational prompt + locked-score pill in `ContactGate`, and upgraded `SummaryView` with an emerald-to-teal gradient hero card, tabular SVG score ring, and glass `BMI` / `Estimasi Protein` pills.

## [1.0.0] - 2026-11-14

### Added
- Initial system architecture documentation in `ARCHITECTURE.md` covering the 4-step / 12-question flow, IG-first `ContactGate`, Dual CTA `SummaryView`, and Google Apps Script webhook integration plan.
- Central configuration constants in `src/config/appConfig.ts` (`BRAND_NAME`, `COACH_NAME`, `WHATSAPP_NUMBER`, `INSTAGRAM_USERNAME`, `GOOGLE_SCRIPT_WEBHOOK_URL`, `META_PIXEL_ID`).
- Core TypeScript domain types in `src/types/assessment.ts` (`Question`, `FormStepConfig`, `AssessmentAnswers`, `ContactInfo`, `LeadPriority`, `AnalysisResult`, `SubmissionPayload`).
- Complete 4-step / 12-question Indonesian express dataset in `src/data/questions.ts`.
- Mobile-first `Header` component with `transformwithST` badge, Coach Vera attribution, and direct WhatsApp consultation button.
- Phase 1 preview landing screen in `src/App.tsx` styled with the warm off-white and soft emerald wellness palette for Instagram in-app browser verification.
- Phase 2 storage service in `src/services/storageService.ts` (`captureUtmParams` for `utm_source`, `utm_medium`, `utm_campaign`, `ig_ad`, `ref`, versioned `transformwithst_draft_v1` auto-save/load/clear, and `submitToWebhook` stub).
- Phase 2 multi-step `FormStep` component in `src/components/FormStep.tsx` featuring an animated emerald progress bar, tactile single/multi-choice and gender cards, numeric `-`/`+` quick steppers, and immediate-clear inline Indonesian validation.
- Phase 2 root flow state (`'intro' | 'form' | 'gate'`) and saved-draft recovery banner (`Lanjutkan pengisian sebelumnya` / `Mulai Ulang`) in `src/App.tsx`.
- Phase 3 Indonesian phone & deep-link utilities in `src/utils/phoneFormatter.ts` (`normalizeIndonesianPhone`, `isValidOptionalPhone`, `buildWhatsAppUrl`, `buildInstagramDmUrl`).
- Phase 3 deterministic scoring & summary engine in `src/utils/assessmentAnalyzer.ts` (BMI, protein range, 4-pillar sub-scores, tailored Indonesian insights, `HOT`/`WARM`/`COLD` lead priority, and WA/IG DM summary formatters).
- Phase 3 IG-first `ContactGate` component in `src/components/ContactGate.tsx` with locked teaser preview, `@instagram` normalization, optional WhatsApp validation, anti-bot honeypot, and UU PDP privacy note.
- Phase 3 `'summary'` verification flow and honeypot-guarded submission wiring in `src/App.tsx` and updated `AnalysisResult` types in `src/types/assessment.ts`.
- Phase 4 collapsible `AnswerRecap` accordion in `src/components/AnswerRecap.tsx` displaying all 12 submitted answers grouped by step with `"Ulangi Evaluasi"` action.
- Phase 4 `SummaryView` results dashboard in `src/components/SummaryView.tsx` with circular score ring, 4 sub-score bars, BMI & protein cards, Coach Vera insights, and Dual CTA (WhatsApp + IG DM with non-blocking clipboard auto-copy and fallback preview box).
- Phase 4 `App.tsx` wiring replacing the temporary summary card with `<SummaryView />` and smooth reset-to-intro flow.
- Device-aware Instagram routing in `src/utils/phoneFormatter.ts` and `src/components/SummaryView.tsx` replacing slow `ig.me/m/` redirects with mobile native app handoff (`instagram://` + web profile fallback) and direct desktop Instagram web profile routing, adaptive subtitle, and auto-expanded DM preview box.
- Phase 5 ad-blocker-safe Meta Pixel (`fbq`) & GA4 (`gtag`) wrapper in `src/services/analyticsService.ts` (`initAnalytics`, `trackAssessmentStart`, `trackStepComplete`, `trackLeadSubmitted`, `trackContactClick`).
- Phase 5 Google Apps Script (Option A) webhook delivery in `src/services/storageService.ts` with flattened Google Sheets rows, `localStorage` backup under `transformwithst_submissions_v1`, and non-blocking `no-cors` fetch.
- Phase 5 analytics event wiring across `src/App.tsx`, `src/components/Header.tsx`, and `src/components/SummaryView.tsx`, completing `v1.0.0`.
