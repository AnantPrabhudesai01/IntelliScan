# IntelliScan Project Status Report (Full Stack)

**As of:** 2026-04-04 (Asia/Calcutta)  
**Scope:** `intelliscan-app` (frontend) + `intelliscan-server` (backend) + generated prototype pages.

This document is a “what we have today” snapshot: what’s implemented, what’s wired end-to-end, what’s still prototype-only, and what to improve next for real production scalability.

---

## 1) High-Level Summary

**What’s strong right now**
- The app is no longer just UI: scanning, contacts, events, data policies, dedupe/merge, email campaigns, coach, kiosk, and billing all have backend APIs and real persistence.
- There is a clear role/tier concept (user/workspace admin/super admin + personal/pro/enterprise) and API surface to query access (`/api/access/me`).
- Backend tests pass (Jest + supertest). Frontend runs well in dev; Vite production build can fail in some restricted Windows environments due to `spawn EPERM`, but the code itself is valid and should build on a normal machine.

**What still blocks “true production scale”**
- The backend is still a single, very large file (`intelliscan-server/index.js` ~6315 lines). It works, but long-term maintainability and team scaling need modularization.
- SQLite is good for local/dev and small scale; for serious multi-tenant scale, move to Postgres and add migrations.
- Auth is functional but not “enterprise-hard”: refresh tokens, httpOnly secure cookies, session token hashing, SSO verification, and stronger security defaults are recommended.

---

## 2) Repository Map

**Top-level**
- `intelliscan-app/`: React + Vite frontend
- `intelliscan-server/`: Express + SQLite backend
- `ALL_DOCUMENT_OF_PROJECT/`: large documentation/roadmap folder (feature lists, diagrams, architecture docs)
- `PROJECT_STATUS.md`: this file

**Approx. codebase size (excluding `node_modules/` and build output)**
- Frontend: ~181 files
- Backend (non-`node_modules`): ~30 files, but most runtime logic is in `intelliscan-server/index.js`

**Existing project docs**
- Root docs: `IntelliScan_*.md` (diagrams/dictionaries)
- Comprehensive docs: `ALL_DOCUMENT_OF_PROJECT/*.md` (roadmaps, audits, RBAC, architecture, etc.)

---

## 3) How To Run Locally

### Backend
```powershell
cd intelliscan-server
npm install
npm run dev
```

- Server default port: `5000`
- SQLite file used by the current runtime code (`src/utils/db.js`): `intelliscan-server/intelliscan.db`

### Frontend
```powershell
cd intelliscan-app
npm install
npm run dev
```

- Vite proxy forwards `/api/*` to `http://127.0.0.1:5000`

---

## 3.1) Demo Accounts (Local)

To quickly test **feature gating** and **role-based access** without manual setup, the server seeds demo users in `development` (unless `SEED_DEMO_USERS=false`).

Credentials:
- Free Personal User: `free@intelliscan.io` / `user12345`
- Pro Personal User: `pro@intelliscan.io` / `user12345`
- Enterprise User: `enterprise.user@intelliscan.io` / `user12345`
- Enterprise Admin: `enterprise@intelliscan.io` / `admin12345`
- Super Admin: `superadmin@intelliscan.io` / `admin12345`

Notes:
- Enterprise User + Enterprise Admin share the same `workspace_id=1001`, so Workspace pages (Shared Rolodex, Data Quality, Policies, etc.) show real seeded data.
- In production deployments, disable seeding by setting `SEED_DEMO_USERS=false`.

---

## 4) Environment Configuration

**Server env template**
- `intelliscan-server/.env.example`

Core variables:
- `GEMINI_API_KEY` (Gemini OCR + AI features)
- `OPENAI_API_KEY` (OCR + AI fallback)
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (billing / plan upgrades)
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (for real email sending)
- `ALLOW_MOCK_AI_FALLBACK` (keeps scanning usable even if AI key is missing)
- `TESSERACT_LANG` (optional offline OCR language)

**App env template**
- `intelliscan-app/.env.example`
- `VITE_API_PROXY_TARGET` (optional override for the Vite dev proxy target)

---

## 5) Roles, Tiers, Access Model

**Roles**
- `anonymous`: not logged in
- `user`: normal user
- `business_admin`: workspace admin / enterprise admin
- `super_admin`: platform admin

**Tiers**
- `personal` (free)
- `pro`
- `enterprise`

