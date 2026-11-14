# Architecture — transformwithST Health Assessment (`v1.0.0`)

## 1. System Overview
**transformwithST** (`v1.0.0`) is a mobile-first, Instagram in-app browser optimized health, nutrition, and lifestyle express assessment built for **Coach Vera**. Prospective coaching clients complete a 90-second self-evaluation, unlock their personalized metabolic and lifestyle snapshot via an IG-first ContactGate, and transition directly to a 1-on-1 consultation with Coach Vera via WhatsApp or Instagram DM.

### Core Design & Engineering Constraints
- **Strict Modularity**: Every file is strictly kept under **250 lines of code**.
- **Mobile-First & IG In-App Ready**: Uses `min-h-[100dvh]`, `>= 44px` touch targets, and device-aware Instagram routing.
- **Visual System**: Warm off-white canvas (`#FAFBF9`), soft sage/emerald green accents (`#059669` / `#ECFDF5`), dark slate typography (`#1E293B`), and friendly Indonesian copy.

---

## 2. Modular File Map (`v1.0.0` — Complete)

| File Path | Responsibility | Status |
| :--- | :--- | :--- |
| `ARCHITECTURE.md` | System overview, file map, flow, Google Sheets & Pixel specs | v1.0.0 |
| `CHANGELOG.md` | Versioned release history (Keep a Changelog) | v1.0.0 |
| `src/config/appConfig.ts` | Brand constants, Coach contacts, webhook & Meta Pixel config | v1.0.0 |
| `src/types/assessment.ts` | TypeScript interfaces for questions, answers, contacts, & analysis | v1.0.0 |
| `src/data/questions.ts` | 4-step / 12-question Indonesian express dataset | v1.0.0 |
| `src/components/Header.tsx` | Compact mobile-first header with brand badge & tracked WA CTA | v1.0.0 |
| `src/services/analyticsService.ts` | Safe Meta Pixel (`fbq`) & GA4 (`gtag`) event tracking wrapper | v1.0.0 |
| `src/services/storageService.ts` | UTM capture, `localStorage` drafts/backups, & Google Sheets webhook | v1.0.0 |
| `src/utils/phoneFormatter.ts` | Phone normalization, validation, WA & device-aware IG routing | v1.0.0 |
| `src/utils/assessmentAnalyzer.ts` | BMI, protein range, 4-pillar sub-scores, insights, & WA/IG formatters | v1.0.0 |
| `src/components/FormStep.tsx` | 4-step interactive express form, numeric steppers, & inline validation | v1.0.0 |
| `src/components/ContactGate.tsx` | IG-first contact capture (`Nama`, `@instagram`, optional WA, honeypot) | v1.0.0 |
| `src/components/AnswerRecap.tsx` | Collapsible 12-answer review accordion with reset trigger | v1.0.0 |
| `src/components/SummaryView.tsx` | Personalized results + Dual CTA (WhatsApp + device-aware IG DM) | v1.0.0 |
| `src/App.tsx` | Flow controller (`intro`, `form`, `gate`, `summary`) & analytics hooks | v1.0.0 |

---

## 3. User Flow Architecture

### A. 4-Step / 12-Question Express Flow
1. **Step 1 — Target & Riwayat** (`goal`, `history`)
2. **Step 2 — Profil Tubuh** (`gender`, `age`, `height_cm`, `weight_kg`)
3. **Step 3 — Makan & Energi** (`eating_out`, `sugar_snacking`, `afternoon_energy`)
4. **Step 4 — Gaya Hidup & Kesiapan** (`sleep_quality`, `activity_level`, `readiness`)

### B. IG-First ContactGate
Captures `Nama Panggilan` (required), `@username` Instagram (required), `Nomor WhatsApp` (optional, validated when filled), and a hidden anti-bot honeypot field with UU PDP privacy reassurance.

### C. Dual CTA SummaryView
1. **Primary CTA — WhatsApp**: Opens `api.whatsapp.com/send` pre-filled with the personalized Indonesian summary.
2. **Secondary CTA — Instagram**: Auto-copies the 5-line DM summary, expands the preview box, and routes mobile browsers to the Instagram app (with web fallback) or desktop browsers directly to `instagram.com/{username}/`.

---

## 4. Google Apps Script Integration (Option A — Active)
- **Endpoint**: `GOOGLE_SCRIPT_WEBHOOK_URL` in `src/config/appConfig.ts` (`POST`, `mode: 'no-cors'`, `Content-Type: text/plain;charset=utf-8`).
- **Local Backup**: Always stored under `transformwithst_submissions_v1` in `localStorage` (up to 20 recent flattened entries) regardless of network/webhook state.
- **Flattened Columns**: `submittedAt`, `appVersion`, `leadPriority`, `nickname`, `igUsername`, `igProfileUrl`, `whatsappNormalized`, `whatsappLink`, `overallScore`, `bmi`, `bmiCategory`, `proteinRange`, `insightsText`, `utmSource`, `utmMedium`, `utmCampaign`, `igAd`, and all 12 answer fields as strings.

---

## 5. Meta Pixel & GA4 Event Map

| Trigger | Meta Pixel (`fbq`) | GA4 (`gtag`) | Parameters |
| :--- | :--- | :--- | :--- |
| App Mount | `PageView` | — | Initialized only when `META_PIXEL_ID` is set |
| Start / Resume | `AssessmentStart` + `ViewContent` | `assessment_start` + `view_item` | `content_name` |
| Step Advance | `StepComplete` | `step_complete` | `step_number`, `step_title` |
| Gate Submit | `Lead` | `generate_lead` | `content_category` (`HOT`/`WARM`/`COLD`), `has_whatsapp` |
| CTA Click | `Contact` | `contact_click` | `channel` (`whatsapp` / `instagram_dm` / `header_whatsapp`) |
