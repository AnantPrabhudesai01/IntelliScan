# IntelliScan Master Documentation (Deep Workflow, Pages, Files)

Generated: `2026-04-03T21:24:48.491Z`

This document explains the IntelliScan project end-to-end:

1. Full platform workflow (how the system works as one product).
2. Module workflows (feature-by-feature).
3. Page catalog (every route and the APIs it depends on).
4. File index (frontend + backend + docs + assets).

If you are preparing for an academic presentation, also use:

- `APRIL_04_2026_PRESENTATION_PACK.md`
- `intelliscan-server/College_Document/Presentation-1_intelliscan.md`
- `intelliscan-server/College_Document/Presentation-2_intelliscan.md`

---

## 0) Where To Start (Fast)

If you need the single best entry points for understanding the whole project:

1. `PROJECT_STATUS.md` (what is actually working end-to-end).
2. `APRIL_04_2026_PRESENTATION_PACK.md` (presentation links + demo script).
3. `INTELLISCAN_MASTER_DOCUMENTATION.md` (this file: pages + files + dependencies).
4. `DATA_DICTIONARY_INTELLISCAN_DB.md` (authoritative DB schema).

---

## 1) Repository Overview

Top-level structure:

- `intelliscan-app/`: React + Vite frontend (SPA).
- `intelliscan-server/`: Express + SQLite backend (REST + Socket.IO).
- `DATA_DICTIONARY_INTELLISCAN_DB.md`: authoritative SQLite schema dump (generated).
- `ALL_DOCUMENT_OF_PROJECT/`: internal docs bundle (architecture, RBAC, diagrams, roadmap).

---

## 2) How To Run (Local Dev)

Backend:

```powershell
cd intelliscan-server
npm install
npm run dev
```

Frontend:

```powershell
cd intelliscan-app
npm install
npm run dev
```

Key ports:

- Frontend (Vite): `http://localhost:5173`
- Backend (Express): `http://127.0.0.1:5000`

Environment templates:

- Server: `intelliscan-server/.env.example`
- App: `intelliscan-app/.env.example`

---

## 3) Roles, Tiers, and Access Model

Roles:

- `user`: standard authenticated user.
- `business_admin`: enterprise/workspace admin.
- `super_admin`: platform operator/admin routes.

Tiers:

- `personal` (free)
- `pro` (paid personal)
- `enterprise` (workspace features)

Access is enforced in two places:

1. Frontend: Route guards (RoleGuard or RequireAuth).
2. Backend: JWT auth middleware + role checks.

See also: `ALL_DOCUMENT_OF_PROJECT/IntelliScan_RBAC_Matrix.md`

---

## 4) Global System Workflow (How Everything Connects)

High-level lifecycle:

1. Public visitor reaches landing/pricing/docs.
2. User authenticates and receives JWT.
3. User scans cards (single or group) to create contacts.
4. Contacts become the shared dependency for events, drafts, coach, email marketing, and exports.
5. Enterprise admins manage workspace modules: policies, data quality, integrations, billing, team management.
6. Super admins manage platform modules: system health, model status, incidents, job queues.

Global diagrams:

- `IntelliScan_Global_ActivityDiagram.md`
- `IntelliScan_Global_InteractionDiagram.md`

---

## 4.1 Core Interdependency Graph (Data + Modules)

This graph shows the most important dependencies (contacts is the central object):

```mermaid
flowchart TD
    AUTH[Auth + Access Profile] --> QUOTA[User Quotas]
    AUTH --> SCAN[Scan Single]
    AUTH --> GSCAN[Scan Group Photo]
    SCAN --> CONTACTS[Contacts CRM]
    GSCAN --> CONTACTS
    CONTACTS --> EVENTS[Events Tagging]
    CONTACTS --> DRAFTS[AI Drafts]
    CONTACTS --> COACH[AI Coach]
    CONTACTS --> EMAIL[Email Marketing]
    CONTACTS --> EXPORT[CSV/vCard Export]
    WORKSPACE[Workspace (Enterprise)] --> CONTACTS
    WORKSPACE --> POLICIES[Policies]
    WORKSPACE --> DQ[Data Quality]
    WORKSPACE --> INTEG[Integrations]
    BILL[Billing (Razorpay)] --> AUTH
    ADMIN[Super Admin] --> INTEG
    ADMIN --> MODELS[AI Models + Engine Config]
```

---

## 5) Interdependency Matrix (Modules -> Tables -> APIs)

