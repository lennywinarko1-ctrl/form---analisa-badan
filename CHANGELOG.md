# Changelog

All notable changes to the **transformwithST** health assessment web application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
