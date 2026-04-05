# IntelliScan Presentation Pack (April 4, 2026)

This is the presentation-ready documentation pack for IntelliScan, built from the actual codebase (`intelliscan-app` + `intelliscan-server`) and the existing internal documentation already present in this repository.

## 1) What You Can Use Today

1. Presentation 1 (mid-review): [intelliscan-server/College_Document/Presentation-1_intelliscan.md](intelliscan-server/College_Document/Presentation-1_intelliscan.md)
2. Presentation 2 (final + demo + architecture deep dive): [intelliscan-server/College_Document/Presentation-2_intelliscan.md](intelliscan-server/College_Document/Presentation-2_intelliscan.md)
3. Final MCA report (guidelines order): [MCA_SEM4_MAJOR_PROJECT_REPORT_INTELLISCAN.md](MCA_SEM4_MAJOR_PROJECT_REPORT_INTELLISCAN.md)
4. Improvement plan (what to harden for real production): [intelliscan-app/PROJECT_IMPROVEMENT_PLAN.md](intelliscan-app/PROJECT_IMPROVEMENT_PLAN.md)
5. Guidelines compliance checklist (what maps to what): [MCA_GUIDELINES_COMPLIANCE_CHECKLIST.md](MCA_GUIDELINES_COMPLIANCE_CHECKLIST.md)
6. Full project status (what is wired end-to-end): [PROJECT_STATUS.md](PROJECT_STATUS.md)
7. Use Case diagrams (all features): [IntelliScan_UseCaseDiagrams.md](IntelliScan_UseCaseDiagrams.md)
8. Activity diagrams (all features): [IntelliScan_ActivityDiagrams.md](IntelliScan_ActivityDiagrams.md)
9. Interaction (sequence) diagrams (all features): [IntelliScan_InteractionDiagrams.md](IntelliScan_InteractionDiagrams.md)
10. Class diagrams (all features): [IntelliScan_ClassDiagrams.md](IntelliScan_ClassDiagrams.md)
11. Global Activity diagram: [IntelliScan_Global_ActivityDiagram.md](IntelliScan_Global_ActivityDiagram.md)
12. Global Interaction diagram: [IntelliScan_Global_InteractionDiagram.md](IntelliScan_Global_InteractionDiagram.md)
13. Data Dictionary (authoritative, dumped from `intelliscan.db`): [DATA_DICTIONARY_INTELLISCAN_DB.md](DATA_DICTIONARY_INTELLISCAN_DB.md)
14. Data Dictionary (human-friendly summary, older): [IntelliScan_Data_Dictionary.md](IntelliScan_Data_Dictionary.md)
15. Data Dictionary (human-friendly summary, internal bundle): [ALL_DOCUMENT_OF_PROJECT/IntelliScan_Ultimate_Data_Dictionary.md](ALL_DOCUMENT_OF_PROJECT/IntelliScan_Ultimate_Data_Dictionary.md)
16. Complete architecture deep dive: [ALL_DOCUMENT_OF_PROJECT/IntelliScan_Complete_Architecture.md](ALL_DOCUMENT_OF_PROJECT/IntelliScan_Complete_Architecture.md)
17. Project architecture and file map: [ALL_DOCUMENT_OF_PROJECT/PROJECT_ARCHITECTURE.md](ALL_DOCUMENT_OF_PROJECT/PROJECT_ARCHITECTURE.md)
18. Final academic report (long-form): [ALL_DOCUMENT_OF_PROJECT/IntelliScan_Final_Project_Report.md](ALL_DOCUMENT_OF_PROJECT/IntelliScan_Final_Project_Report.md)
19. Page health check (routes + missing endpoints): [PAGE_HEALTH_REPORT.md](PAGE_HEALTH_REPORT.md)

## 2) “What IntelliScan Is” (One Paragraph)

IntelliScan is an AI-powered business card scanning and CRM platform. It converts single business cards or group photos of multiple cards into structured contact records, then organizes those contacts inside a role-gated dashboard (personal) or a multi-user workspace (enterprise). On top of the CRM layer, it adds email marketing (templates, lists, campaigns, tracking), AI follow-up drafts, a networking coach, calendar scheduling/booking links, data quality (dedupe/merge), compliance policies (retention/redaction/audit storage toggles), integrations (webhooks + CRM mapping), and billing upgrades (Razorpay).

## 3) How The System Is Built (High Level)

### 3.1 Frontend (`intelliscan-app`)

1. React + Vite SPA.
2. Routing via React Router.
3. Auth/role state via context providers.
4. Pages exist in `src/pages` (hand-authored) and `src/pages/generated` (generated prototypes wired into the router).

### 3.2 Backend (`intelliscan-server`)