**Access APIs**
- `GET /api/access/me`: computed access profile for the current user
- `GET /api/access/matrix`: example profiles for free/pro/enterprise/super-admin

Note: You also have feature-gated backend middleware patterns (for example, calendar endpoints require “enterprise/admin”).

---

## 6) Frontend Architecture (intelliscan-app)

**Framework**
- React (Vite), React Router

**Main entry points**
- Router + route composition: `intelliscan-app/src/App.jsx`
- Auth state bootstrap + role/tier: `intelliscan-app/src/context/RoleContext.jsx`
- Token persistence helpers (cookie + localStorage fallback): `intelliscan-app/src/utils/auth.js`

**Core UI layouts**
- `intelliscan-app/src/layouts/DashboardLayout.jsx`: user dashboard shell + nav
- `intelliscan-app/src/layouts/AdminLayout.jsx`: workspace admin and super-admin shells

---

## 7) Page Inventory (What Exists)

### 7.1 Public Routes
- `/` Landing
- `/sign-in`, `/sign-up`, `/forgot-password`
- `/onboarding`
- `/api-docs`
- `/u/:slug` PublicProfile
- `/book/:slug` BookingPage
- `/scan/:token` Public scanner placeholder (currently `PageStub`)

### 7.2 Dashboard Routes (Core Product)
- `/dashboard/scan` Scan (single + group photo)
- `/dashboard/contacts` Contacts
- `/dashboard/events` Events
- `/dashboard/drafts` AI Drafts
- `/dashboard/coach` AI Coach
- `/dashboard/kiosk` Event Kiosk (real OCR + lead finalize)
- `/dashboard/presence` Meeting Presence tools
- `/dashboard/signals` Signals dashboard
- `/dashboard/my-card` Digital card viewer
- `/dashboard/card-creator` CardCreatorPage
- `/dashboard/settings` Settings
- `/dashboard/leaderboard` Leaderboard
- `/marketplace` Marketplace

### 7.3 Calendar / Booking (Business Admin / Enterprise)
- `/dashboard/calendar`
- `/dashboard/calendar/availability`
- `/dashboard/calendar/booking-links`

### 7.4 Email Marketing (Business Admin / Enterprise)
- `/dashboard/email-marketing`
- `/dashboard/email-marketing/campaigns`
- `/dashboard/email-marketing/campaigns/new`
- `/dashboard/email-marketing/campaigns/:id`
- `/dashboard/email-marketing/templates`
- `/dashboard/email-marketing/lists`
- `/dashboard/email-marketing/lists/:id`
- `/dashboard/email/sequences`

### 7.5 Workspace / Admin (Workspace Operations)
- `/workspace/dashboard`
- `/workspace/contacts`
- `/workspace/members`
- `/workspace/scanner-links`
- `/workspace/crm-mapping`
- `/workspace/routing-rules`
- `/workspace/data-policies`
- `/workspace/data-quality`
- `/workspace/analytics`
- `/workspace/org-chart`
- `/workspace/campaigns`
- `/workspace/billing` (API-backed billing page)
- `/workspace/shared`
- `/workspace/pipeline`
- `/workspace/webhooks`

### 7.6 Super Admin (Platform)
- `/admin/dashboard`
- `/admin/engine-performance`
- `/admin/incidents`
- `/admin/custom-models`
- `/admin/integration-health`
- `/admin/job-queues`
- `/admin/feedback`

### 7.7 Generated Prototype Pages (61 Pages)

These are available via `intelliscan-app/src/pages/generated/routes.json` and are auto-routed in `intelliscan-app/src/App.jsx`.

They are visually complete “prototype pages”. Many are UI-only and still need backend wiring for real production behavior.

