# Architecture — transformwithST Health Assessment (`v1.1.0`)

## 1. System Overview
**transformwithST** (`v1.1.0`) is a mobile-first, Instagram in-app browser optimized health, nutrition, and lifestyle express assessment built for **Coach Vera**. Styled with a "Native Health App Glow + Coach Vera Personal Brand" aesthetic, it pairs an ice-mint `#F4F9F7` shell (`max-w-[430px]` elevated frame on desktop, full-bleed on phones), `Plus Jakarta Sans` typography, frosted glass cards, and Coach Vera's personal brand presence across every screen.

### Core Design & Engineering Constraints
- **Strict Modularity**: Every file is strictly kept under **250 lines of code**.
- **Mobile-First & IG In-App Ready**: Uses `min-h-[100dvh]`, sticky thumb-zone navigation with `safe-area-inset-bottom`, `>= 44px` touch targets, and device-aware Instagram routing.
- **Visual System (`v1.1.0`)**: Ice-mint canvas (`#F4F9F7`), ambient emerald/teal top glow, frosted glass cards (`bg-white/90 backdrop-blur-md`), emerald-to-teal gradient CTAs/hero card, dark slate typography (`#1E293B`), and `tabular-nums`.

---

## 2. Modular File Map (`v1.1.0` — Complete)

| File Path | Responsibility | Status |
| :--- | :--- | :--- |
| `ARCHITECTURE.md` | System overview, file map, flow, Google Sheets & Pixel specs | v1.1.0 |
| `CHANGELOG.md` | Versioned release history (Keep a Changelog) | v1.1.0 |
| `src/config/appConfig.ts` | Brand constants, `COACH_AVATAR_URL`, contacts, webhook & Pixel config | v1.1.0 |
| `src/types/assessment.ts` | TypeScript interfaces for questions, answers, contacts, & analysis | v1.0.0 |
| `src/data/questions.ts` | 4-step / 12-question Indonesian express dataset | v1.0.0 |
| `src/components/CoachAvatar.tsx` | Circular photo avatar with emerald ring, active dot, & `CV` fallback | v1.1.0 |
| `src/components/Header.tsx` | Frosted sticky header with `CoachAvatar`, badge & tracked WA CTA | v1.1.0 |
| `src/services/analyticsService.ts` | Safe Meta Pixel (`fbq`) & GA4 (`gtag`) event tracking wrapper | v1.0.0 |
| `src/services/storageService.ts` | UTM capture, `localStorage` drafts/backups, & Google Sheets webhook | v1.0.0 |
| `src/utils/phoneFormatter.ts` | Phone normalization, validation, WA & device-aware IG routing | v1.0.0 |
| `src/utils/assessmentAnalyzer.ts` | BMI, protein range, 4-pillar sub-scores, insights, & WA/IG formatters | v1.0.0 |
| `src/components/FormStep.tsx` | 4-segment pill progress, Coach Vera Tip, tactile cards, sticky nav | v1.1.0 |
| `src/components/ContactGate.tsx` | Coach-led IG-first gate with `CoachAvatar`, locked pill, & honeypot | v1.1.0 |
| `src/components/AnswerRecap.tsx` | Collapsible 12-answer review accordion with reset trigger | v1.0.0 |
| `src/components/SummaryView.tsx` | Gradient score hero card + glass BMI/protein pills + Dual WA/IG CTA | v1.1.0 |
| `src/App.tsx` | Centered `max-w-[430px]` mobile shell, Coach intro hero, & flow state | v1.1.0 |

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
