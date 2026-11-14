# Architecture — transformwithST Health Assessment

## 1. System Overview
**transformwithST** is a mobile-first, Instagram in-app browser optimized health, nutrition, and lifestyle express assessment built for **Coach Vera**. Prospective coaching clients complete a 90-second self-evaluation, unlock their personalized metabolic and lifestyle snapshot via an IG-first ContactGate, and seamlessly transition to a 1-on-1 consultation with Coach Vera via WhatsApp or Instagram DM.

### Core Design & Engineering Constraints
- **Strict Modularity**: Every file is strictly kept under **250 lines of code**.
- **Mobile-First & IG In-App Ready**: Uses `min-h-[100dvh]` to handle dynamic mobile toolbars inside Instagram's WebView, generous `>= 44px` tap targets, and clean touch ergonomics.
- **Visual System**: Warm off-white canvas (`#FAFBF9`), soft sage/emerald green accents (`#059669` / `#ECFDF5`), dark slate typography (`#1E293B`), and Indonesian natural copy.

---

## 2. Modular File Map (v1.0.0)

| File Path | Responsibility | Status |
| :--- | :--- | :--- |
| `ARCHITECTURE.md` | System overview, file map, flow architecture, webhook specs | Phase 3 |
| `CHANGELOG.md` | Versioned release history (Keep a Changelog) | Phase 3 |
| `src/config/appConfig.ts` | Brand constants, Coach contacts, webhook & pixel configuration | Phase 1 |
| `src/types/assessment.ts` | TypeScript interfaces for questions, answers, contacts, & analysis | Phase 3 |
| `src/data/questions.ts` | 4-step / 12-question Indonesian express dataset | Phase 1 |
| `src/components/Header.tsx` | Mobile-first compact header with brand pill & WhatsApp CTA | Phase 1 |
| `src/services/storageService.ts` | UTM tracking capture, versioned localStorage drafts, & webhook stub | Phase 2 |
| `src/utils/phoneFormatter.ts` | Indonesian phone normalization, validation, WA & IG DM URL builders | Phase 3 |
| `src/utils/assessmentAnalyzer.ts` | BMI, protein range, 4-pillar sub-scores, insights, & WA/IG formatters | Phase 3 |
| `src/components/FormStep.tsx` | 4-step interactive express form, numeric steppers, & inline validation | Phase 2 |
| `src/components/ContactGate.tsx` | IG-first contact capture (`Nama`, `@instagram`, optional WA, honeypot) | Phase 3 |
| `src/App.tsx` | Multi-screen flow controller (`intro`, `form`, `gate`, `summary`) | Phase 3 |
| `src/components/SummaryView.tsx` | Personalized results + Dual CTA (WhatsApp + IG DM auto-copy) | Planned (Phase 4) |

---

## 3. User Flow Architecture

### A. 4-Step / 12-Question Express Flow
1. **Step 1 — Target & Riwayat** (`goal`, `history`)
   - Captures primary transformation goals (multi-select) and previous diet/fitness attempts.
2. **Step 2 — Profil Tubuh** (`gender`, `age`, `height_cm`, `weight_kg`)
   - Collects biometric baseline for BMI, estimated BMR, and metabolic framing.
3. **Step 3 — Makan & Energi** (`eating_out`, `sugar_snacking`, `afternoon_energy`)
   - Evaluates caloric density habits, liquid sugar intake, and afternoon glycemic crashes.
4. **Step 4 — Gaya Hidup & Kesiapan** (`sleep_quality`, `activity_level`, `readiness`)
   - Assesses recovery quality, baseline NEAT/exercise, and coaching readiness (`HOT` / `WARM` / `COLD`).

### B. IG-First ContactGate
Placed immediately after Step 4 before revealing the full assessment breakdown:
- **Nama Panggilan** (required)
- **Username Instagram** (`@username`, required — primary attribution & DM follow-up)
- **Nomor WhatsApp** (optional — friction-free for IG-native visitors)
- **Honeypot field** (hidden anti-spam protection)

### C. Dual CTA SummaryView
Displays the user's personalized Indonesian health snapshot (Metabolic & Lifestyle Score, BMI insight, focus pillars) alongside two high-intent conversion paths:
1. **Primary CTA — Konsultasi via WhatsApp**: Opens `https://api.whatsapp.com/send` pre-filled with the user's name, `@instagram`, score, and primary goal.
2. **Secondary CTA — Kirim Hasil via DM Instagram**: Auto-copies the formatted summary text to the clipboard and opens `https://ig.me/m/transformwithst` for instant pasting in Instagram DM.

---

## 4. Google Apps Script Integration (Option A — Webhook Placeholder)
In Phase 3, `GOOGLE_SCRIPT_WEBHOOK_URL` in `src/config/appConfig.ts` will connect to a deployed Google Apps Script Web App (`doPost(e)`) to log `SubmissionPayload` rows directly into Google Sheets without requiring a dedicated backend database.

### Planned Webhook Contract
- **Endpoint**: `appConfig.GOOGLE_SCRIPT_WEBHOOK_URL` (HTTPS POST, `text/plain` or `application/json` with CORS-safe `no-cors` fallback).
- **Payload**: `SubmissionPayload` (`submittedAt`, `appVersion`, `contact`, `answers`, `analysis`, `source`).
- **Sheet Columns**: Timestamp, Priority (`HOT`/`WARM`/`COLD`), Nickname, IG Handle, WhatsApp, Goal(s), BMI, Lifestyle Score, Readiness, Raw Answers JSON.