List (path -> component):
- `/404-system-error-states` (`Gen404SystemErrorStates`)
- `/advanced-api-explorer-sandbox` (`GenAdvancedApiExplorerSandbox`)
- `/advanced-api-webhook-monitor` (`GenAdvancedApiWebhookMonitor`)
- `/advanced-csv-json-export-mapper` (`GenAdvancedCsvJsonExportMapper`)
- `/advanced-security-audit-logs-1` (`GenAdvancedSecurityAuditLogs1`)
- `/advanced-security-audit-logs-2` (`GenAdvancedSecurityAuditLogs2`)
- `/advanced-segment-builder` (`GenAdvancedSegmentBuilder`)
- `/ai-confidence-audit-feedback-hub` (`GenAiConfidenceAuditFeedbackHub`)
- `/ai-conflict-resolution-human-in-the-loop` (`GenAiConflictResolutionHumanInTheLoop`)
- `/ai-maintenance-retraining-logs` (`GenAiMaintenanceRetrainingLogs`)
- `/ai-model-versioning-rollback` (`GenAiModelVersioningRollback`)
- `/ai-training-tuning-super-admin` (`GenAiTrainingTuningSuperAdmin`)
- `/api-integrations` (`GenApiIntegrations`)
- `/api-performance-webhooks` (`GenApiPerformanceWebhooks`)
- `/api-webhook-configuration-1` (`GenApiWebhookConfiguration1`)
- `/api-webhook-configuration-2` (`GenApiWebhookConfiguration2`)
- `/api-webhook-logs-debugging` (`GenApiWebhookLogsDebugging`)
- `/audit-logs-security` (`GenAuditLogsSecurity`)
- `/batch-processing-monitor-user-dashboard` (`GenBatchProcessingMonitorUserDashboard`)
- `/billing-usage` (`GenBillingUsage`)
- `/bulk-contact-export-wizard-1` (`GenBulkContactExportWizard1`)
- `/bulk-contact-export-wizard-2` (`GenBulkContactExportWizard2`)
- `/bulk-member-invitation-import` (`GenBulkMemberInvitationImport`)
- `/compliance-data-sovereignty-super-admin` (`GenComplianceDataSovereigntySuperAdmin`)
- `/compliance-disclosure-legal-center` (`GenComplianceDisclosureLegalCenter`)
- `/contact-detail-view` (`GenContactDetailView`)
- `/contact-merge-deduplication` (`GenContactMergeDeduplication`)
- `/data-export-history-log` (`GenDataExportHistoryLog`)
- `/data-export-migration` (`GenDataExportMigration`)
- `/dynamic-dashboard-builder` (`GenDynamicDashboardBuilder`)
- `/empty-states-no-results-template` (`GenEmptyStatesNoResultsTemplate`)
- `/enterprise-sso-saml-config` (`GenEnterpriseSsoSamlConfig`)
- `/enterprise-whitelabel-branding-config` (`GenEnterpriseWhitelabelBrandingConfig`)
- `/enterprise-whitelabel-branding-config-fixed` (`GenEnterpriseWhitelabelBrandingConfigFixed`)
- `/error-resolution-center` (`GenErrorResolutionCenter`)
- `/global-data-retention-archiving` (`GenGlobalDataRetentionArchiving`)
- `/global-search-intelligence` (`GenGlobalSearchIntelligence`)
- `/global-search-universal-discovery` (`GenGlobalSearchUniversalDiscovery`)
- `/global-system-status-page` (`GenGlobalSystemStatusPage`)
- `/help-center-docs` (`GenHelpCenterDocs`)
- `/insights-ai-forecasting` (`GenInsightsAiForecasting`)
- `/interactive-api-payload-explorer` (`GenInteractiveApiPayloadExplorer`)
- `/interactive-feature-tours-help-overlays` (`GenInteractiveFeatureToursHelpOverlays`)
- `/maintenance-system-update-mode` (`GenMaintenanceSystemUpdateMode`)
- `/marketplace-integrations-business-admin` (`GenMarketplaceIntegrationsBusinessAdmin`)
- `/member-role-permissions-editor-1` (`GenMemberRolePermissionsEditor1`)
- `/member-role-permissions-editor-2` (`GenMemberRolePermissionsEditor2`)
- `/member-role-permission-matrix` (`GenMemberRolePermissionMatrix`)
- `/privacy-gdpr-command-center` (`GenPrivacyGdprCommandCenter`)
- `/referral-loyalty-dashboard` (`GenReferralLoyaltyDashboard`)
- `/security-key-mfa-setup` (`GenSecurityKeyMfaSetup`)
- `/security-threat-monitoring-super-admin` (`GenSecurityThreatMonitoringSuperAdmin`)
- `/strategic-account-reviews` (`GenStrategicAccountReviews`)
- `/subscription-plan-comparison` (`GenSubscriptionPlanComparison`)
- `/system-health-super-admin` (`GenSystemHealthSuperAdmin`)
- `/system-maintenance-downtime-schedule` (`GenSystemMaintenanceDowntimeSchedule`)
- `/system-notification-center-super-admin` (`GenSystemNotificationCenterSuperAdmin`)
- `/usage-quotas-limits` (`GenUsageQuotasLimits`)
- `/user-feedback-bug-reporting` (`GenUserFeedbackBugReporting`)
- `/workflow-automations-business-admin` (`GenWorkflowAutomationsBusinessAdmin`)
- `/workspaces-organizations-super-admin` (`GenWorkspacesOrganizationsSuperAdmin`)