| Module | Depends On | Key Tables | Key APIs |
|---|---|---|---|
| Authentication & Access | All protected pages | users, sessions, user_quotas, onboarding_prefs | /api/auth/*, /api/access/*, /api/sessions/* |
| Scan (Single) | Auth + quotas | contacts, user_quotas, events (optional tag) | POST /api/scan, GET /api/user/quota |
| Scan (Group Photo) | Enterprise tier + group quota | contacts, user_quotas, event_contact_links (optional) | POST /api/scan-multi |
| Contacts CRM | Stored contacts | contacts, contact_relationships, deals | GET/POST/PUT/DELETE /api/contacts*, /api/org-chart/* |
| Events & Campaigns | Contacts tagging | events, event_contact_links | GET/POST/DELETE /api/events |
| AI Drafts | Contacts | ai_drafts, contacts | GET/POST /api/drafts*, POST /api/drafts/generate, POST /api/drafts/:id/send |
| Email Marketing | Contacts with emails | email_templates, email_lists, email_campaigns, email_sends, email_clicks | GET/POST /api/campaigns, /api/email/* tracking |
| Calendar & Booking | Enterprise role/tier | calendars, calendar_events, booking_links, availability_slots, event_attendees | GET/POST /api/calendar/*, /api/book/:slug |
| Data Quality (Dedupe/Merge) | Workspace contacts | data_quality_dedupe_queue, contacts | GET /api/workspace/data-quality/dedupe-queue, POST merge/dismiss |
| Policies (Compliance) | Workspace admin actions | workspace_policies, audit_trail | GET/PUT /api/workspace/data-policies |
| Integrations (Webhooks/CRM) | Workspace config | webhooks, crm_mappings, crm_sync_log, integration_sync_jobs | GET/POST /api/webhooks, /api/crm*, /api/admin/integrations/* |
| Billing (Razorpay) | Authenticated user | billing_orders, users, user_quotas | POST /api/billing/razorpay/order, POST /api/billing/razorpay/verify |
| Admin (Super Admin) | super_admin role | ai_models, platform_incidents, integration_sync_jobs, audit_trail | /api/admin/*, /api/engine/*, /api/sandbox/* |

---

## 6) Feature Workflows (Detailed)

For each workflow below you can cross-check the full UML packs:

- Use cases: `IntelliScan_UseCaseDiagrams.md`
- Activities: `IntelliScan_ActivityDiagrams.md`
- Interactions: `IntelliScan_InteractionDiagrams.md`
- Classes: `IntelliScan_ClassDiagrams.md`

### 6.1 Authentication and Session Workflow

1. `POST /api/auth/register` creates a user record.
2. `POST /api/auth/login` returns a JWT and stores a session row.
3. Frontend stores token and uses it on all subsequent `/api/*` calls.
4. `GET /api/access/me` is used to compute the active access profile.

Key data:

- `users`, `sessions`, `user_quotas`, `onboarding_prefs`

### 6.2 Scan (Single Card) Workflow

1. User uploads an image on Scan page.
2. Frontend calls `POST /api/scan`.
3. Backend validates auth and quota.
4. Backend runs the AI extraction pipeline (Gemini -> OpenAI -> offline OCR fallback).
5. User saves the extracted contact (persisted to `contacts`).

Key data:

- `contacts`, `user_quotas`, `events` (optional tagging)

### 6.3 Scan (Group Photo / Multi-card) Workflow

1. Enterprise user uploads group photo.
2. Frontend calls `POST /api/scan-multi`.
3. Backend validates enterprise tier + group scan quota.
4. Backend extracts an array of contacts and inserts them.
5. Group scan usage increments.

Key data:

- `contacts`, `user_quotas`, `event_contact_links`

### 6.4 Contacts CRM Workflow

1. Contacts page loads `GET /api/contacts`.
2. User can search/filter, edit, enrich, export CSV/vCard.
3. Relationship endpoints connect contacts into org charts.

Key data:

- `contacts`, `contact_relationships`, `deals`

### 6.5 Events Workflow

1. User creates an event `POST /api/events`.
2. Contacts can be tagged to an event (via links table or contact fields depending on flow).
3. Events page shows “leads scanned per event”.

Key data:

- `events`, `event_contact_links`, `contacts`

### 6.6 AI Drafts Workflow

1. User requests a draft: `POST /api/drafts/generate` with contact context.
2. Backend generates text via AI text pipeline and stores an `ai_drafts` row.
3. User can send: `POST /api/drafts/:id/send` (SMTP).

Key data:

- `ai_drafts`, `contacts`

### 6.7 Email Marketing Workflow

1. Build templates and lists.
2. Create a campaign and send.
3. Track opens/clicks with tracking endpoints.

Key data:

- `email_templates`, `email_lists`, `email_campaigns`, `email_sends`, `email_clicks`

### 6.8 Calendar and Booking Workflow

1. Enterprise admins configure calendars, availability, and booking links.
2. Public users can open booking pages and schedule meetings.
3. SMTP emails are sent for booking notifications and invites.

Key data:

- `calendars`, `calendar_events`, `availability_slots`, `booking_links`, `event_attendees`

### 6.9 Compliance Policies Workflow

1. Enterprise admin configures policies on the Policies page.
2. Backend persists policies to `workspace_policies`.
3. Policies affect retention and redaction behaviors (enforcement scope depends on feature implementation).

Key data:

- `workspace_policies`, `audit_trail`

### 6.10 Data Quality (Dedupe/Merge) Workflow

1. System creates dedupe suggestions in `data_quality_dedupe_queue`.
2. Workspace admin reviews queue.
3. Admin merges or dismisses items (writes back to contacts + queue status).

Key data:

- `data_quality_dedupe_queue`, `contacts`

### 6.11 Integrations Workflow

1. Workspace admin configures CRM mapping + webhooks.
2. Sync jobs are tracked in `integration_sync_jobs`.
3. Admin dashboards can review failed syncs and retry.

Key data:

- `webhooks`, `crm_mappings`, `crm_sync_log`, `integration_sync_jobs`

### 6.12 Billing (Razorpay) Workflow

1. Frontend requests a Razorpay order from backend.
2. Razorpay checkout completes on client.
3. Backend verifies signature and marks order as paid.
4. Backend upgrades tier and quota limits.

Key data:

- `billing_orders`, `users`, `user_quotas`

---

## 6.13 Key Files Deep Dive (Frontend + Backend)

Frontend:

1. `intelliscan-app/src/main.jsx`: React bootstrap + providers.
2. `intelliscan-app/src/App.jsx`: routing tree + role gating + generated routes.
3. `intelliscan-app/src/context/RoleContext.jsx`: login/logout + access profile.
4. `intelliscan-app/src/utils/auth.js`: token storage helpers.
5. `intelliscan-app/src/pages/ScanPage.jsx`: scan flows + preview + quota UI.

Backend:

1. `intelliscan-server/index.js`: monolithic but complete API server (most features implemented here).
2. `intelliscan-server/src/utils/db.js`: DB connection and helpers (intelliscan.db).
3. `intelliscan-server/src/middleware/auth.js`: JWT + role enforcement.
4. `intelliscan-server/src/utils/smtp.js`: SMTP delivery and simulation mode.
5. `intelliscan-server/src/workers/tesseract_ocr_worker.js`: safe OCR fallback worker.

---

## 7) Backend API Catalog (Grouped)

This is parsed best-effort from `routes.txt`.

### /api/access

- `GET` `/api/access/matrix`
- `GET` `/api/access/me`

### /api/admin

- `POST` `/api/admin/incidents/:id/ack`
- `POST` `/api/admin/incidents/:id/resolve`
- `DELETE` `/api/admin/incidents/:id`
- `GET` `/api/admin/incidents`
- `POST` `/api/admin/incidents`
- `POST` `/api/admin/integrations/failed-syncs/:id/retry`
- `GET` `/api/admin/integrations/failed-syncs`
- `GET` `/api/admin/integrations/health`
- `GET` `/api/admin/leaderboard`
- `PUT` `/api/admin/models/:id/status`
- `GET` `/api/admin/models`
- `POST` `/api/admin/models`

### /api/analytics

- `GET` `/api/analytics/dashboard`
- `POST` `/api/analytics/log`
- `GET` `/api/analytics/stats`

### /api/auth

- `POST` `/api/auth/login`
- `GET` `/api/auth/me`
- `POST` `/api/auth/register`

### /api/calendar

- `GET` `/api/calendar/accept-share/:token`
- `POST` `/api/calendar/ai/generate-description`
- `POST` `/api/calendar/ai/suggest-time`
- `GET` `/api/calendar/availability/:userId`
- `PUT` `/api/calendar/availability`
- `GET` `/api/calendar/booking-links`
- `POST` `/api/calendar/booking-links`
- `GET` `/api/calendar/booking/:slug`
- `POST` `/api/calendar/calendars/:id/share`
- `DELETE` `/api/calendar/calendars/:id`
- `PUT` `/api/calendar/calendars/:id`
- `GET` `/api/calendar/calendars`
- `POST` `/api/calendar/calendars`
- `DELETE` `/api/calendar/events/:id`
- `GET` `/api/calendar/events/:id`
- `GET` `/api/calendar/events`
- `POST` `/api/calendar/events`
- `GET` `/api/calendar/respond/:token`

### /api/campaigns

- `GET` `/api/campaigns/audience-preview`
- `POST` `/api/campaigns/auto-write`
- `GET` `/api/campaigns`

### /api/cards

- `POST` `/api/cards/generate-design`
- `POST` `/api/cards/save`

### /api/chat

- `POST` `/api/chat/support`

### /api/chats

- `GET` `/api/chats/:workspaceId`

### /api/coach

- `GET` `/api/coach/insights`

### /api/contacts

- `PUT` `/api/contacts/:id/deal`
- `POST` `/api/contacts/:id/enrich`
- `POST` `/api/contacts/:id/enroll-sequence`
- `GET` `/api/contacts/:id/relationships`
- `DELETE` `/api/contacts/:id`
- `POST` `/api/contacts/export-crm`
- `GET` `/api/contacts/mutual`
- `POST` `/api/contacts/relationships`
- `GET` `/api/contacts/semantic-search`
- `GET` `/api/contacts/stats`
- `GET` `/api/contacts/stats`
- `GET` `/api/contacts`
- `POST` `/api/contacts`

### /api/crm

- `GET` `/api/crm/config`
- `POST` `/api/crm/config`
- `POST` `/api/crm/connect`
- `POST` `/api/crm/disconnect`
- `POST` `/api/crm/export/:provider`
- `GET` `/api/crm/schema`
- `GET` `/api/crm/sync-log`

### /api/crm-mappings

- `POST` `/api/crm-mappings`

### /api/drafts

- `POST` `/api/drafts/:id/send`
- `PUT` `/api/drafts/:id/send`
- `DELETE` `/api/drafts/:id`
- `POST` `/api/drafts/generate`
- `GET` `/api/drafts`
- `POST` `/api/drafts`

### /api/email-sequences

- `GET` `/api/email-sequences`
- `POST` `/api/email-sequences`

### /api/engine

- `GET` `/api/engine/config`
- `PUT` `/api/engine/config`
- `GET` `/api/engine/stats`
- `GET` `/api/engine/stats`
- `POST` `/api/engine/versions/:id/rollback`
- `GET` `/api/engine/versions`

### /api/enterprise

- `GET` `/api/enterprise/audit-logs`
- `GET` `/api/enterprise/system-health`
- `GET` `/api/enterprise/webhooks`
- `GET` `/api/enterprise/workspaces`

### /api/events

- `DELETE` `/api/events/:id`
- `GET` `/api/events`
- `POST` `/api/events`

### /api/health

- `GET` `/api/health`

### /api/my-card

- `GET` `/api/my-card`

### /api/onboarding

- `POST` `/api/onboarding`

### /api/org-chart

- `GET` `/api/org-chart/:company`

### /api/routing-rules

- `GET` `/api/routing-rules`
- `POST` `/api/routing-rules`

### /api/sandbox

- `DELETE` `/api/sandbox/logs`
- `GET` `/api/sandbox/logs`
- `POST` `/api/sandbox/test`

### /api/scan

- `POST` `/api/scan`

### /api/scan-multi

- `POST` `/api/scan-multi`

### /api/search

- `GET` `/api/search/global`

### /api/sessions

- `DELETE` `/api/sessions/:id`
- `GET` `/api/sessions/me`
- `DELETE` `/api/sessions/others`

### /api/signals

- `GET` `/api/signals`

### /api/user

- `GET` `/api/user/quota`
- `POST` `/api/user/simulate-upgrade`

### /api/webhooks

- `DELETE` `/api/webhooks/:id`
- `GET` `/api/webhooks`
- `POST` `/api/webhooks`

### /api/workspace

- `GET` `/api/workspace/billing/invoices/:id/receipt`
- `GET` `/api/workspace/billing/invoices/export`
- `GET` `/api/workspace/billing/invoices`
- `GET` `/api/workspace/billing/overview`
- `POST` `/api/workspace/billing/payment-methods/:id/set-primary`
- `GET` `/api/workspace/billing/payment-methods`
- `POST` `/api/workspace/billing/payment-methods`
- `GET` `/api/workspace/contacts`
- `GET` `/api/workspace/data-policies`
- `PUT` `/api/workspace/data-policies`
- `GET` `/api/workspace/data-quality/dedupe-queue`
- `POST` `/api/workspace/data-quality/queue/:id/dismiss`
- `POST` `/api/workspace/data-quality/queue/:id/merge`


---

## 7.1 Page Health (Missing Endpoints / Prototype Pages)

Some pages (especially auto-migrated/generated routes) are UI-first prototypes and may not have complete backend wiring.
For the current best-effort audit of missing endpoints and token usage, see:

- `PAGE_HEALTH_REPORT.md`

---

## 8) Page Catalog (Every Route)

This section is generated by parsing `intelliscan-app/src/App.jsx` (explicit routes) and `intelliscan-app/src/pages/generated/routes.json` (generated routes), and scanning each page file for `/api/*` usage.

| Route | Section | Layout | Gate | Component | File | APIs Used |
|---|---|---|---|---|---|---|
| / | Public | Public/None | public | RootRoute | intelliscan-app/src/App.jsx |  |
| /404-system-error-states | Generated | DashboardLayout | auth_required | Gen404SystemErrorStates | intelliscan-app/src/pages/generated/Gen404SystemErrorStates.jsx |  |
| /admin/custom-models | Super Admin | AdminLayout | super_admin | CustomModelsPage | intelliscan-app/src/pages/admin/CustomModelsPage.jsx | /api/admin/models, /api/admin/models/:param/status |
| /admin/dashboard | Super Admin | AdminLayout | super_admin | AdminDashboard | intelliscan-app/src/pages/AdminDashboard.jsx | /api/v2/scan |
| /admin/engine-performance | Super Admin | AdminLayout | super_admin | EnginePerformance | intelliscan-app/src/pages/EnginePerformance.jsx | /api/engine/stats |
| /admin/feedback | Super Admin | AdminLayout | super_admin | SuperAdminFeedbackPage | intelliscan-app/src/pages/SuperAdminFeedbackPage.jsx |  |
| /admin/incidents | Super Admin | AdminLayout | super_admin | SystemIncidentCenter | intelliscan-app/src/pages/admin/SystemIncidentCenter.jsx | /api/admin/incidents, /api/admin/incidents/${id, /api/admin/incidents/:param/${action |
| /admin/integration-health | Super Admin | AdminLayout | super_admin | JobQueuesPage | intelliscan-app/src/pages/admin/JobQueuesPage.jsx | /api/admin/integrations/failed-syncs/:param/retry, /api/admin/integrations/health |
| /admin/job-queues | Super Admin | AdminLayout | super_admin | JobQueuesPage | intelliscan-app/src/pages/admin/JobQueuesPage.jsx | /api/admin/integrations/failed-syncs/:param/retry, /api/admin/integrations/health |
| /advanced-api-explorer-sandbox | Generated | AdminLayout | super_admin | GenAdvancedApiExplorerSandbox | intelliscan-app/src/pages/generated/GenAdvancedApiExplorerSandbox.jsx |  |
| /advanced-api-webhook-monitor | Generated | AdminLayout | super_admin | GenAdvancedApiWebhookMonitor | intelliscan-app/src/pages/generated/GenAdvancedApiWebhookMonitor.jsx |  |
| /advanced-csv-json-export-mapper | Generated | DashboardLayout | auth_required | GenAdvancedCsvJsonExportMapper | intelliscan-app/src/pages/generated/GenAdvancedCsvJsonExportMapper.jsx |  |
| /advanced-security-audit-logs-1 | Generated | AdminLayout | super_admin | GenAdvancedSecurityAuditLogs1 | intelliscan-app/src/pages/generated/GenAdvancedSecurityAuditLogs1.jsx | /api/enterprise/audit-logs |
| /advanced-security-audit-logs-2 | Generated | AdminLayout | super_admin | GenAdvancedSecurityAuditLogs2 | intelliscan-app/src/pages/generated/GenAdvancedSecurityAuditLogs2.jsx |  |
| /advanced-segment-builder | Generated | DashboardLayout | auth_required | GenAdvancedSegmentBuilder | intelliscan-app/src/pages/generated/GenAdvancedSegmentBuilder.jsx |  |
| /ai-confidence-audit-feedback-hub | Generated | DashboardLayout | auth_required | GenAiConfidenceAuditFeedbackHub | intelliscan-app/src/pages/generated/GenAiConfidenceAuditFeedbackHub.jsx |  |
| /ai-conflict-resolution-human-in-the-loop | Generated | DashboardLayout | auth_required | GenAiConflictResolutionHumanInTheLoop | intelliscan-app/src/pages/generated/GenAiConflictResolutionHumanInTheLoop.jsx |  |
| /ai-maintenance-retraining-logs | Generated | DashboardLayout | auth_required | GenAiMaintenanceRetrainingLogs | intelliscan-app/src/pages/generated/GenAiMaintenanceRetrainingLogs.jsx |  |
| /ai-model-versioning-rollback | Generated | AdminLayout | super_admin | GenAiModelVersioningRollback | intelliscan-app/src/pages/generated/GenAiModelVersioningRollback.jsx |  |
| /ai-training-tuning-super-admin | Generated | AdminLayout | super_admin | GenAiTrainingTuningSuperAdmin | intelliscan-app/src/pages/generated/GenAiTrainingTuningSuperAdmin.jsx |  |
| /api-docs | Public | Public/None | public | ApiDocsPage | intelliscan-app/src/pages/ApiDocsPage.jsx |  |
| /api-integrations | Generated | AdminLayout | super_admin | GenApiIntegrations | intelliscan-app/src/pages/generated/GenApiIntegrations.jsx |  |
| /api-performance-webhooks | Generated | DashboardLayout | auth_required | GenApiPerformanceWebhooks | intelliscan-app/src/pages/generated/GenApiPerformanceWebhooks.jsx |  |
| /api-webhook-configuration-1 | Generated | DashboardLayout | auth_required | GenApiWebhookConfiguration1 | intelliscan-app/src/pages/generated/GenApiWebhookConfiguration1.jsx |  |
| /api-webhook-configuration-2 | Generated | DashboardLayout | auth_required | GenApiWebhookConfiguration2 | intelliscan-app/src/pages/generated/GenApiWebhookConfiguration2.jsx |  |
| /api-webhook-logs-debugging | Generated | DashboardLayout | auth_required | GenApiWebhookLogsDebugging | intelliscan-app/src/pages/generated/GenApiWebhookLogsDebugging.jsx |  |
| /audit-logs-security | Generated | AdminLayout | super_admin | GenAuditLogsSecurity | intelliscan-app/src/pages/generated/GenAuditLogsSecurity.jsx | /api/v2/contacts/bulk_export |
| /batch-processing-monitor-user-dashboard | Generated | DashboardLayout | auth_required | GenBatchProcessingMonitorUserDashboard | intelliscan-app/src/pages/generated/GenBatchProcessingMonitorUserDashboard.jsx |  |
| /billing-usage | Generated | DashboardLayout | auth_required | GenBillingUsage | intelliscan-app/src/pages/generated/GenBillingUsage.jsx |  |
| /book/:slug | Public | Public/None | public | BookingPage | intelliscan-app/src/pages/calendar/BookingPage.jsx | /api/calendar/booking/${slug |
| /bulk-contact-export-wizard-1 | Generated | DashboardLayout | auth_required | GenBulkContactExportWizard1 | intelliscan-app/src/pages/generated/GenBulkContactExportWizard1.jsx |  |
| /bulk-contact-export-wizard-2 | Generated | DashboardLayout | auth_required | GenBulkContactExportWizard2 | intelliscan-app/src/pages/generated/GenBulkContactExportWizard2.jsx |  |
| /bulk-member-invitation-import | Generated | DashboardLayout | auth_required | GenBulkMemberInvitationImport | intelliscan-app/src/pages/generated/GenBulkMemberInvitationImport.jsx |  |
| /compliance-data-sovereignty-super-admin | Generated | AdminLayout | super_admin | GenComplianceDataSovereigntySuperAdmin | intelliscan-app/src/pages/generated/GenComplianceDataSovereigntySuperAdmin.jsx |  |
| /compliance-disclosure-legal-center | Generated | DashboardLayout | auth_required | GenComplianceDisclosureLegalCenter | intelliscan-app/src/pages/generated/GenComplianceDisclosureLegalCenter.jsx |  |
| /contact-detail-view | Generated | DashboardLayout | auth_required | GenContactDetailView | intelliscan-app/src/pages/generated/GenContactDetailView.jsx |  |
| /contact-merge-deduplication | Generated | DashboardLayout | auth_required | GenContactMergeDeduplication | intelliscan-app/src/pages/generated/GenContactMergeDeduplication.jsx |  |
| /dashboard | Public | Public/None | public | Unknown | intelliscan-app/src/App.jsx |  |
| /dashboard/calendar | Dashboard | DashboardLayout | business_admin, super_admin | CalendarPage | intelliscan-app/src/pages/calendar/CalendarPage.jsx | /api/calendar/calendars, /api/calendar/events, /api/calendar/events/${eventToDelete.id, /api/calendar/events/:param/reschedule, /api/calendar/events?start=:param&end=:param&calendar_ids=${selectedCalendarIds.join( |
| /dashboard/calendar/availability | Dashboard | DashboardLayout | business_admin, super_admin | AvailabilityPage | intelliscan-app/src/pages/calendar/AvailabilityPage.jsx | /api/calendar/availability, /api/calendar/availability/${user.id |
| /dashboard/calendar/booking-links | Dashboard | DashboardLayout | business_admin, super_admin | BookingLinksPage | intelliscan-app/src/pages/calendar/BookingLinksPage.jsx | /api/calendar/booking-links |
| /dashboard/card-creator | Dashboard | DashboardLayout | user, business_admin, super_admin | CardCreatorPage | intelliscan-app/src/pages/CardCreatorPage.jsx |  |
| /dashboard/coach | Dashboard | DashboardLayout | user, business_admin, super_admin | CoachPage | intelliscan-app/src/pages/dashboard/CoachPage.jsx | /api/coach/insights |
| /dashboard/contacts | Dashboard | DashboardLayout | user, business_admin, super_admin | ContactsPage | intelliscan-app/src/pages/ContactsPage.jsx | /api/contacts/:param/enroll-sequence, /api/contacts/stats, /api/crm/export/${provider, /api/drafts/${generatedDraft.id, /api/drafts/:param/send, /api/drafts/generate, /api/email-sequences |
| /dashboard/drafts | Dashboard | DashboardLayout | user, business_admin, super_admin | DraftsPage | intelliscan-app/src/pages/dashboard/DraftsPage.jsx | /api/drafts, /api/drafts/${id, /api/drafts/:param/send |
| /dashboard/email-marketing | Dashboard | DashboardLayout | business_admin, super_admin | EmailMarketingPage | intelliscan-app/src/pages/email/EmailMarketingPage.jsx | /api/email/analytics/overview, /api/email/campaigns |
| /dashboard/email-marketing/campaigns | Dashboard | DashboardLayout | business_admin, super_admin | CampaignListPage | intelliscan-app/src/pages/email/CampaignListPage.jsx | /api/email/campaigns, /api/email/campaigns/${id |
| /dashboard/email-marketing/campaigns/:id | Dashboard | DashboardLayout | business_admin, super_admin | CampaignDetailPage | intelliscan-app/src/pages/email/CampaignDetailPage.jsx | /api/email/campaigns/${id |
| /dashboard/email-marketing/campaigns/new | Dashboard | DashboardLayout | business_admin, super_admin | CampaignBuilderPage | intelliscan-app/src/pages/email/CampaignBuilderPage.jsx | /api/email/campaigns, /api/email/campaigns/:param/send, /api/email/lists, /api/email/templates, /api/email/templates/generate-ai |
| /dashboard/email-marketing/lists | Dashboard | DashboardLayout | business_admin, super_admin | ContactListsPage | intelliscan-app/src/pages/email/ContactListsPage.jsx | /api/email/lists, /api/email/lists/${id |
| /dashboard/email-marketing/lists/:id | Dashboard | DashboardLayout | business_admin, super_admin | ListDetailPage | intelliscan-app/src/pages/email/ListDetailPage.jsx | /api/contacts, /api/email/lists/${id, /api/email/lists/:param/contacts |
| /dashboard/email-marketing/templates | Dashboard | DashboardLayout | business_admin, super_admin | TemplateLibraryPage | intelliscan-app/src/pages/email/TemplateLibraryPage.jsx | /api/email/templates |
| /dashboard/email/sequences | Dashboard | DashboardLayout | user, business_admin, super_admin | EmailSequencesPage | intelliscan-app/src/pages/email/EmailSequencesPage.jsx | /api/email-sequences |
| /dashboard/events | Dashboard | DashboardLayout | user, business_admin, super_admin | EventsPage | intelliscan-app/src/pages/dashboard/EventsPage.jsx | /api/events |
| /dashboard/feedback | Dashboard | DashboardLayout | user, business_admin | FeedbackPage | intelliscan-app/src/pages/FeedbackPage.jsx |  |
| /dashboard/kiosk | Dashboard | DashboardLayout | user, business_admin, super_admin | KioskMode | intelliscan-app/src/pages/dashboard/KioskMode.jsx | /api/contacts, /api/events, /api/scan |
| /dashboard/leaderboard | Dashboard | DashboardLayout | user, business_admin, super_admin | Leaderboard | intelliscan-app/src/pages/dashboard/Leaderboard.jsx | /api/admin/leaderboard |
| /dashboard/my-card | Dashboard | DashboardLayout | user, business_admin, super_admin | MyCardPage | intelliscan-app/src/pages/dashboard/MyCardPage.jsx | /api/cards/generate-design, /api/cards/save, /api/my-card |
| /dashboard/presence | Dashboard | DashboardLayout | user, business_admin, super_admin | MeetingToolsPage | intelliscan-app/src/pages/dashboard/MeetingToolsPage.jsx |  |
| /dashboard/scan | Dashboard | DashboardLayout | user, business_admin, super_admin | ScanPage | intelliscan-app/src/pages/ScanPage.jsx | /api/contacts, /api/contacts/mutual?company=${encodeURIComponent(extracted.company, /api/events, /api/scan, /api/scan-multi, /api/user/quota |
| /dashboard/settings | Dashboard | DashboardLayout | user, business_admin, super_admin | SettingsPage | intelliscan-app/src/pages/SettingsPage.jsx | /api/sessions/${id, /api/sessions/me, /api/sessions/others |
| /dashboard/signals | Dashboard | DashboardLayout | user, business_admin, super_admin | SignalsPage | intelliscan-app/src/pages/dashboard/SignalsPage.jsx |  |
| /data-export-history-log | Generated | DashboardLayout | auth_required | GenDataExportHistoryLog | intelliscan-app/src/pages/generated/GenDataExportHistoryLog.jsx |  |
| /data-export-migration | Generated | DashboardLayout | auth_required | GenDataExportMigration | intelliscan-app/src/pages/generated/GenDataExportMigration.jsx |  |
| /dynamic-dashboard-builder | Generated | DashboardLayout | auth_required | GenDynamicDashboardBuilder | intelliscan-app/src/pages/generated/GenDynamicDashboardBuilder.jsx |  |
| /empty-states-no-results-template | Generated | DashboardLayout | auth_required | GenEmptyStatesNoResultsTemplate | intelliscan-app/src/pages/generated/GenEmptyStatesNoResultsTemplate.jsx |  |
| /enterprise-sso-saml-config | Generated | DashboardLayout | auth_required | GenEnterpriseSsoSamlConfig | intelliscan-app/src/pages/generated/GenEnterpriseSsoSamlConfig.jsx |  |
| /enterprise-whitelabel-branding-config | Generated | DashboardLayout | auth_required | GenEnterpriseWhitelabelBrandingConfig | intelliscan-app/src/pages/generated/GenEnterpriseWhitelabelBrandingConfig.jsx |  |
| /enterprise-whitelabel-branding-config-fixed | Generated | DashboardLayout | auth_required | GenEnterpriseWhitelabelBrandingConfigFixed | intelliscan-app/src/pages/generated/GenEnterpriseWhitelabelBrandingConfigFixed.jsx |  |
| /error-resolution-center | Generated | DashboardLayout | auth_required | GenErrorResolutionCenter | intelliscan-app/src/pages/generated/GenErrorResolutionCenter.jsx |  |
| /forgot-password | Public | Public/None | public | ForgotPassword | intelliscan-app/src/pages/ForgotPassword.jsx |  |
| /global-data-retention-archiving | Generated | DashboardLayout | auth_required | GenGlobalDataRetentionArchiving | intelliscan-app/src/pages/generated/GenGlobalDataRetentionArchiving.jsx |  |
| /global-search-intelligence | Generated | DashboardLayout | auth_required | GenGlobalSearchIntelligence | intelliscan-app/src/pages/generated/GenGlobalSearchIntelligence.jsx |  |
| /global-search-universal-discovery | Generated | DashboardLayout | auth_required | GenGlobalSearchUniversalDiscovery | intelliscan-app/src/pages/generated/GenGlobalSearchUniversalDiscovery.jsx |  |
| /global-system-status-page | Generated | DashboardLayout | auth_required | GenGlobalSystemStatusPage | intelliscan-app/src/pages/generated/GenGlobalSystemStatusPage.jsx |  |
| /help-center-docs | Generated | DashboardLayout | auth_required | GenHelpCenterDocs | intelliscan-app/src/pages/generated/GenHelpCenterDocs.jsx |  |
| /insights-ai-forecasting | Generated | DashboardLayout | auth_required | GenInsightsAiForecasting | intelliscan-app/src/pages/generated/GenInsightsAiForecasting.jsx |  |
| /interactive-api-payload-explorer | Generated | DashboardLayout | auth_required | GenInteractiveApiPayloadExplorer | intelliscan-app/src/pages/generated/GenInteractiveApiPayloadExplorer.jsx |  |
| /interactive-feature-tours-help-overlays | Generated | DashboardLayout | auth_required | GenInteractiveFeatureToursHelpOverlays | intelliscan-app/src/pages/generated/GenInteractiveFeatureToursHelpOverlays.jsx |  |
| /maintenance-system-update-mode | Generated | DashboardLayout | auth_required | GenMaintenanceSystemUpdateMode | intelliscan-app/src/pages/generated/GenMaintenanceSystemUpdateMode.jsx |  |
| /marketplace | Public | Public/None | user, business_admin, super_admin | MarketplacePage | intelliscan-app/src/pages/MarketplacePage.jsx |  |
| /marketplace-integrations-business-admin | Generated | DashboardLayout | auth_required | GenMarketplaceIntegrationsBusinessAdmin | intelliscan-app/src/pages/generated/GenMarketplaceIntegrationsBusinessAdmin.jsx |  |
| /member-role-permission-matrix | Generated | DashboardLayout | auth_required | GenMemberRolePermissionMatrix | intelliscan-app/src/pages/generated/GenMemberRolePermissionMatrix.jsx |  |
| /member-role-permissions-editor-1 | Generated | DashboardLayout | auth_required | GenMemberRolePermissionsEditor1 | intelliscan-app/src/pages/generated/GenMemberRolePermissionsEditor1.jsx |  |
| /member-role-permissions-editor-2 | Generated | DashboardLayout | auth_required | GenMemberRolePermissionsEditor2 | intelliscan-app/src/pages/generated/GenMemberRolePermissionsEditor2.jsx |  |
| /onboarding | Public | Public/None | public | OnboardingPage | intelliscan-app/src/pages/OnboardingPage.jsx | /api/onboarding |
| /privacy-gdpr-command-center | Generated | AdminLayout | super_admin | GenPrivacyGdprCommandCenter | intelliscan-app/src/pages/generated/GenPrivacyGdprCommandCenter.jsx |  |
| /public-stats | Public | Public/None | public | PublicAnalyticsPage | intelliscan-app/src/pages/PublicAnalyticsPage.jsx | /api/analytics/stats |
| /referral-loyalty-dashboard | Generated | DashboardLayout | auth_required | GenReferralLoyaltyDashboard | intelliscan-app/src/pages/generated/GenReferralLoyaltyDashboard.jsx |  |
| /scan/:token | Public | Public/None | public | PageStub | intelliscan-app/src/App.jsx |  |
| /security-key-mfa-setup | Generated | DashboardLayout | auth_required | GenSecurityKeyMfaSetup | intelliscan-app/src/pages/generated/GenSecurityKeyMfaSetup.jsx |  |
| /security-threat-monitoring-super-admin | Generated | AdminLayout | super_admin | GenSecurityThreatMonitoringSuperAdmin | intelliscan-app/src/pages/generated/GenSecurityThreatMonitoringSuperAdmin.jsx |  |
| /sign-in | Public | Public/None | public | SignInPage | intelliscan-app/src/pages/SignInPage.jsx | /api/auth/login |
| /sign-up | Public | Public/None | public | SignUpPage | intelliscan-app/src/pages/SignUpPage.jsx | /api/auth/register |
| /strategic-account-reviews | Generated | DashboardLayout | auth_required | GenStrategicAccountReviews | intelliscan-app/src/pages/generated/GenStrategicAccountReviews.jsx |  |
| /subscription-plan-comparison | Public | Public/None | auth_required | GenSubscriptionPlanComparison | intelliscan-app/src/pages/generated/GenSubscriptionPlanComparison.jsx | /api/user/simulate-upgrade |
| /system-health-super-admin | Generated | AdminLayout | super_admin | GenSystemHealthSuperAdmin | intelliscan-app/src/pages/generated/GenSystemHealthSuperAdmin.jsx | /api/v2/scan |
| /system-maintenance-downtime-schedule | Generated | DashboardLayout | auth_required | GenSystemMaintenanceDowntimeSchedule | intelliscan-app/src/pages/generated/GenSystemMaintenanceDowntimeSchedule.jsx |  |
| /system-notification-center-super-admin | Generated | AdminLayout | super_admin | GenSystemNotificationCenterSuperAdmin | intelliscan-app/src/pages/generated/GenSystemNotificationCenterSuperAdmin.jsx |  |
| /u/:slug | Public | Public/None | public | PublicProfile | intelliscan-app/src/pages/generated/PublicProfile.jsx |  |
| /usage-quotas-limits | Generated | DashboardLayout | auth_required | GenUsageQuotasLimits | intelliscan-app/src/pages/generated/GenUsageQuotasLimits.jsx |  |
| /user-feedback-bug-reporting | Generated | DashboardLayout | auth_required | GenUserFeedbackBugReporting | intelliscan-app/src/pages/generated/GenUserFeedbackBugReporting.jsx |  |
| /workflow-automations-business-admin | Generated | DashboardLayout | auth_required | GenWorkflowAutomationsBusinessAdmin | intelliscan-app/src/pages/generated/GenWorkflowAutomationsBusinessAdmin.jsx |  |
| /workspace/analytics | Workspace | AdminLayout | user, business_admin, super_admin | AnalyticsPage | intelliscan-app/src/pages/AnalyticsPage.jsx | /api/analytics/dashboard?range=${timeRange |
| /workspace/billing | Workspace | AdminLayout | user, business_admin, super_admin | BillingPage | intelliscan-app/src/pages/BillingPage.jsx | /api/billing/create-order, /api/billing/plans, /api/billing/verify-payment, /api/user/quota, /api/workspace/billing/invoices, /api/workspace/billing/invoices/:param/receipt, /api/workspace/billing/invoices/export, /api/workspace/billing/overview, /api/workspace/billing/payment-methods |
| /workspace/campaigns | Workspace | AdminLayout | user, business_admin, super_admin | EmailCampaignsPage | intelliscan-app/src/pages/workspace/EmailCampaignsPage.jsx | /api/campaigns, /api/campaigns/audience-preview?${params.toString(, /api/campaigns/auto-write, /api/campaigns/send |
| /workspace/contacts | Workspace | AdminLayout | user, business_admin, super_admin | WorkspaceContacts | intelliscan-app/src/pages/WorkspaceContacts.jsx |  |
| /workspace/crm-mapping | Workspace | AdminLayout | user, business_admin, super_admin | CrmMappingPage | intelliscan-app/src/pages/workspace/CrmMappingPage.jsx | /api/crm/config, /api/crm/config?provider=${provider, /api/crm/connect, /api/crm/disconnect, /api/crm/export/${activeProvider, /api/crm/schema?provider=${activeProvider, /api/crm/schema?provider=${provider, /api/crm/sync-log?provider=:param&limit=20 |
| /workspace/dashboard | Workspace | AdminLayout | user, business_admin, super_admin | WorkspaceDashboard | intelliscan-app/src/pages/WorkspaceDashboard.jsx | /api/workspace/analytics |
| /workspace/data-policies | Workspace | AdminLayout | user, business_admin, super_admin | DataPoliciesPage | intelliscan-app/src/pages/workspace/DataPoliciesPage.jsx | /api/workspace/data-policies |
| /workspace/data-quality | Workspace | AdminLayout | user, business_admin, super_admin | DataQualityCenterPage | intelliscan-app/src/pages/workspace/DataQualityCenterPage.jsx | /api/workspace/data-quality/dedupe-queue, /api/workspace/data-quality/queue/:param/dismiss, /api/workspace/data-quality/queue/:param/merge |
| /workspace/members | Workspace | AdminLayout | user, business_admin, super_admin | MembersPage | intelliscan-app/src/pages/MembersPage.jsx | /api/workspace/members, /api/workspace/members/${id, /api/workspace/members/invite |
| /workspace/org-chart | Workspace | AdminLayout | user, business_admin, super_admin | OrgChartPage | intelliscan-app/src/pages/OrgChartPage.jsx | /api/org-chart/${encodeURIComponent(company |
| /workspace/pipeline | Workspace | AdminLayout | user, business_admin, super_admin | PipelinePage | intelliscan-app/src/pages/workspace/PipelinePage.jsx | /api/contacts/:param/deal, /api/deals |
| /workspace/routing-rules | Workspace | AdminLayout | user, business_admin, super_admin | RoutingRulesPage | intelliscan-app/src/pages/workspace/RoutingRulesPage.jsx | /api/routing-rules, /api/routing-rules/run |
| /workspace/scanner-links | Workspace | AdminLayout | user, business_admin, super_admin | ScannerLinksPage | intelliscan-app/src/pages/ScannerLinksPage.jsx |  |
| /workspace/shared | Workspace | AdminLayout | user, business_admin, super_admin | SharedRolodexPage | intelliscan-app/src/pages/workspace/SharedRolodexPage.jsx | /api/chats/${encodeURIComponent(workspaceRoom, /api/crm/export/${provider, /api/crm/export/csv?token=${encodeURIComponent(getStoredToken(, /api/workspace/contacts, /api/workspace/contacts/duplicates |
| /workspace/webhooks | Workspace | AdminLayout | user, business_admin, super_admin | WebhookManagement | intelliscan-app/src/pages/workspace/WebhookManagement.jsx | /api/webhooks, /api/webhooks/${id |
| /workspaces-organizations-super-admin | Generated | AdminLayout | super_admin | GenWorkspacesOrganizationsSuperAdmin | intelliscan-app/src/pages/generated/GenWorkspacesOrganizationsSuperAdmin.jsx |  |

---

## 9) File Index (Every File)

This is a full inventory of repo files (excluding `node_modules/`, `dist/`, `.git/`).

| File | Kind | Description |
|---|---|---|
| .env.example | Config | Environment configuration |
| ALL_DOCUMENT_OF_PROJECT/Allfeatures.md | Documentation | 📋 Complete Features List — All Competitor Platforms |
| ALL_DOCUMENT_OF_PROJECT/bundle_for_claude.js | Documentation (Internal) | Internal planning/docs bundle |
| ALL_DOCUMENT_OF_PROJECT/Claude_Prompt_DB_Architecture.md | Documentation | Prompt: IntelliScan Database Architecture Generator |
| ALL_DOCUMENT_OF_PROJECT/Claude_Prompt_Full_Project_Audit.md | Documentation | Prompt: IntelliScan Full System Audit, Fixes, & E2E Testing |
| ALL_DOCUMENT_OF_PROJECT/Competitor_Feature_Analysis_Prompt_and_Report.md | Documentation | 📊 Competitor & Market Analysis: Prompt & Feature Breakdown |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_ActivityDiagrams_AllFeatures.md | Documentation | IntelliScan — Complete Activity Diagrams (All Features) |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_ClassDiagrams_AllFeatures.md | Documentation | IntelliScan — Complete Class Diagrams (All Features) |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Complete_Architecture.md | Documentation | IntelliScan — Complete System Architecture & Documentation |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Complete_Project_Overview.md | Documentation | 🪐 IntelliScan: Complete Project & Architecture Overview |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Comprehensive_Feature_Diagrams.md | Documentation | IntelliScan: Comprehensive Feature-by-Feature Diagrams |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Context_For_Claude.txt | Documentation (Internal) | Internal planning/docs bundle |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Cost_Analysis.md | Documentation | IntelliScan: Enterprise Gap Implementation Costs |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_CRM_Mapping_Production_Prompt.md | Documentation | IntelliScan — CRM Data Mapping: Complete Production-Grade Build Prompt |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Data_Dictionary.md | Documentation | IntelliScan — Comprehensive Data Dictionary |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Database_Architecture.md | Documentation | IntelliScan — Database Architecture & Schema Design |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Detailed_System_Architecture.md | Documentation | 💠 IntelliScan Detailed System Architecture |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Feature_Roadmap.md | Documentation | IntelliScan — Feature & Page Roadmap |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Feature_UseCase-Diagrams_InDepth | Documentation (Internal) | Internal planning/docs bundle |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Final_Project_Report.md | Documentation | IntelliScan: AI-Powered Unified CRM & Network Intelligence Platform |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Folder_Architecture.md | Documentation | 📁 IntelliScan Detailed Folder Architecture |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Full_Directory_Tree.md | Documentation | 🌳 IntelliScan Exhaustive Directory Tree |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_InteractionDiagrams_AllFeatures.md | Documentation | IntelliScan — Complete Interaction (Sequence) Diagrams (All Features) |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Interview_Questions_100_Vol2.md | Documentation | The IntelliScan 100: Exhaustive Engineering Interview Q&A (Volume 2) |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Interview_Questions_100.md | Documentation | The IntelliScan 100: Exhaustive Engineering Interview Q&A |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Interview_Questions.md | Documentation | IntelliScan: Technical Interview Q&A |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Market_Gap_Analysis.md | Documentation | IntelliScan: Competitor Market Gap Analysis |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_RBAC_Matrix.md | Documentation | IntelliScan — Role-Based Access Control (RBAC) Matrix |
| ALL_DOCUMENT_OF_PROJECT/intelliscan_roadmap_requirements.html | Documentation (Internal) | Internal planning/docs bundle |
| ALL_DOCUMENT_OF_PROJECT/intelliscan_stitch_technicaladdendum.md | Documentation | IntelliScan — CRITICAL TECHNICAL ADDENDUM |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Ultimate_Data_Dictionary.md | Documentation | IntelliScan — Data Dictionary (Human-Friendly Summary) |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_Ultimate_DB_Architecture.md | Documentation | IntelliScan: Ultimate Database Architecture & Theoretical Schema |
| ALL_DOCUMENT_OF_PROJECT/IntelliScan_UseCaseDiagrams_AllFeatures.md | Documentation | IntelliScan — Complete Use Case Diagrams (All Features) |
| ALL_DOCUMENT_OF_PROJECT/PROJECT_ARCHITECTURE.md | Documentation | IntelliScan Project Architecture |
| APRIL_04_2026_PRESENTATION_PACK.md | Documentation | IntelliScan Presentation Pack (April 4, 2026) |
| captures/capture.js | Capture | Demo artifact (screenshots/videos) |
| captures/package-lock.json | Capture | Demo artifact (screenshots/videos) |
| captures/package.json | Capture | Demo artifact (screenshots/videos) |
| captures/screenshots/forgot_password.png | Capture | Screenshot/image asset |
| captures/screenshots/landing_page.png | Capture | Screenshot/image asset |
| captures/screenshots/onboarding.png | Capture | Screenshot/image asset |
| captures/screenshots/sign_in.png | Capture | Screenshot/image asset |
| captures/screenshots/sign_up.png | Capture | Screenshot/image asset |
| captures/screenshots/super_admin_dashboard.png | Capture | Screenshot/image asset |
| captures/screenshots/super_admin_performance.png | Capture | Screenshot/image asset |
| captures/screenshots/user_contacts.png | Capture | Screenshot/image asset |
| captures/screenshots/user_scan.png | Capture | Screenshot/image asset |
| captures/screenshots/user_settings.png | Capture | Screenshot/image asset |
| captures/screenshots/workspace_analytics.png | Capture | Screenshot/image asset |
| captures/screenshots/workspace_billing.png | Capture | Screenshot/image asset |
| captures/screenshots/workspace_contacts.png | Capture | Screenshot/image asset |
| captures/screenshots/workspace_dashboard.png | Capture | Screenshot/image asset |
| captures/screenshots/workspace_members.png | Capture | Screenshot/image asset |
| captures/screenshots/workspace_scanner_links.png | Capture | Screenshot/image asset |
| captures/videos/forgot_password.webm | Capture | Recorded demo video |
| captures/videos/landing_page.webm | Capture | Recorded demo video |
| captures/videos/onboarding.webm | Capture | Recorded demo video |
| captures/videos/sign_in.webm | Capture | Recorded demo video |
| captures/videos/sign_up.webm | Capture | Recorded demo video |
| captures/videos/super_admin_dashboard.webm | Capture | Recorded demo video |
| captures/videos/super_admin_performance.webm | Capture | Recorded demo video |
| captures/videos/user_contacts.webm | Capture | Recorded demo video |
| captures/videos/user_scan.webm | Capture | Recorded demo video |
| captures/videos/user_settings.webm | Capture | Recorded demo video |
| captures/videos/workspace_analytics.webm | Capture | Recorded demo video |
| captures/videos/workspace_billing.webm | Capture | Recorded demo video |
| captures/videos/workspace_contacts.webm | Capture | Recorded demo video |
| captures/videos/workspace_dashboard.webm | Capture | Recorded demo video |
| captures/videos/workspace_members.webm | Capture | Recorded demo video |
| captures/videos/workspace_scanner_links.webm | Capture | Recorded demo video |
| DATA_DICTIONARY_INTELLISCAN_DB.md | Documentation | IntelliScan Database Schema (intelliscan.db) |
| endpoints.txt | Other | Repo file |
| IntelliScan_ActivityDiagrams.md | Documentation | IntelliScan — Complete Activity Diagrams (All Features) |
| IntelliScan_AI_Future_Roadmap.md | Documentation | IntelliScan — AI Future Roadmap & Expansion Plan |
| IntelliScan_AI_Integration_Detailed.md | Documentation | IntelliScan — Detailed AI Integration Analysis |
| IntelliScan_ClassDiagrams.md | Documentation | IntelliScan — Complete Class Diagrams (All Features) |
| IntelliScan_Data_Dictionary.md | Documentation | IntelliScan — Data Dictionary (Human-Friendly Summary) |
| IntelliScan_Global_ActivityDiagram.md | Documentation | IntelliScan — Global System Activity Diagram |
| IntelliScan_Global_InteractionDiagram.md | Documentation | IntelliScan — Global Interaction (Sequence) Diagram |
| IntelliScan_InteractionDiagrams.md | Documentation | IntelliScan — Complete Interaction (Sequence) Diagrams (All Features) |
| INTELLISCAN_MASTER_DOCUMENTATION.md | Documentation | IntelliScan Master Documentation (Deep Workflow, Pages, Files) |
| IntelliScan_UseCaseDiagrams.md | Documentation | IntelliScan — Complete Use Case Diagrams (All Features) |
| intelliscan-app/.env.example | Config | Environment configuration |
| intelliscan-app/.gitignore | Other | Repo file |
| intelliscan-app/build_err.log | Other | Repo file |
| intelliscan-app/build_err.txt | Other | Repo file |
| intelliscan-app/eslint.config.js | Other | Repo file |
| intelliscan-app/index.html | Other | Repo file |
| intelliscan-app/lint_errors.txt | Other | Repo file |
| intelliscan-app/lint_output.txt | Other | Repo file |
| intelliscan-app/lint_report.txt | Other | Repo file |
| intelliscan-app/lint_results.json | Other | Repo file |
| intelliscan-app/lint.txt | Other | Repo file |
| intelliscan-app/lint2.txt | Other | Repo file |
| intelliscan-app/package-lock.json | Other | Repo file |
| intelliscan-app/package.json | Other | Repo file |
| intelliscan-app/postcss.config.js | Other | Repo file |
| intelliscan-app/PROJECT_IMPROVEMENT_PLAN.md | Documentation | Intelliscan Project Audit and Improvement Plan |
| intelliscan-app/public/favicon.svg | Other | Repo file |
| intelliscan-app/public/icons.svg | Other | Repo file |
| intelliscan-app/README.md | Documentation | 🛡️ IntelliScan Enterprise \| AI-Powered Networking Ecosystem |
| intelliscan-app/scripts/fix-token-storage.mjs | Other | Repo file |
| intelliscan-app/scripts/massReplace.cjs | Other | Repo file |
| intelliscan-app/scripts/migrate.js | Other | Repo file |
| intelliscan-app/scripts/page-health-audit.mjs | Other | Repo file |
| intelliscan-app/src/App.css | Frontend | Client source file |
| intelliscan-app/src/App.jsx | Frontend | Frontend router: defines explicit routes, mounts generated routes, applies RoleGuard/RequireAuth, and hosts RootRoute redirect logic. |
| intelliscan-app/src/assets/hero.png | Capture | Screenshot/image asset |
| intelliscan-app/src/assets/react.svg | Frontend | Client source file |
| intelliscan-app/src/assets/vite.svg | Frontend | Client source file |
| intelliscan-app/src/components/ActivityTracker.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/calendar/AISchedulingPanel.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/calendar/AttendeeInput.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/calendar/ColorPicker.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/calendar/EventDetailPopover.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/calendar/EventModal.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/calendar/EventPill.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/calendar/MiniCalendar.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/calendar/RecurrenceSelector.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/calendar/TimeGrid.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/ChatbotWidget.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/CommandPalette.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/DevTools.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/email/CampaignStatsCard.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/email/EmailPreview.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/email/EmailStatusBadge.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/email/OpenRateBar.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/email/TemplateCard.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/GlobalErrorBoundary.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/RoleGuard.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/components/SignalsCard.jsx | Frontend Component | Reusable UI component |
| intelliscan-app/src/context/BatchQueueContext.jsx | Frontend Context | React context provider/state |
| intelliscan-app/src/context/ContactContext.jsx | Frontend Context | React context provider/state |
| intelliscan-app/src/context/RoleContext.jsx | Frontend Context | Auth + access context: stores user and token, loads current access profile, exposes login/logout, and drives role-based UI gating. |
| intelliscan-app/src/data/mockContacts.js | Frontend | Client source file |
| intelliscan-app/src/hooks/useDarkMode.jsx | Frontend Hook | Custom React hook |
| intelliscan-app/src/index.css | Frontend | Client source file |
| intelliscan-app/src/layouts/AdminLayout.jsx | Frontend Layout | Layout wrapper |
| intelliscan-app/src/layouts/DashboardLayout.jsx | Frontend Layout | Layout wrapper |
| intelliscan-app/src/layouts/PublicLayout.jsx | Frontend Layout | Layout wrapper |
| intelliscan-app/src/main.jsx | Frontend | Frontend entry: boots React, wraps providers (Role/Contacts/BatchQueue), mounts the app. |
| intelliscan-app/src/pages/admin/CustomModelsPage.jsx | Frontend Page | Page: Custom Models Page (route: /admin/custom-models) |
| intelliscan-app/src/pages/admin/JobQueuesPage.jsx | Frontend Page | Page: Job Queues Page (route: /admin/job-queues) |
| intelliscan-app/src/pages/admin/SystemIncidentCenter.jsx | Frontend Page | Page: System Incident Center (route: /admin/incidents) |
| intelliscan-app/src/pages/AdminDashboard.jsx | Frontend Page | Page: Admin Dashboard (route: /admin/dashboard) |
| intelliscan-app/src/pages/AdvancedApiExplorerSandbox.jsx | Frontend Page | React route page |
| intelliscan-app/src/pages/AiTrainingTuningSuperAdmin.jsx | Frontend Page | React route page |
| intelliscan-app/src/pages/AnalyticsPage.jsx | Frontend Page | Page: Analytics Page (route: /workspace/analytics) |
| intelliscan-app/src/pages/ApiDocsPage.jsx | Frontend Page | Page: Api Docs Page (route: /api-docs) |
| intelliscan-app/src/pages/BillingPage.jsx | Frontend Page | Billing UI: usage overview, payment methods, invoices, and plan upgrade entry points. |
| intelliscan-app/src/pages/calendar/AvailabilityPage.jsx | Frontend Page | Page: Availability Page (route: /dashboard/calendar/availability) |
| intelliscan-app/src/pages/calendar/BookingLinksPage.jsx | Frontend Page | Page: Booking Links Page (route: /dashboard/calendar/booking-links) |
| intelliscan-app/src/pages/calendar/BookingPage.jsx | Frontend Page | Page: Booking Page (route: /book/:slug) |
| intelliscan-app/src/pages/calendar/CalendarPage.jsx | Frontend Page | Page: Calendar Page (route: /dashboard/calendar) |
| intelliscan-app/src/pages/CardCreatorPage.jsx | Frontend Page | Page: Card Creator Page (route: /dashboard/card-creator) |
| intelliscan-app/src/pages/ContactsPage.jsx | Frontend Page | Contacts CRM UI: search/filter, export, enrichment triggers, and stats panels. |
| intelliscan-app/src/pages/dashboard/CoachPage.jsx | Frontend Page | Page: Coach Page (route: /dashboard/coach) |
| intelliscan-app/src/pages/dashboard/DraftsPage.jsx | Frontend Page | Page: Drafts Page (route: /dashboard/drafts) |
| intelliscan-app/src/pages/dashboard/EventsPage.jsx | Frontend Page | Page: Events Page (route: /dashboard/events) |
| intelliscan-app/src/pages/dashboard/KioskMode.jsx | Frontend Page | Page: Kiosk Mode (route: /dashboard/kiosk) |
| intelliscan-app/src/pages/dashboard/Leaderboard.jsx | Frontend Page | Page: Leaderboard (route: /dashboard/leaderboard) |
| intelliscan-app/src/pages/dashboard/MeetingToolsPage.jsx | Frontend Page | Page: Meeting Tools Page (route: /dashboard/presence) |
| intelliscan-app/src/pages/dashboard/MyCardPage.jsx | Frontend Page | Page: My Card Page (route: /dashboard/my-card) |
| intelliscan-app/src/pages/dashboard/SignalsPage.jsx | Frontend Page | Page: Signals Page (route: /dashboard/signals) |
| intelliscan-app/src/pages/email/CampaignBuilderPage.jsx | Frontend Page | Page: Campaign Builder Page (route: /dashboard/email-marketing/campaigns/new) |
| intelliscan-app/src/pages/email/CampaignDetailPage.jsx | Frontend Page | Page: Campaign Detail Page (route: /dashboard/email-marketing/campaigns/:id) |
| intelliscan-app/src/pages/email/CampaignListPage.jsx | Frontend Page | Page: Campaign List Page (route: /dashboard/email-marketing/campaigns) |
| intelliscan-app/src/pages/email/ContactListsPage.jsx | Frontend Page | Page: Contact Lists Page (route: /dashboard/email-marketing/lists) |
| intelliscan-app/src/pages/email/EmailMarketingPage.jsx | Frontend Page | Page: Email Marketing Page (route: /dashboard/email-marketing) |
| intelliscan-app/src/pages/email/EmailSequencesPage.jsx | Frontend Page | Page: Email Sequences Page (route: /dashboard/email/sequences) |
| intelliscan-app/src/pages/email/ListDetailPage.jsx | Frontend Page | Page: List Detail Page (route: /dashboard/email-marketing/lists/:id) |
| intelliscan-app/src/pages/email/TemplateLibraryPage.jsx | Frontend Page | Page: Template Library Page (route: /dashboard/email-marketing/templates) |
| intelliscan-app/src/pages/EnginePerformance.jsx | Frontend Page | Page: Engine Performance (route: /admin/engine-performance) |
| intelliscan-app/src/pages/FeedbackPage.jsx | Frontend Page | Page: Feedback Page (route: /dashboard/feedback) |
| intelliscan-app/src/pages/ForgotPassword.jsx | Frontend Page | Page: Forgot Password (route: /forgot-password) |
| intelliscan-app/src/pages/generated/Gen404SystemErrorStates.jsx | Frontend Page (Generated) | Page: 404 System Error States (route: /404-system-error-states) |
| intelliscan-app/src/pages/generated/GenAdvancedApiExplorerSandbox.jsx | Frontend Page (Generated) | Page: Advanced Api Explorer Sandbox (route: /advanced-api-explorer-sandbox) |
| intelliscan-app/src/pages/generated/GenAdvancedApiWebhookMonitor.jsx | Frontend Page (Generated) | Page: Advanced Api Webhook Monitor (route: /advanced-api-webhook-monitor) |
| intelliscan-app/src/pages/generated/GenAdvancedCsvJsonExportMapper.jsx | Frontend Page (Generated) | Page: Advanced Csv Json Export Mapper (route: /advanced-csv-json-export-mapper) |
| intelliscan-app/src/pages/generated/GenAdvancedSecurityAuditLogs1.jsx | Frontend Page (Generated) | Page: Advanced Security Audit Logs1 (route: /advanced-security-audit-logs-1) |
| intelliscan-app/src/pages/generated/GenAdvancedSecurityAuditLogs2.jsx | Frontend Page (Generated) | Page: Advanced Security Audit Logs2 (route: /advanced-security-audit-logs-2) |
| intelliscan-app/src/pages/generated/GenAdvancedSegmentBuilder.jsx | Frontend Page (Generated) | Page: Advanced Segment Builder (route: /advanced-segment-builder) |
| intelliscan-app/src/pages/generated/GenAiConfidenceAuditFeedbackHub.jsx | Frontend Page (Generated) | Page: Ai Confidence Audit Feedback Hub (route: /ai-confidence-audit-feedback-hub) |
| intelliscan-app/src/pages/generated/GenAiConflictResolutionHumanInTheLoop.jsx | Frontend Page (Generated) | Page: Ai Conflict Resolution Human In The Loop (route: /ai-conflict-resolution-human-in-the-loop) |
| intelliscan-app/src/pages/generated/GenAiMaintenanceRetrainingLogs.jsx | Frontend Page (Generated) | Page: Ai Maintenance Retraining Logs (route: /ai-maintenance-retraining-logs) |
| intelliscan-app/src/pages/generated/GenAiModelVersioningRollback.jsx | Frontend Page (Generated) | Page: Ai Model Versioning Rollback (route: /ai-model-versioning-rollback) |
| intelliscan-app/src/pages/generated/GenAiTrainingTuningSuperAdmin.jsx | Frontend Page (Generated) | Page: Ai Training Tuning Super Admin (route: /ai-training-tuning-super-admin) |
| intelliscan-app/src/pages/generated/GenApiIntegrations.jsx | Frontend Page (Generated) | Page: Api Integrations (route: /api-integrations) |
| intelliscan-app/src/pages/generated/GenApiPerformanceWebhooks.jsx | Frontend Page (Generated) | Page: Api Performance Webhooks (route: /api-performance-webhooks) |
| intelliscan-app/src/pages/generated/GenApiWebhookConfiguration1.jsx | Frontend Page (Generated) | Page: Api Webhook Configuration1 (route: /api-webhook-configuration-1) |
| intelliscan-app/src/pages/generated/GenApiWebhookConfiguration2.jsx | Frontend Page (Generated) | Page: Api Webhook Configuration2 (route: /api-webhook-configuration-2) |
| intelliscan-app/src/pages/generated/GenApiWebhookLogsDebugging.jsx | Frontend Page (Generated) | Page: Api Webhook Logs Debugging (route: /api-webhook-logs-debugging) |
| intelliscan-app/src/pages/generated/GenAuditLogsSecurity.jsx | Frontend Page (Generated) | Page: Audit Logs Security (route: /audit-logs-security) |
| intelliscan-app/src/pages/generated/GenBatchProcessingMonitorUserDashboard.jsx | Frontend Page (Generated) | Page: Batch Processing Monitor User Dashboard (route: /batch-processing-monitor-user-dashboard) |
| intelliscan-app/src/pages/generated/GenBillingUsage.jsx | Frontend Page (Generated) | Page: Billing Usage (route: /billing-usage) |
| intelliscan-app/src/pages/generated/GenBulkContactExportWizard1.jsx | Frontend Page (Generated) | Page: Bulk Contact Export Wizard1 (route: /bulk-contact-export-wizard-1) |
| intelliscan-app/src/pages/generated/GenBulkContactExportWizard2.jsx | Frontend Page (Generated) | Page: Bulk Contact Export Wizard2 (route: /bulk-contact-export-wizard-2) |
| intelliscan-app/src/pages/generated/GenBulkMemberInvitationImport.jsx | Frontend Page (Generated) | Page: Bulk Member Invitation Import (route: /bulk-member-invitation-import) |
| intelliscan-app/src/pages/generated/GenComplianceDataSovereigntySuperAdmin.jsx | Frontend Page (Generated) | Page: Compliance Data Sovereignty Super Admin (route: /compliance-data-sovereignty-super-admin) |
| intelliscan-app/src/pages/generated/GenComplianceDisclosureLegalCenter.jsx | Frontend Page (Generated) | Page: Compliance Disclosure Legal Center (route: /compliance-disclosure-legal-center) |
| intelliscan-app/src/pages/generated/GenContactDetailView.jsx | Frontend Page (Generated) | Page: Contact Detail View (route: /contact-detail-view) |
| intelliscan-app/src/pages/generated/GenContactMergeDeduplication.jsx | Frontend Page (Generated) | Page: Contact Merge Deduplication (route: /contact-merge-deduplication) |
| intelliscan-app/src/pages/generated/GenDataExportHistoryLog.jsx | Frontend Page (Generated) | Page: Data Export History Log (route: /data-export-history-log) |
| intelliscan-app/src/pages/generated/GenDataExportMigration.jsx | Frontend Page (Generated) | Page: Data Export Migration (route: /data-export-migration) |
| intelliscan-app/src/pages/generated/GenDynamicDashboardBuilder.jsx | Frontend Page (Generated) | Page: Dynamic Dashboard Builder (route: /dynamic-dashboard-builder) |
| intelliscan-app/src/pages/generated/GenEmptyStatesNoResultsTemplate.jsx | Frontend Page (Generated) | Page: Empty States No Results Template (route: /empty-states-no-results-template) |
| intelliscan-app/src/pages/generated/GenEnterpriseSsoSamlConfig.jsx | Frontend Page (Generated) | Page: Enterprise Sso Saml Config (route: /enterprise-sso-saml-config) |
| intelliscan-app/src/pages/generated/GenEnterpriseWhitelabelBrandingConfig.jsx | Frontend Page (Generated) | Page: Enterprise Whitelabel Branding Config (route: /enterprise-whitelabel-branding-config) |
| intelliscan-app/src/pages/generated/GenEnterpriseWhitelabelBrandingConfigFixed.jsx | Frontend Page (Generated) | Page: Enterprise Whitelabel Branding Config Fixed (route: /enterprise-whitelabel-branding-config-fixed) |
| intelliscan-app/src/pages/generated/GenErrorResolutionCenter.jsx | Frontend Page (Generated) | Page: Error Resolution Center (route: /error-resolution-center) |
| intelliscan-app/src/pages/generated/GenGlobalDataRetentionArchiving.jsx | Frontend Page (Generated) | Page: Global Data Retention Archiving (route: /global-data-retention-archiving) |
| intelliscan-app/src/pages/generated/GenGlobalSearchIntelligence.jsx | Frontend Page (Generated) | Page: Global Search Intelligence (route: /global-search-intelligence) |
| intelliscan-app/src/pages/generated/GenGlobalSearchUniversalDiscovery.jsx | Frontend Page (Generated) | Page: Global Search Universal Discovery (route: /global-search-universal-discovery) |
| intelliscan-app/src/pages/generated/GenGlobalSystemStatusPage.jsx | Frontend Page (Generated) | Page: Global System Status Page (route: /global-system-status-page) |
| intelliscan-app/src/pages/generated/GenHelpCenterDocs.jsx | Frontend Page (Generated) | Page: Help Center Docs (route: /help-center-docs) |
| intelliscan-app/src/pages/generated/GenInsightsAiForecasting.jsx | Frontend Page (Generated) | Page: Insights Ai Forecasting (route: /insights-ai-forecasting) |
| intelliscan-app/src/pages/generated/GenInteractiveApiPayloadExplorer.jsx | Frontend Page (Generated) | Page: Interactive Api Payload Explorer (route: /interactive-api-payload-explorer) |
| intelliscan-app/src/pages/generated/GenInteractiveFeatureToursHelpOverlays.jsx | Frontend Page (Generated) | Page: Interactive Feature Tours Help Overlays (route: /interactive-feature-tours-help-overlays) |
| intelliscan-app/src/pages/generated/GenMaintenanceSystemUpdateMode.jsx | Frontend Page (Generated) | Page: Maintenance System Update Mode (route: /maintenance-system-update-mode) |
| intelliscan-app/src/pages/generated/GenMarketplaceIntegrationsBusinessAdmin.jsx | Frontend Page (Generated) | Page: Marketplace Integrations Business Admin (route: /marketplace-integrations-business-admin) |
| intelliscan-app/src/pages/generated/GenMemberRolePermissionMatrix.jsx | Frontend Page (Generated) | Page: Member Role Permission Matrix (route: /member-role-permission-matrix) |
| intelliscan-app/src/pages/generated/GenMemberRolePermissionsEditor1.jsx | Frontend Page (Generated) | Page: Member Role Permissions Editor1 (route: /member-role-permissions-editor-1) |
| intelliscan-app/src/pages/generated/GenMemberRolePermissionsEditor2.jsx | Frontend Page (Generated) | Page: Member Role Permissions Editor2 (route: /member-role-permissions-editor-2) |
| intelliscan-app/src/pages/generated/GenPrivacyGdprCommandCenter.jsx | Frontend Page (Generated) | Page: Privacy Gdpr Command Center (route: /privacy-gdpr-command-center) |
| intelliscan-app/src/pages/generated/GenReferralLoyaltyDashboard.jsx | Frontend Page (Generated) | Page: Referral Loyalty Dashboard (route: /referral-loyalty-dashboard) |
| intelliscan-app/src/pages/generated/GenSecurityKeyMfaSetup.jsx | Frontend Page (Generated) | Page: Security Key Mfa Setup (route: /security-key-mfa-setup) |
| intelliscan-app/src/pages/generated/GenSecurityThreatMonitoringSuperAdmin.jsx | Frontend Page (Generated) | Page: Security Threat Monitoring Super Admin (route: /security-threat-monitoring-super-admin) |
| intelliscan-app/src/pages/generated/GenStrategicAccountReviews.jsx | Frontend Page (Generated) | Page: Strategic Account Reviews (route: /strategic-account-reviews) |
| intelliscan-app/src/pages/generated/GenSubscriptionPlanComparison.jsx | Frontend Page (Generated) | Page: Subscription Plan Comparison (route: /subscription-plan-comparison) |
| intelliscan-app/src/pages/generated/GenSystemHealthSuperAdmin.jsx | Frontend Page (Generated) | Page: System Health Super Admin (route: /system-health-super-admin) |
| intelliscan-app/src/pages/generated/GenSystemMaintenanceDowntimeSchedule.jsx | Frontend Page (Generated) | Page: System Maintenance Downtime Schedule (route: /system-maintenance-downtime-schedule) |
| intelliscan-app/src/pages/generated/GenSystemNotificationCenterSuperAdmin.jsx | Frontend Page (Generated) | Page: System Notification Center Super Admin (route: /system-notification-center-super-admin) |
| intelliscan-app/src/pages/generated/GenUsageQuotasLimits.jsx | Frontend Page (Generated) | Page: Usage Quotas Limits (route: /usage-quotas-limits) |
| intelliscan-app/src/pages/generated/GenUserFeedbackBugReporting.jsx | Frontend Page (Generated) | Page: User Feedback Bug Reporting (route: /user-feedback-bug-reporting) |
| intelliscan-app/src/pages/generated/GenWorkflowAutomationsBusinessAdmin.jsx | Frontend Page (Generated) | Page: Workflow Automations Business Admin (route: /workflow-automations-business-admin) |
| intelliscan-app/src/pages/generated/GenWorkspacesOrganizationsSuperAdmin.jsx | Frontend Page (Generated) | Page: Workspaces Organizations Super Admin (route: /workspaces-organizations-super-admin) |
| intelliscan-app/src/pages/generated/PublicProfile.jsx | Frontend Page (Generated) | Page: Public Profile (route: /u/:slug) |
| intelliscan-app/src/pages/generated/routes.json | Frontend Page (Generated) | Auto-migrated UI route |
| intelliscan-app/src/pages/LandingPage.jsx | Frontend Page | React route page |
| intelliscan-app/src/pages/MarketplacePage.jsx | Frontend Page | Page: Marketplace Page (route: /marketplace) |
| intelliscan-app/src/pages/MembersPage.jsx | Frontend Page | Page: Members Page (route: /workspace/members) |
| intelliscan-app/src/pages/OnboardingPage.jsx | Frontend Page | Page: Onboarding Page (route: /onboarding) |
| intelliscan-app/src/pages/OrgChartPage.jsx | Frontend Page | Page: Org Chart Page (route: /workspace/org-chart) |
| intelliscan-app/src/pages/PublicAnalyticsPage.jsx | Frontend Page | Page: Public Analytics Page (route: /public-stats) |
| intelliscan-app/src/pages/ScannerLinksPage.jsx | Frontend Page | Page: Scanner Links Page (route: /workspace/scanner-links) |
| intelliscan-app/src/pages/ScanPage.jsx | Frontend Page | Scan UI: single-card + group-photo flows, extraction preview, quota display, and save actions. |
| intelliscan-app/src/pages/SettingsPage.jsx | Frontend Page | Page: Settings Page (route: /dashboard/settings) |
| intelliscan-app/src/pages/SignInPage.jsx | Frontend Page | Page: Sign In Page (route: /sign-in) |
| intelliscan-app/src/pages/SignUpPage.jsx | Frontend Page | Page: Sign Up Page (route: /sign-up) |
| intelliscan-app/src/pages/SuperAdminFeedbackPage.jsx | Frontend Page | Page: Super Admin Feedback Page (route: /admin/feedback) |
| intelliscan-app/src/pages/workspace/CrmMappingPage.jsx | Frontend Page | Page: Crm Mapping Page (route: /workspace/crm-mapping) |
| intelliscan-app/src/pages/workspace/DataPoliciesPage.jsx | Frontend Page | Enterprise policies UI: retention days + redaction + strict audit storage toggles, persisted via workspace policies API. |
| intelliscan-app/src/pages/workspace/DataQualityCenterPage.jsx | Frontend Page | Data quality UI: dedupe queue, merge/dismiss actions, and quality workflows for bulk ingested contacts. |
| intelliscan-app/src/pages/workspace/EmailCampaignsPage.jsx | Frontend Page | Page: Email Campaigns Page (route: /workspace/campaigns) |
| intelliscan-app/src/pages/workspace/PipelinePage.jsx | Frontend Page | Page: Pipeline Page (route: /workspace/pipeline) |
| intelliscan-app/src/pages/workspace/RoutingRulesPage.jsx | Frontend Page | Page: Routing Rules Page (route: /workspace/routing-rules) |
| intelliscan-app/src/pages/workspace/SharedRolodexPage.jsx | Frontend Page | Page: Shared Rolodex Page (route: /workspace/shared) |
| intelliscan-app/src/pages/workspace/WebhookManagement.jsx | Frontend Page | Page: Webhook Management (route: /workspace/webhooks) |
| intelliscan-app/src/pages/WorkspaceContacts.jsx | Frontend Page | Page: Workspace Contacts (route: /workspace/contacts) |
| intelliscan-app/src/pages/WorkspaceDashboard.jsx | Frontend Page | Page: Workspace Dashboard (route: /workspace/dashboard) |
| intelliscan-app/src/utils/auth.js | Frontend Utility | Token + user storage helpers (get/set/clear token, safe user parsing, home-route resolver). |
| intelliscan-app/src/utils/calendarUtils.js | Frontend Utility | Client-side helper |
| intelliscan-app/tailwind.config.js | Other | Repo file |
| intelliscan-app/temp_lint_reader.cjs | Other | Repo file |
| intelliscan-app/temp_lint_reader.js | Other | Repo file |
| intelliscan-app/vite.config.js | Other | Repo file |
| intelliscan-server/.env | Config | Environment configuration |
| intelliscan-server/.env.example | Config | Environment configuration |
| intelliscan-server/api_routes.txt | Backend | Server file/script |
| intelliscan-server/bracket_audit_utf8.txt | Backend | Server file/script |
| intelliscan-server/bracket_audit.txt | Backend | Server file/script |
| intelliscan-server/College_Document/Presentation-1_intelliscan.md | Documentation | Presentation-1: IntelliScan (April 4, 2026) |
| intelliscan-server/College_Document/Presentation-2_intelliscan.md | Documentation | Presentation-2: IntelliScan (Final Presentation + Demo) (April 4, 2026) |
| intelliscan-server/database.sqlite | Database | SQLite database file |
| intelliscan-server/db_schema.txt | Backend | Server file/script |
| intelliscan-server/dump_schema_intelliscan_db.cjs | Backend | Server file/script |
| intelliscan-server/eng.traineddata | Backend | Server file/script |
| intelliscan-server/ensure_tables.js | Backend | Server file/script |
| intelliscan-server/fix_admin.js | Backend | Server file/script |
| intelliscan-server/full_err.txt | Backend | Server file/script |
| intelliscan-server/get_schema.js | Backend | Server file/script |
| intelliscan-server/index.js | Backend | Backend entry (Express). Contains DB init, auth, AI extraction pipelines, contacts/events/email/calendar/workspace/admin APIs, and Razorpay billing. |
| intelliscan-server/intelliscan-database.sqlite | Database | SQLite database file |
| intelliscan-server/intelliscan.db | Database | SQLite database file |
| intelliscan-server/package-lock.json | Backend | Server file/script |
| intelliscan-server/package.json | Backend | Server file/script |
| intelliscan-server/parsed_schema.sql | Backend | Server file/script |
| intelliscan-server/seed_requested_users.js | Backend | Server file/script |
| intelliscan-server/server-err.log | Backend | Server file/script |
| intelliscan-server/server-out.log | Backend | Server file/script |
| intelliscan-server/src/config/constants.js | Backend Module | Server module |
| intelliscan-server/src/middleware/auth.js | Backend Module | JWT authentication middleware + role gating helpers (user/business_admin/super_admin). |
| intelliscan-server/src/routes/workspaceRoutes.js | Backend Module | Workspace-focused API routes (enterprise modules like policies, data quality, billing surfaces). |
| intelliscan-server/src/utils/db.js | Backend Module | SQLite connection to `intelliscan-server/intelliscan.db` plus promisified helpers: dbGetAsync/dbAllAsync/dbRunAsync/dbExecAsync. |
| intelliscan-server/src/utils/logger.js | Backend Module | Audit/event logging utilities writing into audit tables (security/compliance). |
| intelliscan-server/src/utils/smtp.js | Backend Module | Nodemailer SMTP transport helper (real SMTP if configured, otherwise safe simulated mode for demos). |
| intelliscan-server/src/workers/tesseract_ocr_worker.js | Backend Module | Isolated Tesseract OCR worker process (offline fallback OCR without crashing the main server). |
| intelliscan-server/syntax_err.txt | Backend | Server file/script |
| intelliscan-server/syntax_errors.txt | Backend | Server file/script |
| intelliscan-server/target_tail.txt | Backend | Server file/script |
| intelliscan-server/test_models.js | Backend | Server file/script |
| intelliscan-server/test_output.txt | Backend | Server file/script |
| intelliscan-server/tests/auth.test.js | Backend Test | Jest + supertest test |
| intelliscan-server/tests/pipeline.test.js | Backend Test | Jest + supertest test |
| matches.txt | Other | Repo file |
| mock_search_results.csv | Other | Repo file |
| PAGE_HEALTH_REPORT.md | Documentation | IntelliScan Page Health Report |
| PROJECT_STATUS.md | Documentation | IntelliScan Project Status Report (Full Stack) |
| routes.txt | Other | Repo file |
| tools/generate_master_documentation.mjs | Other | Repo file |

---

## 10) Database Dictionary (Authoritative)

Use: `DATA_DICTIONARY_INTELLISCAN_DB.md` (generated directly from the local `intelliscan.db`).

Regenerate:

```powershell
node intelliscan-server/dump_schema_intelliscan_db.cjs
```