1. Express REST API + Socket.IO for realtime features.
2. SQLite database (local/dev friendly).
3. AI extraction pipeline: Gemini Vision (primary) -> OpenAI (secondary) -> Tesseract.js (offline fallback for single-card only).
4. Billing: Razorpay orders + signature verification, with simulated orders when keys are not configured (demo mode).

## 4) End-to-End Workflows (What Depends On What)

### 4.1 Authentication and Session

1. User signs up or logs in.
2. Backend issues JWT token.
3. Frontend stores token and uses it for all `/api/*` calls.
4. Roles and tier are evaluated by backend.
5. UI feature gating is driven by the computed access profile.

Dependency notes:
1. All protected pages depend on a valid token.
2. Workspace pages depend on the user having a workspace role (enterprise admin/user).
3. Admin pages depend on `super_admin`.

### 4.2 Scan (Single Card)

1. User uploads an image in Scan page.
2. Frontend POSTs to `POST /api/scan`.
3. Backend validates auth, quota, and image constraints (format/size).
4. Backend runs `unifiedExtractionPipeline` and returns structured contact data.
5. User decides to save or rescan.
6. On save, backend persists the contact and the quota usage is deducted.

Dependencies:
1. Contacts, AI Drafts, Email Marketing lists, Events segmentation all depend on stored contacts.

### 4.3 Scan (Group Photo)

1. Enterprise user uploads a group photo of multiple cards.
2. Frontend POSTs to `POST /api/scan-multi`.
3. Backend validates enterprise tier and group scan quota.
4. Backend extracts an array of contacts and persists them.
5. Group scan usage increments when the scan succeeds.

Dependencies:
1. Dedupe/Merge and Data Quality become important after bulk ingestion.

### 4.4 Contacts and CRM Layer

1. Contacts page pulls from `GET /api/contacts` (personal) or workspace endpoints.
2. Users can edit, export, create relationships, and enrich.
3. Contacts can be tagged to Events.

Dependencies:
1. Events page depends on contacts being tagged to show “leads scanned per event”.
2. AI Drafts depend on contacts to generate personalized follow-ups.
3. Email Marketing depends on contacts for audience building (lists).

### 4.5 AI Drafts and AI Coach

1. Draft generation uses saved contacts and the AI text pipeline.
2. Draft sending uses SMTP settings via Nodemailer (or demo/sim).
3. AI Coach insights are derived from CRM activity and contact freshness (best-effort signals).

Dependencies:
1. AI features depend on AI keys (Gemini/OpenAI) or they will use safe fallbacks where enabled.
2. Sending depends on SMTP config if you want real delivery.

### 4.6 Email Marketing

1. Create templates.
2. Build lists (static or derived).
3. Create campaigns.
4. Send campaigns.
5. Track opens/clicks via tracking endpoints.

Dependencies:
1. Requires contact emails to be present.
2. “Real email sending” requires SMTP env variables.

### 4.7 Billing (Razorpay)

1. User chooses a plan to upgrade.
2. Frontend requests an order from backend.
3. Razorpay checkout completes payment.
4. Backend verifies signature and marks order as paid.
5. Backend updates user tier and quotas accordingly.

Dependencies:
1. Requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for real payments.
2. Server supports demo mode if keys are missing.

## 5) Demo Script (Presentation Friendly)

1. Login as `free@intelliscan.io` and show quota limits.
2. Scan a single card and save it.
3. Open Contacts and export CSV.
4. Generate an AI Draft for that contact.
5. Switch to `enterprise@intelliscan.io` and show:
   1. Workspace pages
   2. Group photo scanning
   3. Data quality queue (dedupe/merge)
   4. Policies page (save and fetch policies)
   5. Email marketing campaign flow
6. (Optional) Switch to `superadmin@intelliscan.io` and show admin monitoring pages.

## 6) Known Gaps (Important To Mention In Viva/Presentation)

1. The backend is still largely monolithic (`intelliscan-server/index.js`) and should be modularized for team scale.
2. SQLite is great for demo/dev; for true production multi-tenant scaling, switch to Postgres and add migrations.
3. Some routes/pages are still prototype-level and need endpoint completion (see [PAGE_HEALTH_REPORT.md](PAGE_HEALTH_REPORT.md)).

## 7) Environment Setup (What To Put In `.env`)

1. Server template: `intelliscan-server/.env.example`
2. App template: `intelliscan-app/.env.example`

Minimal to demo most features:
1. `JWT_SECRET`
2. `ALLOW_MOCK_AI_FALLBACK=true`

To enable real AI + real email + real billing:
1. `GEMINI_API_KEY` and or `OPENAI_API_KEY`
2. `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
3. `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