---

## 8) Backend Architecture (intelliscan-server)

**Runtime**
- Express server with WebSocket support (Socket.IO)
- SQLite persistence (primary runtime DB: `intelliscan-server/intelliscan.db`)

**Key characteristics**
- Feature-rich monolith: most behavior is implemented in `intelliscan-server/index.js`
- Some additional modular utilities exist under `intelliscan-server/src/*` but are not consistently used by `index.js` (recommend consolidating).

---

## 9) Backend API Overview (What’s Implemented)

There are ~144 route handlers in `intelliscan-server/index.js`. Full extracted lists exist in:
- `routes.txt` (top-level snapshot)
- `intelliscan-server/api_routes.txt` (line-indexed list)

### 9.1 Auth + Sessions
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- Session management: `/api/sessions/*`

### 9.2 Access + Quota
- `GET /api/access/me`, `GET /api/access/matrix`
- `GET /api/user/quota`
- `POST /api/user/simulate-upgrade` (dev helper)

### 9.3 Scanning / OCR
- `POST /api/scan` (single card; multilingual; normalized output)
- `POST /api/scan-multi` (multi-card group photo; multilingual; normalization + dedupe hints)

AI providers:
- Gemini (`GEMINI_API_KEY`)
- OpenAI appears in some endpoints (requires its own key if enabled)
- Tesseract appears as a local fallback model option

Offline behavior:
- If cloud AI providers are unavailable, `/api/scan` falls back safely without crashing the server:
  - Tesseract OCR runs in an isolated worker process (`src/workers/tesseract_ocr_worker.js`), so image decode/OCR failures cannot take down the API.
  - If Tesseract also fails, the API can return deterministic mock fallback data when `ALLOW_MOCK_AI_FALLBACK=true` (or in non-production by default).
- For `/api/scan-multi` (group photos), Tesseract is intentionally disabled because it cannot reliably segment 2-25 cards. If Gemini/OpenAI are unavailable, the server returns a deterministic multi-card fallback payload so the UI still gets a usable `cards[]` list.

### 9.4 Contacts + Intelligence
- `GET/POST/DELETE /api/contacts`
- Relationships, mutual connections, semantic search, org chart endpoints
- Auto AI draft creation on contact save (when email exists)
- Contacts now persist multilingual/native-script fields when provided by OCR:
  - `name_native`, `company_native`, `title_native`, `detected_language`

### 9.5 Events
- `GET/POST/DELETE /api/events`
- Contacts can store `event_id`

### 9.6 Data Policies + Compliance
- `GET/PUT /api/workspace/data-policies`
- Retention purge + PII masking rules influence contact storage and audit logging

### 9.7 Data Quality Center
- `GET /api/workspace/data-quality/dedupe-queue`
- `POST /api/workspace/data-quality/queue/:id/merge`
- `POST /api/workspace/data-quality/queue/:id/dismiss`

### 9.8 Email Marketing
- `GET /api/campaigns`
- `GET /api/campaigns/audience-preview`
- `POST /api/campaigns/auto-write`
- `POST /api/campaigns/send`

SMTP modes:
- If SMTP env vars are missing (or still placeholder values), campaigns run in simulated mode but are still recorded.
- If SMTP env vars are valid, campaigns send real email via Nodemailer.

### 9.9 Billing (Now Functional)
- `GET /api/billing/plans`
- `POST /api/billing/create-order` (Razorpay order create; simulated if keys missing)
- `POST /api/billing/verify-payment` (signature verify + tier upgrade + invoice)
- `GET /api/workspace/billing/overview`
- `GET/POST /api/workspace/billing/payment-methods`
- `POST /api/workspace/billing/payment-methods/:id/set-primary`
- `GET /api/workspace/billing/invoices`
- `GET /api/workspace/billing/invoices/export`
- `GET /api/workspace/billing/invoices/:id/receipt`

### 9.10 Calendar / Booking (Enterprise/Admin gated)
- `GET/POST/PUT/DELETE /api/calendar/calendars`
- Sharing links + accept-share
- Calendar events + reschedule + respond tokens
- Availability + booking links + public booking pages
- AI helper endpoints for suggesting times and generating descriptions

### 9.11 Admin (Super Admin)
- Integration health + failed sync retry queue
- Incidents management
- Model registry controls

---

## 10) Data Storage (SQLite)

Primary runtime DB file (used by `intelliscan-server/src/utils/db.js`): `intelliscan-server/intelliscan.db`

Other DB artifacts also exist (likely legacy or earlier experiments):
- `intelliscan-server/database.sqlite`
- `intelliscan-server/intelliscan-database.sqlite`

Notable tables (non-exhaustive, based on code inspection):
- `users`, `sessions`
- `contacts`, `events`
- `user_quotas`
- `workspace_policies`
- `audit_trail`
- `data_quality_dedupe_queue`
- `email_campaigns`, `campaign_recipients`
- `billing_payment_methods`, `billing_invoices`
- `integration_sync_jobs`
- Calendar subsystem tables (calendars, events, booking links, availability, etc.)

Recommendation: document schema in one place and add migrations (SQLite migrations now; Postgres later).

---

## 11) What’s Fully “End-to-End” Today (Recommended Demo Script)

1. Sign up -> sign in
2. Scan single card -> save contact -> see AI draft auto-created
3. Scan group photo -> save multiple contacts
4. Create event -> scan with event assignment
5. Run Data Policies page -> save policies
6. Run Data Quality Center -> merge/dismiss a dedupe suggestion
7. Create Email Campaign -> audience preview -> auto-write -> send (SMTP or simulated)
8. Use Event Kiosk -> real scan -> qualify -> finalize (saves a contact)
9. Open Billing -> usage + payment methods + invoices + export receipt

---

## 12) What’s Still Lacking (Priority Improvements)

### Production-Grade Security (High Priority)
- Remove fallback hard-coded `JWT_SECRET` default for production; fail fast if missing.
- Prefer httpOnly, `Secure` cookies in production (current cookie fallback is helpful for persistence but not a full secure auth strategy).
- Hash session tokens in DB (don’t store raw JWT string in `sessions`).
- Tighten CORS and add per-route rate limit strategy (there is both custom and `express-rate-limit` usage; consolidate).
- Add email verification + real password reset flow.

### Scalability (High Priority)
- Split `intelliscan-server/index.js` into routers/modules (auth, scan, contacts, billing, calendar, admin).
- Replace SQLite with Postgres for real multi-tenant scale and concurrency.
- Introduce a background job queue for heavy tasks (multi-card OCR, CRM sync retries, email campaign sending at scale).

### Reliability + Observability (Medium Priority)
- Structured logging (JSON logs), request IDs, and error boundaries.
- Metrics and dashboards for OCR latency, error rates, queue depth, email send failures.

### Testing + CI (Medium Priority)
- Expand backend tests beyond auth/pipeline.
- Add frontend smoke tests (Playwright) for core routes.
- Add CI pipeline: lint + build + test.

### Product Additions (Nice-to-Have / Next Wave)
- Razorpay is implemented for order creation + signature verification; add webhook reconciliation + refunds/subscriptions for production readiness.
- i18n for UI text (OCR supports multilingual extraction; UI translations are separate).
- Better admin tooling: user management, workspace provisioning, audit exports.
- Stronger data export/import workflows (bulk CSV mapping already has prototypes).

---

## 13) Notes / Cleanup Candidates

These don’t break functionality, but are worth cleaning:
- Multiple DB artifacts exist (for example `intelliscan-server/database.sqlite`, `intelliscan-server/intelliscan-database.sqlite`). The current runtime DB is `intelliscan-server/intelliscan.db`.
- Several debug/output files exist in `intelliscan-server/` (`syntax_err.txt`, `full_err.txt`, `target_tail.txt`, etc.).
- There is duplicated/parallel implementation under `intelliscan-server/src/*` while `index.js` contains its own logic. Consolidate to one approach.

---

## 14) Related Docs (Deep Dives)

In `ALL_DOCUMENT_OF_PROJECT/`:
- `Allfeatures.md` (competitor feature backlog)
- `IntelliScan_Complete_Project_Overview.md`
- `IntelliScan_Complete_Architecture.md`
- `IntelliScan_RBAC_Matrix.md`
- `PROJECT_ARCHITECTURE.md`

In the repo root:
- `IntelliScan_Data_Dictionary.md`
- `IntelliScan_UseCaseDiagrams.md`
- `IntelliScan_InteractionDiagrams.md`
