# IntelliScan — Complete System Architecture & Design Document

> **Version**: 2.0 | **Last Updated**: April 4, 2026  
> **Purpose**: LLM-consumable, exhaustive reference for the entire IntelliScan platform — frontend, backend, database, data-flow, page interdependencies, and feature inventory.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Database Schema](#6-database-schema)
7. [Complete Folder & File Tree](#7-complete-folder--file-tree)
8. [Application Flow](#8-application-flow)
9. [Page Interdependency Map](#9-page-interdependency-map)
10. [Complete Feature Inventory](#10-complete-feature-inventory)
11. [API Endpoint Catalog](#11-api-endpoint-catalog)
12. [Authentication & RBAC Model](#12-authentication--rbac-model)
13. [Real-Time & Background Systems](#13-real-time--background-systems)

---

## 1. PROJECT OVERVIEW

**IntelliScan** is an AI-Powered Enterprise CRM & Business Card Management platform. It allows users to scan physical business cards using AI (Google Gemini Vision), automatically extract contact data via OCR, store contacts in a relational database, and manage them through a full-featured CRM with workspace collaboration, email marketing, calendar scheduling, analytics dashboards, and platform administration.

### Core Value Proposition
- **AI-Powered Card Scanning**: Upload or photograph a business card → Gemini Vision AI extracts name, email, phone, company, job title, city → saved to SQLite database automatically.
- **Enterprise Multi-Tenant Workspaces**: Organizations create isolated workspaces with RBAC for team collaboration.
- **Full CRM Pipeline**: Contact management, relationship mapping, org charts, lead routing, deduplication.
- **Email Marketing Engine**: Campaign builder, template library, contact lists, email sequences, tracking.
- **Calendar & Scheduling**: Full calendar system with availability, booking links, recurring events, AI-assisted scheduling.
- **Platform Administration**: Super admin dashboard for system health, AI engine tuning, incident management, audit logs.

---

## 2. HIGH-LEVEL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  React 19 SPA (Vite)                                         │  │
│  │  ├── PublicLayout (Landing, Auth, API Docs)                  │  │
│  │  ├── DashboardLayout (User features: Scan, Contacts, etc.)  │  │
│  │  └── AdminLayout (Workspace Admin + Super Admin panels)      │  │
│  └────────────────────────┬──────────────────────────────────────┘  │
│                           │ HTTP REST + WebSocket                    │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express 5)                    │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌────────────┐  │
│  │ Auth Module  │ │ Scanner API  │ │ CRM Module  │ │ Email Eng. │  │
│  │ JWT+bcrypt   │ │ Gemini+OCR   │ │ Contacts    │ │ Nodemailer │  │
│  └──────┬──────┘ └──────┬───────┘ └──────┬──────┘ └─────┬──────┘  │
│         │               │                │              │          │
│  ┌──────┴───────────────┴────────────────┴──────────────┴──────┐   │
│  │                    SQLite3 Database                          │   │
│  │  (35+ tables: users, contacts, events, calendars, etc.)     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Socket.IO    │  │ Cron Jobs    │  │ External AI Services     │  │
│  │ (Real-time)  │  │ (Reminders)  │  │ Google Gemini + OpenAI   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Communication Protocols
| Protocol | Purpose |
|:---------|:--------|
| HTTP REST (JSON) | All CRUD operations, authentication, scanning, CRM |
| WebSocket (Socket.IO) | Real-time workspace chat, live scan notifications |
| SMTP (Nodemailer) | Email invitations, calendar reminders, campaign sends |

### Request Lifecycle
```
Browser → Vite Dev Proxy (port 3000) → Express API (port 5000)
                                        ├── authenticateToken (JWT middleware)
                                        ├── requireEnterpriseAdmin / requireSuperAdmin (RBAC)
                                        ├── Route Handler (business logic)
                                        ├── SQLite3 query (data access)
                                        └── JSON response → Browser
```

---

## 3. TECHNOLOGY STACK

### Frontend
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| React | 19.2.4 | UI component library |
| Vite | 8.0.1 | Build tool & dev server |
| React Router DOM | 7.13.2 | Client-side routing |
| Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| Axios | 1.13.6 | HTTP client for API calls |
| Lucide React | 1.6.0 | Icon library |
| Socket.IO Client | 4.8.3 | WebSocket client for real-time |
| date-fns | 4.1.0 | Date manipulation |
| xlsx | 0.18.5 | Excel export from contacts |
| html-to-image | 1.11.13 | Card screenshot/export |
| qrcode.react | 4.2.0 | QR code generation for digital cards |
| react-hot-toast | 2.6.0 | Toast notifications |

### Backend
| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| Node.js | LTS | Server runtime |
| Express | 5.2.1 | HTTP framework |
| SQLite3 | 6.0.1 | Embedded relational database |
| JSON Web Token | 9.0.3 | Authentication tokens |
| bcryptjs | 3.0.3 | Password hashing |
| @google/generative-ai | 0.24.1 | Gemini Vision AI for card scanning |
| OpenAI | 6.33.0 | Alternative AI engine |
| Nodemailer | 6.10.1 | Email delivery (SMTP) |
| Socket.IO | 4.8.3 | WebSocket server |
| Helmet | 8.1.0 | HTTP security headers |
| express-rate-limit | 8.3.2 | API rate limiting |
| express-validator | 7.0.1 | Input validation |
| Tesseract.js | 7.0.0 | Fallback local OCR engine |
| dotenv | 17.3.1 | Environment variable loading |

---

## 4. BACKEND ARCHITECTURE

### 4.1 Entry Point & Module Layout

The backend is a monolithic Express application (`index.js`, ~7,700 lines) undergoing modularization. Extracted modules live under `src/`.

```
intelliscan-server/
├── index.js                          # Main server entry (Express app, all routes)
├── package.json                      # Dependencies & scripts
├── .env                              # Environment variables (secrets)
├── database.sqlite                   # Primary SQLite database file
├── parsed_schema.sql                 # Full DDL schema reference
├── src/
│   ├── config/
│   │   └── constants.js              # App-wide constants (audit status codes)
│   ├── middleware/
│   │   └── auth.js                   # authenticateToken, requireSuperAdmin, requireEnterpriseAdmin
│   ├── routes/
│   │   └── workspaceRoutes.js        # Modular workspace member/invitation routes
│   ├── utils/
│   │   ├── db.js                     # Database helper (dbRunAsync, dbGetAsync, dbAllAsync)
│   │   ├── smtp.js                   # createSmtpTransporterFromEnv() - email transport
│   │   └── logger.js                 # Structured logging utility
│   └── workers/
│       └── tesseract_ocr_worker.js   # Background OCR via Tesseract.js
```

### 4.2 Middleware Chain

Every authenticated request passes through:
1. **Helmet** — Sets security HTTP headers
2. **CORS** — Allows cross-origin requests from frontend
3. **express.json()** — Parses JSON bodies (50MB limit for base64 images)
4. **Rate Limiter** — Configurable per-IP rate limiting
5. **authenticateToken** — Verifies JWT, attaches `req.user`
6. **Role Guards** — `requireEnterpriseAdmin`, `requireSuperAdmin`, `requireEnterpriseOrAdmin`

### 4.3 Authentication Flow
```
POST /api/auth/register → bcrypt.hash(password) → INSERT users → JWT signed → return token
POST /api/auth/login    → SELECT user by email → bcrypt.compare → JWT signed → return token + user
GET  /api/auth/me       → authenticateToken → return current user profile from DB
```
- Tokens carry: `{ id, email, role }` signed with `JWT_SECRET` env var.
- Sessions tracked in `sessions` table (device, IP, location, active status).

### 4.4 AI Scanner Pipeline

This is the core feature. The scanning flow is:

```
POST /api/scan
  ├── 1. Receive base64 image from frontend
  ├── 2. Select AI engine (Gemini primary, OpenAI fallback, Tesseract local)
  ├── 3. Send to Google Gemini Vision API with structured prompt
  │       Prompt: "Extract name, email, phone, company, job_title from this business card"
  ├── 4. Parse AI response → JSON contact object
  ├── 5. Duplicate detection: check existing contacts by email
  ├── 6. INSERT INTO contacts (user_id, name, email, phone, company, ...)
  ├── 7. Update user_quotas (increment used_count)
  ├── 8. Log audit_trail event
  ├── 9. Emit Socket.IO event for real-time dashboard update
  └── 10. Return extracted contact JSON to frontend

POST /api/scan-multi  → Same pipeline but processes array of images in batch
```

### 4.5 Key API Route Groups

| Route Group | Prefix | Auth | Description |
|:------------|:-------|:-----|:------------|
| Health | `/api/health` | No | Server health check |
| Auth | `/api/auth/*` | Mixed | Register, login, me |
| Contacts | `/api/contacts/*` | JWT | CRUD, stats, relationships, semantic search, export |
| Scanner | `/api/scan`, `/api/scan-multi` | JWT | AI card scanning (single + batch) |
| Calendar | `/api/calendar/*` | JWT+Enterprise | Calendars, events, availability, booking |
| Email Marketing | `/api/campaigns/*` | JWT | Campaign CRUD, audience preview, auto-write |
| Email Lists | (in campaigns) | JWT | Contact lists for email targeting |
| CRM | `/api/crm/*` | JWT | Config, connect/disconnect, schema, sync, export |
| Workspace | `/api/workspace/*` | JWT | Members, billing, data-policies, contacts, data-quality |
| Enterprise | `/api/enterprise/*` | JWT | Audit logs, webhooks, system health, workspaces |
| Admin | `/api/admin/*` | JWT+SuperAdmin | Incidents, integration health, failed syncs |
| Engine | `/api/engine/*` | JWT | AI config, versions, rollback, performance stats |
| Sandbox | `/api/sandbox/*` | JWT | API testing sandbox (test calls + logs) |
| Sessions | `/api/sessions/*` | JWT | Active sessions, revoke |
| Events | `/api/events/*` | JWT | Networking events CRUD |
| Drafts | `/api/drafts/*` | JWT | AI email draft generation |
| Cards | `/api/cards/*`, `/api/my-card` | JWT | Digital business card designer |
| Analytics | `/api/analytics/*` | Mixed | Usage logging, stats, dashboard |
| Routing | `/api/routing-rules` | JWT | Contact routing rules |
| Coach | `/api/coach/*` | JWT | AI networking coach insights |
| Chat | `/api/chats/*` | JWT | Workspace real-time chat history |
| Search | `/api/search/global` | JWT | Cross-entity global search |
| Signals | `/api/signals` | JWT | Networking intelligence signals |

---

## 5. FRONTEND ARCHITECTURE

### 5.1 Application Entry

```
intelliscan-app/src/
├── main.jsx          # ReactDOM.createRoot → BrowserRouter → RoleProvider → ContactProvider → BatchQueueProvider → App
├── App.jsx           # Route definitions (100+ routes) with layout wrappers and RoleGuard
├── App.css           # Global CSS overrides
└── index.css         # Tailwind directives (@tailwind base/components/utilities)
```

### 5.2 Layout System (3-Tier)

| Layout | File | Purpose | Sidebar |
|:-------|:-----|:--------|:--------|
| **PublicLayout** | `layouts/PublicLayout.jsx` | Landing, auth pages, public profiles | None |
| **DashboardLayout** | `layouts/DashboardLayout.jsx` | User-facing features (scan, contacts, calendar, email) | Left sidebar with user navigation |
| **AdminLayout** | `layouts/AdminLayout.jsx` | Workspace admin + Super admin panels | Dynamic sidebar based on `role` prop (`business_admin` or `super_admin`) |

### 5.3 Context Providers (Global State)

| Context | File | State Managed |
|:--------|:-----|:--------------|
| **RoleContext** | `context/RoleContext.jsx` | `role` (user/business_admin/super_admin), `tier` (personal/pro/enterprise), `isAuthReady`, `signOut()` |
| **ContactContext** | `context/ContactContext.jsx` | `contacts[]`, `addContact()`, `deleteContact()`, `updateContact()`, `enrichContact()`, `semanticSearch()` |
| **BatchQueueContext** | `context/BatchQueueContext.jsx` | Batch scan queue, progress tracking, queue management |

### 5.4 Shared Components

| Component | File | Purpose |
|:----------|:-----|:--------|
| **RoleGuard** | `components/RoleGuard.jsx` | Wrapper that checks `useRole()` against `allowedRoles[]`, redirects if unauthorized |
| **CommandPalette** | `components/CommandPalette.jsx` | Cmd+K global search overlay for quick navigation |
| **ActivityTracker** | `components/ActivityTracker.jsx` | Tracks user page views, sends to `/api/analytics/log` |
| **ChatbotWidget** | `components/ChatbotWidget.jsx` | Floating AI support chat (calls `/api/chat/support`) |
| **DevTools** | `components/DevTools.jsx` | Developer overlay for role switching and session inspection |
| **GlobalErrorBoundary** | `components/GlobalErrorBoundary.jsx` | React error boundary with fallback UI |
| **SignalsCard** | `components/SignalsCard.jsx` | Reusable networking intelligence signal display |

### 5.5 Custom Hooks

| Hook | File | Purpose |
|:-----|:-----|:--------|
| **useDarkMode** | `hooks/useDarkMode.jsx` | Persistent dark mode toggle (localStorage) |

### 5.6 Utilities

| Utility | File | Purpose |
|:--------|:-----|:--------|
| **auth.js** | `utils/auth.js` | `getStoredToken()`, `setStoredUser()`, `clearStoredAuth()`, `resolveHomeRoute()`, `safeReadStoredUser()` |
| **calendarUtils.js** | `utils/calendarUtils.js` | Date grid generation, event overlap detection, time formatting |

---

## 6. DATABASE SCHEMA

The SQLite database contains **35 tables**:

### Core Tables
| Table | Description | Key Columns |
|:------|:------------|:------------|
| `users` | All user accounts | id, name, email, password (bcrypt), role, workspace_id, tier |
| `contacts` | Scanned/manual contacts | id, user_id, name, email, phone, company, job_title, tags, event_id, confidence, engine_used, workspace_scope |
| `user_quotas` | Scan usage limits | user_id, used_count, limit_amount, group_scans_used |
| `sessions` | Active login sessions | user_id, token, device_info, ip_address, is_active |
| `onboarding_prefs` | User onboarding choices | user_id, preferences_json |

### Workspace Tables
| Table | Description |
|:------|:------------|
| `workspace_policies` | Data retention, PII redaction settings per workspace |
| `workspace_chats` | Real-time team chat messages |

### Contact Intelligence Tables
| Table | Description |
|:------|:------------|
| `contact_relationships` | from_contact_id → to_contact_id with type (reports_to, colleague, etc.) |
| `routing_rules` | Condition-based contact routing (field, operator, value → action) |
| `crm_mappings` | External CRM provider mapping configs |
| `crm_sync_log` | CRM synchronization history |
| `data_quality_dedupe_queue` | Duplicate contact detection queue |

### Calendar Tables
| Table | Description |
|:------|:------------|
| `calendars` | User calendars (personal, shared, workspace) |
| `calendar_events` | Events with recurrence, conferencing, timezone |
| `event_attendees` | Attendee list with RSVP status and response tokens |
| `event_reminders` | Scheduled reminder notifications |
| `calendar_shares` | Calendar sharing permissions |
| `event_contact_links` | Links calendar events to CRM contacts |
| `availability_slots` | Weekly availability schedule |
| `booking_links` | Public booking link configurations |

### Email Marketing Tables
| Table | Description |
|:------|:------------|
| `email_campaigns` | Campaign definitions (subject, body, targeting, status) |
| `campaign_recipients` | Per-recipient send status |
| `email_lists` | Contact lists for targeting |
| `email_list_contacts` | List membership |
| `email_templates` | Reusable email templates |
| `email_sends` | Individual send tracking (opens, clicks, bounces) |
| `email_clicks` | Click tracking per link |
| `email_automations` | Automation sequences |

### Platform Admin Tables
| Table | Description |
|:------|:------------|
| `audit_trail` | Full audit log (actor, action, resource, IP, details) |
| `analytics_logs` | Page view & action analytics |
| `engine_config` | AI engine configuration key-value |
| `model_versions` | OCR model version history with accuracy metrics |
| `api_sandbox_calls` | API sandbox test call logs |
| `platform_incidents` | System incident tracking |
| `integration_sync_jobs` | CRM integration sync job queue |

### Other Tables
| Table | Description |
|:------|:------------|
| `events` | Networking events (conferences, meetups) |
| `ai_drafts` | AI-generated email drafts |
| `digital_cards` | Digital business card designs |
| `saved_cards` | User-saved card designs |
| `billing_payment_methods` | Workspace payment methods |
| `billing_invoices` | Invoice history |

---

## 7. COMPLETE FOLDER & FILE TREE

### 7.1 Backend (`intelliscan-server/`)

```
intelliscan-server/
├── index.js                              # Main Express app (~7,700 lines, all routes + middleware)
├── package.json                          # Node dependencies, scripts: start, dev, test
├── .env                                  # GEMINI_API_KEY, JWT_SECRET, SMTP_*, OPENAI_API_KEY
├── .env.example                          # Template for environment variables
├── database.sqlite                       # Primary SQLite database file
├── parsed_schema.sql                     # Complete DDL schema (35 CREATE TABLE)
├── ensure_tables.js                      # Script to create missing tables
├── get_schema.js                         # Script to dump current schema
├── dump_schema_intelliscan_db.cjs        # CJS schema dumper
├── fix_admin.js                          # Admin user fix utility
├── seed_requested_users.js               # Test user seeder
├── test_models.js                        # AI model connectivity test
├── eng.traineddata                       # Tesseract OCR training data (English)
├── api_routes.txt                        # Route listing reference
├── src/
│   ├── config/
│   │   └── constants.js                  # AUDIT_SUCCESS, AUDIT_ERROR, AUDIT_FAILURE
│   ├── middleware/
│   │   └── auth.js                       # authenticateToken, requireSuperAdmin, requireEnterpriseAdmin
│   ├── routes/
│   │   └── workspaceRoutes.js            # GET /members, POST /members/invite, invitations, DELETE /members/:id
│   ├── utils/
│   │   ├── db.js                         # Promisified SQLite wrappers (dbRunAsync, dbGetAsync, dbAllAsync)
│   │   ├── smtp.js                       # createSmtpTransporterFromEnv() using SMTP_* env vars
│   │   └── logger.js                     # Structured JSON logger
│   └── workers/
│       └── tesseract_ocr_worker.js       # Tesseract.js OCR worker for fallback scanning
├── tests/                                # Jest + Supertest API tests
├── College_Document/                     # Academic documentation
│   └── Presentation-1_intelliscan.md     # College presentation content
```

### 7.2 Frontend (`intelliscan-app/`)

```
intelliscan-app/
├── index.html                            # SPA entry HTML
├── package.json                          # React dependencies, scripts: dev, build, lint
├── vite.config.js                        # Vite config with proxy to backend :5000
├── tailwind.config.js                    # Tailwind theme customization
├── postcss.config.js                     # PostCSS plugins
├── eslint.config.js                      # ESLint configuration
├── public/                               # Static assets
├── src/
│   ├── main.jsx                          # App bootstrap: BrowserRouter → Providers → App
│   ├── App.jsx                           # Central route map (100+ routes)
│   ├── App.css                           # Global CSS overrides
│   ├── index.css                         # Tailwind directives
│   │
│   ├── layouts/                          # ── LAYOUT WRAPPERS ──
│   │   ├── PublicLayout.jsx              # Minimal chrome for public pages
│   │   ├── DashboardLayout.jsx           # Left sidebar + content for user dashboard
│   │   └── AdminLayout.jsx               # Dynamic sidebar for workspace/super admin
│   │
│   ├── context/                          # ── REACT CONTEXT (GLOBAL STATE) ──
│   │   ├── RoleContext.jsx               # Auth state: role, tier, isAuthReady, signOut
│   │   ├── ContactContext.jsx            # Contact CRUD: contacts[], addContact, deleteContact, enrichContact
│   │   └── BatchQueueContext.jsx         # Batch scan queue management
│   │
│   ├── hooks/                            # ── CUSTOM HOOKS ──
│   │   └── useDarkMode.jsx               # Dark mode toggle with localStorage persistence
│   │
│   ├── utils/                            # ── UTILITIES ──
│   │   ├── auth.js                       # Token storage, user resolution, home route resolver
│   │   └── calendarUtils.js              # Date grids, overlap detection
│   │
│   ├── data/                             # ── STATIC DATA ──
│   │   └── mockContacts.js               # Fallback mock contacts (development only)
│   │
│   ├── components/                       # ── SHARED COMPONENTS ──
│   │   ├── RoleGuard.jsx                 # Route protection by role
│   │   ├── CommandPalette.jsx            # Cmd+K navigation overlay
│   │   ├── ActivityTracker.jsx           # Analytics event tracker
│   │   ├── ChatbotWidget.jsx             # AI support chat widget
│   │   ├── DevTools.jsx                  # Developer role-switching panel
│   │   ├── GlobalErrorBoundary.jsx       # Error boundary with fallback UI
│   │   ├── SignalsCard.jsx               # Networking signals display card
│   │   ├── calendar/                     # Calendar sub-components
│   │   │   ├── AISchedulingPanel.jsx     # AI time suggestion panel
│   │   │   ├── AttendeeInput.jsx         # Attendee email input
│   │   │   ├── ColorPicker.jsx           # Calendar color picker
│   │   │   ├── EventDetailPopover.jsx    # Event detail hover card
│   │   │   ├── EventModal.jsx            # Create/edit event modal
│   │   │   ├── EventPill.jsx             # Calendar event pill
│   │   │   ├── MiniCalendar.jsx          # Sidebar mini calendar
│   │   │   ├── RecurrenceSelector.jsx    # Recurrence rule builder
│   │   │   └── TimeGrid.jsx             # Week/day time grid
│   │   └── email/                        # Email marketing sub-components
│   │       ├── CampaignStatsCard.jsx     # Campaign metrics card
│   │       ├── EmailPreview.jsx          # Email content previewer
│   │       ├── EmailStatusBadge.jsx      # Send status badge
│   │       ├── OpenRateBar.jsx           # Open rate visualization
│   │       └── TemplateCard.jsx          # Template library card
│   │
│   └── pages/                            # ── ALL PAGES (95+ TOTAL) ──
│       │
│       │   # ── PUBLIC PAGES ──
│       ├── LandingPage.jsx               # Marketing landing page (unauthenticated root)
│       ├── SignInPage.jsx                 # Email/password login
│       ├── SignUpPage.jsx                 # User registration
│       ├── ForgotPassword.jsx            # Password reset request
│       ├── OnboardingPage.jsx            # Post-signup onboarding wizard
│       ├── PublicAnalyticsPage.jsx        # Public platform stats
│       ├── ApiDocsPage.jsx               # Public API documentation
│       │
│       │   # ── USER DASHBOARD PAGES ──
│       ├── ScanPage.jsx                  # AI business card scanner (camera + upload + batch)
│       ├── ContactsPage.jsx              # Contact list with search, filter, export, detail view
│       ├── SettingsPage.jsx              # User profile, password, notifications, sessions
│       ├── MarketplacePage.jsx           # Integration marketplace
│       ├── FeedbackPage.jsx              # User feedback submission
│       ├── CardCreatorPage.jsx           # Digital business card designer
│       ├── ScannerLinksPage.jsx          # Shareable scanner link management
│       ├── AdvancedApiExplorerSandbox.jsx# Interactive API testing sandbox
│       ├── AiTrainingTuningSuperAdmin.jsx# AI model tuning interface
│       │
│       ├── dashboard/                    # Dashboard sub-pages
│       │   ├── EventsPage.jsx            # Networking events management
│       │   ├── DraftsPage.jsx            # AI email draft composer
│       │   ├── MyCardPage.jsx            # Personal digital card view/share
│       │   ├── CoachPage.jsx             # AI networking coach (insights + tips)
│       │   ├── KioskMode.jsx             # Full-screen scanning kiosk
│       │   ├── MeetingToolsPage.jsx      # Meeting preparation tools
│       │   ├── SignalsPage.jsx           # Networking intelligence signals
│       │   └── Leaderboard.jsx           # Team scanning leaderboard
│       │
│       ├── calendar/                     # Calendar sub-pages
│       │   ├── CalendarPage.jsx          # Full calendar view (month/week/day)
│       │   ├── AvailabilityPage.jsx      # Weekly availability editor
│       │   ├── BookingLinksPage.jsx       # Booking link management
│       │   └── BookingPage.jsx           # Public booking form
│       │
│       ├── email/                        # Email marketing sub-pages
│       │   ├── EmailMarketingPage.jsx    # Email marketing dashboard
│       │   ├── CampaignListPage.jsx      # Campaign list view
│       │   ├── CampaignBuilderPage.jsx   # Visual campaign builder
│       │   ├── CampaignDetailPage.jsx    # Campaign analytics detail
│       │   ├── TemplateLibraryPage.jsx   # Email template library
│       │   ├── ContactListsPage.jsx      # Email contact list management
│       │   ├── ListDetailPage.jsx        # Individual list detail & members
│       │   └── EmailSequencesPage.jsx    # Automation sequences
│       │
│       │   # ── WORKSPACE ADMIN PAGES ──
│       ├── WorkspaceDashboard.jsx        # Workspace overview metrics
│       ├── WorkspaceContacts.jsx         # Workspace-scoped contact view
│       ├── MembersPage.jsx              # Team member management & invitations
│       ├── AnalyticsPage.jsx            # Workspace analytics dashboard
│       ├── BillingPage.jsx              # Billing, payment methods, invoices
│       ├── OrgChartPage.jsx             # Interactive organizational chart
│       ├── workspace/
│       │   ├── CrmMappingPage.jsx        # CRM field mapping configuration
│       │   ├── RoutingRulesPage.jsx      # Contact routing rules engine
│       │   ├── DataPoliciesPage.jsx      # Data retention & PII policies
│       │   ├── DataQualityCenterPage.jsx # Deduplication & data quality
│       │   ├── SharedRolodexPage.jsx     # Shared team contact rolodex
│       │   ├── EmailCampaignsPage.jsx    # Workspace email campaigns
│       │   ├── PipelinePage.jsx          # CRM sales pipeline (Kanban)
│       │   └── WebhookManagement.jsx     # Webhook configuration
│       │
│       │   # ── SUPER ADMIN PAGES ──
│       ├── AdminDashboard.jsx           # Platform-wide admin dashboard
│       ├── EnginePerformance.jsx         # AI engine performance monitoring
│       ├── SuperAdminFeedbackPage.jsx   # User feedback review (admin side)
│       ├── admin/
│       │   ├── CustomModelsPage.jsx      # AI model management
│       │   ├── JobQueuesPage.jsx         # Background job queue monitor
│       │   └── SystemIncidentCenter.jsx  # Platform incident management
│       │
│       │   # ── AUTO-GENERATED PAGES (62 pages) ──
│       └── generated/
│           ├── routes.json               # Route config for auto-loading
│           ├── PublicProfile.jsx          # Public user profile (/u/:slug)
│           ├── GenSystemHealthSuperAdmin.jsx
│           ├── GenPrivacyGdprCommandCenter.jsx
│           ├── GenWorkspacesOrganizationsSuperAdmin.jsx
│           ├── GenAiModelVersioningRollback.jsx
│           ├── GenSubscriptionPlanComparison.jsx
│           ├── GenAdvancedSecurityAuditLogs1.jsx
│           ├── GenAdvancedSecurityAuditLogs2.jsx
│           ├── GenContactMergeDeduplication.jsx
│           ├── GenBulkContactExportWizard1.jsx
│           ├── GenBulkContactExportWizard2.jsx
│           ├── GenBulkMemberInvitationImport.jsx
│           ├── GenMemberRolePermissionMatrix.jsx
│           ├── GenMemberRolePermissionsEditor1.jsx
│           ├── GenMemberRolePermissionsEditor2.jsx
│           ├── GenEnterpriseSsoSamlConfig.jsx
│           ├── GenEnterpriseWhitelabelBrandingConfig.jsx
│           ├── GenEnterpriseWhitelabelBrandingConfigFixed.jsx
│           ├── GenHelpCenterDocs.jsx
│           ├── GenGlobalSearchIntelligence.jsx
│           ├── GenGlobalSearchUniversalDiscovery.jsx
│           ├── GenGlobalSystemStatusPage.jsx
│           ├── GenUsageQuotasLimits.jsx
│           ├── GenReferralLoyaltyDashboard.jsx
│           ├── GenSecurityKeyMfaSetup.jsx
│           ├── GenDynamicDashboardBuilder.jsx
│           ├── GenInsightsAiForecasting.jsx
│           ├── GenStrategicAccountReviews.jsx
│           ├── GenDataExportMigration.jsx
│           ├── GenDataExportHistoryLog.jsx
│           ├── GenBatchProcessingMonitorUserDashboard.jsx
│           ├── GenApiIntegrations.jsx
│           ├── GenApiPerformanceWebhooks.jsx
│           ├── GenApiWebhookConfiguration1.jsx
│           ├── GenApiWebhookConfiguration2.jsx
│           ├── GenApiWebhookLogsDebugging.jsx
│           ├── GenAdvancedApiExplorerSandbox.jsx
│           ├── GenAdvancedApiWebhookMonitor.jsx
│           ├── GenAdvancedCsvJsonExportMapper.jsx
│           ├── GenAdvancedSegmentBuilder.jsx
│           ├── GenInteractiveApiPayloadExplorer.jsx
│           ├── GenInteractiveFeatureToursHelpOverlays.jsx
│           ├── GenAiConfidenceAuditFeedbackHub.jsx
│           ├── GenAiConflictResolutionHumanInTheLoop.jsx
│           ├── GenAiMaintenanceRetrainingLogs.jsx
│           ├── GenAiTrainingTuningSuperAdmin.jsx
│           ├── GenAuditLogsSecurity.jsx
│           ├── GenBillingUsage.jsx
│           ├── GenComplianceDataSovereigntySuperAdmin.jsx
│           ├── GenComplianceDisclosureLegalCenter.jsx
│           ├── GenContactDetailView.jsx
│           ├── GenErrorResolutionCenter.jsx
│           ├── GenGlobalDataRetentionArchiving.jsx
│           ├── GenMarketplaceIntegrationsBusinessAdmin.jsx
│           ├── GenSecurityThreatMonitoringSuperAdmin.jsx
│           ├── GenSystemMaintenanceDowntimeSchedule.jsx
│           ├── GenSystemNotificationCenterSuperAdmin.jsx
│           ├── GenUserFeedbackBugReporting.jsx
│           ├── GenWorkflowAutomationsBusinessAdmin.jsx
│           ├── Gen404SystemErrorStates.jsx
│           ├── GenEmptyStatesNoResultsTemplate.jsx
│           ├── GenMaintenanceSystemUpdateMode.jsx
│           └── GenBillingUsage.jsx
```

---

## 8. APPLICATION FLOW

### 8.1 User Registration → First Scan → Contact Saved

```
1. User visits /                         → LandingPage (marketing)
2. User clicks "Get Started"             → /sign-up → SignUpPage
3. POST /api/auth/register               → Creates user (role=user, tier=personal)
4. Auto-redirect to /onboarding          → OnboardingPage (preferences saved)
5. Redirect to /dashboard/scan           → ScanPage (DashboardLayout)
6. User uploads business card image
7. POST /api/scan (base64 image)         → Gemini Vision extracts contact JSON
8. Response: { name, email, phone, ... }
9. ContactContext.addContact() called    → POST /api/contacts → INSERT INTO contacts
10. Contact appears in /dashboard/contacts → ContactsPage (same ContactContext)
```

### 8.2 Enterprise Admin Flow

```
1. Admin logs in                          → resolveHomeRoute() → /workspace/dashboard
2. Admin visits /workspace/members        → MembersPage
3. Admin invites member via email         → POST /api/workspace/members/invite
4. Nodemailer sends invitation email
5. Invitee registers → accepts invite     → POST /api/workspaces/invitations/:token/accept
6. Invitee's workspace_id updated         → They now see workspace data
```

### 8.3 Email Campaign Flow

```
1. Admin visits /dashboard/email-marketing     → EmailMarketingPage
2. Creates campaign /dashboard/email-marketing/campaigns/new → CampaignBuilderPage
3. POST /api/campaigns (name, subject, body, targeting)
4. Selects contact list from /dashboard/email-marketing/lists → ContactListsPage
5. Uses AI auto-writer: POST /api/campaigns/auto-write
6. Sends campaign → Nodemailer delivers emails
7. Tracks opens/clicks via /api/campaigns stats
8. Views results at /dashboard/email-marketing/campaigns/:id → CampaignDetailPage
```

### 8.4 Calendar Scheduling Flow

```
1. User visits /dashboard/calendar        → CalendarPage
2. Creates event                          → POST /api/calendar/events
3. Adds attendees (linked to contacts)    → INSERT event_attendees, event_contact_links
4. AI suggests optimal time               → POST /api/calendar/ai/suggest-time
5. Sets reminder                          → INSERT event_reminders
6. Cron job checks reminders              → Sends email via Nodemailer when due
7. Attendees RSVP via response token      → GET /api/calendar/respond/:token
8. User checks availability at            → /dashboard/calendar/availability → AvailabilityPage
9. Creates booking link at                → /dashboard/calendar/booking-links → BookingLinksPage
10. External users book at                → /book/:slug → BookingPage (public)
```

---

## 9. PAGE INTERDEPENDENCY MAP

This section documents how pages are connected — where data flows FROM one page TO another.

### 9.1 Critical Data Pipelines

```
┌──────────────┐     saves contact to DB      ┌──────────────────┐
│  ScanPage    │ ─────────────────────────────→│  ContactsPage    │
│ /dashboard/  │  ContactContext.addContact()  │ /dashboard/      │
│   scan       │                               │   contacts       │
└──────┬───────┘                               └────────┬─────────┘
       │                                                │
       │ updates quota                                  │ contact data feeds into
       ▼                                                ▼
┌──────────────┐                          ┌───────────────────────┐
│ Settings     │                          │  OrgChartPage         │
│ (quota       │                          │  /workspace/org-chart │
│  display)    │                          │  (relationship viz)   │
└──────────────┘                          └───────────────────────┘
                                                    │
       ┌────────────────────────────────────────────┘
       │ contacts used as
       ▼
┌──────────────────┐    ┌───────────────────────┐    ┌──────────────────┐
│ EmailCampaigns   │    │ CalendarPage          │    │ DraftsPage       │
│ (target audience)│    │ (event attendees from │    │ (AI drafts for   │
│                  │    │  contact list)        │    │  selected contact)│
└──────────────────┘    └───────────────────────┘    └──────────────────┘
```

### 9.2 Detailed Page-to-Page Dependencies

| Source Page | Target Page | Data Relationship |
|:------------|:------------|:------------------|
| **ScanPage** → **ContactsPage** | Scanned contacts are saved to DB via `ContactContext.addContact()`. ContactsPage reads from same context and `/api/contacts`. |
| **ScanPage** → **SettingsPage** | Each scan increments `user_quotas.used_count`. SettingsPage shows remaining quota from `/api/user/quota`. |
| **ScanPage** → **WorkspaceContacts** | If `workspace_scope` is set, scanned contacts appear in workspace view at `/api/workspace/contacts`. |
| **ScanPage** → **AnalyticsPage** | Each scan creates an `analytics_logs` entry. AnalyticsPage reads aggregated stats from `/api/analytics/dashboard`. |
| **ScanPage** → **Leaderboard** | Scan counts per user power the leaderboard ranking at `/dashboard/leaderboard`. |
| **ContactsPage** → **OrgChartPage** | Contacts with `contact_relationships` are visualized as org trees. |
| **ContactsPage** → **DraftsPage** | User selects a contact → AI generates email draft via `/api/drafts/generate`. Draft appears in DraftsPage. |
| **ContactsPage** → **CalendarPage** | Contacts can be linked to calendar events as attendees via `event_contact_links`. |
| **ContactsPage** → **EmailCampaigns** | Contacts are added to `email_lists` for campaign targeting. |
| **ContactsPage** → **CrmMappingPage** | Contact fields map to external CRM fields for export. |
| **ContactsPage** → **DataQualityCenterPage** | Duplicate contacts detected → shown in deduplication queue. |
| **MembersPage** → **WorkspaceDashboard** | Invited members affect workspace member count displayed. |
| **MembersPage** → **OrgChartPage** | Members' roles and reporting structure power the org chart. |
| **CalendarPage** → **BookingPage** | Booking links created in calendar settings become public pages at `/book/:slug`. |
| **CalendarPage** → **AvailabilityPage** | Availability slots define bookable windows. |
| **CalendarPage** → **ContactsPage** | Event attendees auto-linked to contacts via `event_contact_links`. |
| **EmailMarketingPage** → **CampaignBuilderPage** | Initiates campaign creation. |
| **CampaignBuilderPage** → **ContactListsPage** | Campaign selects target lists. |
| **CampaignBuilderPage** → **TemplateLibraryPage** | Campaign uses email templates. |
| **CampaignBuilderPage** → **CampaignDetailPage** | After send, view analytics. |
| **MyCardPage** → **CardCreatorPage** | User designs their card in creator, views/shares in MyCard. |
| **MyCardPage** → **PublicProfile** | Digital card powers the public profile at `/u/:slug`. |
| **AdminDashboard** → **EnginePerformance** | Admin drills into AI engine metrics. |
| **AdminDashboard** → **SystemIncidentCenter** | Admin views/manages platform incidents. |
| **SignInPage** → **RootRoute** | After login, `resolveHomeRoute()` sends user to role-appropriate dashboard. |
| **SettingsPage** → **Sessions** | Shows active sessions from `/api/sessions/me`, allows revocation. |
| **CoachPage** ← **ContactsPage** | Coach insights are generated based on contact portfolio data. |
| **SignalsPage** ← **ContactsPage** | Networking signals analyze contact interaction patterns. |
| **RoutingRulesPage** → **ContactsPage** | Rules auto-assign incoming contacts to team members. |
| **DataPoliciesPage** → **ContactsPage** | Retention policies affect contact data lifecycle. |
| **PipelinePage** ← **ContactsPage** | Contacts placed into sales pipeline stages. |

### 9.3 Bidirectional Dependencies

These pages share state and affect each other:

| Page A | Page B | Bidirectional Flow |
|:-------|:-------|:-------------------|
| **ScanPage** ↔ **ContactsPage** | Scan creates contacts; contacts page can trigger re-scan. Both use `ContactContext`. |
| **CalendarPage** ↔ **ContactsPage** | Events reference contacts as attendees; contacts show linked events. |
| **EmailCampaigns** ↔ **ContactListsPage** | Campaigns target lists; lists show which campaigns used them. |
| **MembersPage** ↔ **WorkspaceContacts** | Members determine who can see which contacts via workspace_id. |
| **DraftsPage** ↔ **ContactsPage** | Drafts are generated for contacts; sent drafts update contact interaction history. |

---

## 10. COMPLETE FEATURE INVENTORY

### 10.1 AI & Scanning (7 features)
1. **Single Card Scan** — Upload/capture → Gemini Vision AI extraction
2. **Batch Multi-Scan** — Process multiple cards in one request
3. **AI Engine Selection** — Gemini (primary), OpenAI (secondary), Tesseract (local fallback)
4. **Confidence Scoring** — Each extracted field has a confidence percentage
5. **Duplicate Detection** — Prevents saving contacts with matching email
6. **AI Draft Generation** — Generate follow-up emails for contacts using AI
7. **AI Networking Coach** — AI-powered insights on networking strategy

### 10.2 Contact Management (12 features)
1. **Contact CRUD** — Create, read, update, delete contacts
2. **Advanced Search** — Filter by name, company, city, tags
3. **Semantic Search** — AI-powered natural language search
4. **Contact Enrichment** — AI enriches contacts with industry, seniority, bio
5. **Tags & Categories** — Tagging system for contact organization
6. **Excel Export** — Export contacts to XLSX spreadsheet
7. **Contact Relationships** — Define relationships (colleague, reports_to, etc.)
8. **Org Chart Visualization** — Interactive company organizational charts
9. **CRM Field Mapping** — Map contact fields to external CRM schemas
10. **Contact Routing Rules** — Auto-assign contacts based on conditions
11. **Data Quality / Deduplication** — Detect and merge duplicate contacts
12. **Shared Rolodex** — Team-wide contact sharing within workspace

### 10.3 Calendar & Scheduling (8 features)
1. **Multi-Calendar Support** — Personal, shared, workspace calendars
2. **Event CRUD with Recurrence** — Daily, weekly, monthly, yearly patterns
3. **Attendee Management** — Invite attendees with email RSVP
4. **AI Time Suggestion** — AI suggests optimal meeting times
5. **AI Description Generation** — AI writes event descriptions
6. **Availability Slots** — Define weekly availability windows
7. **Booking Links** — Public scheduling pages (like Calendly)
8. **Email Reminders** — Automated reminder emails via cron + Nodemailer

### 10.4 Email Marketing (8 features)
1. **Campaign Builder** — Visual email campaign creation
2. **Template Library** — Reusable email templates with variables
3. **Contact Lists** — Static and dynamic segment-based lists
4. **AI Auto-Writer** — AI generates campaign copy
5. **Send Tracking** — Per-recipient open/click/bounce tracking
6. **Campaign Analytics** — Aggregate metrics dashboard
7. **Email Sequences** — Multi-step automation sequences
8. **Audience Preview** — Preview matching contacts before send

### 10.5 Workspace & Team (10 features)
1. **Multi-Tenant Workspaces** — Isolated data per organization
2. **Email Invitations** — SMTP-based workspace invitations
3. **Member Management** — Add, remove, change roles
4. **RBAC Role System** — user, business_admin, super_admin
5. **Tier System** — personal, pro, enterprise subscription tiers
6. **Workspace Chat** — Real-time team messaging (Socket.IO)
7. **Team Leaderboard** — Gamified scanning competition
8. **Data Policies** — Configurable retention and PII rules
9. **Billing Management** — Payment methods, invoices, plan management
10. **Webhook Management** — Configure outgoing webhooks

### 10.6 Platform Administration (10 features)
1. **Admin Dashboard** — Platform-wide metrics and user overview
2. **AI Engine Configuration** — Tune OCR model parameters
3. **Model Version History** — Track and rollback AI model versions
4. **Engine Performance Monitor** — Latency, accuracy, throughput metrics
5. **API Sandbox** — Test API calls with live responses
6. **Audit Trail** — Complete action log with actor, IP, timestamp
7. **Incident Management** — Create, acknowledge, resolve platform incidents
8. **System Health Dashboard** — CPU, memory, DB, API health monitoring
9. **Feedback Management** — Review user-submitted feedback
10. **Integration Health** — Monitor CRM sync jobs, retry failures

### 10.7 User Experience (8 features)
1. **Dark Mode** — Full dark theme with localStorage persistence
2. **Command Palette** — Cmd+K quick navigation
3. **Activity Tracking** — Automatic page view analytics
4. **Onboarding Wizard** — Guided first-use experience
5. **Digital Business Card** — Design and share personal digital card
6. **Public Profile** — Shareable profile page at `/u/:slug`
7. **Kiosk Mode** — Full-screen event scanning mode
8. **Meeting Preparation Tools** — Pre-meeting contact briefing

### 10.8 Security & Compliance (6 features)
1. **JWT Authentication** — Stateless token-based auth
2. **bcrypt Password Hashing** — Secure password storage
3. **Session Management** — View/revoke active sessions
4. **Rate Limiting** — Per-IP request throttling
5. **Helmet Security Headers** — XSS, CSP, HSTS protections
6. **Input Validation** — express-validator on critical endpoints

**TOTAL: 69 documented features**

---

## 11. API ENDPOINT CATALOG

### Authentication (4 endpoints)
| Method | Path | Auth | Purpose |
|:-------|:-----|:-----|:--------|
| POST | `/api/auth/register` | No | Create new user account |
| POST | `/api/auth/login` | No | Authenticate and receive JWT |
| GET | `/api/auth/me` | JWT | Get current user profile |
| GET | `/api/user/quota` | JWT | Get scan usage quota |

### Scanning (2 endpoints)
| Method | Path | Auth | Purpose |
|:-------|:-----|:-----|:--------|
| POST | `/api/scan` | JWT | Scan single business card |
| POST | `/api/scan-multi` | JWT | Batch scan multiple cards |

### Contacts (8 endpoints)
| Method | Path | Auth | Purpose |
|:-------|:-----|:-----|:--------|
| GET | `/api/contacts` | JWT | List user's contacts |
| POST | `/api/contacts` | JWT | Create contact |
| DELETE | `/api/contacts/:id` | JWT | Delete contact |
| GET | `/api/contacts/stats` | JWT | Contact statistics |
| POST | `/api/contacts/relationships` | JWT | Create relationship |
| GET | `/api/contacts/:id/relationships` | JWT | Get contact relationships |
| GET | `/api/contacts/mutual` | JWT | Find mutual connections |
| POST | `/api/contacts/export-crm` | JWT | Export to external CRM |

### Calendar (15 endpoints)
| Method | Path | Auth | Purpose |
|:-------|:-----|:-----|:--------|
| GET | `/api/calendar/calendars` | JWT+Ent | List calendars |
| POST | `/api/calendar/calendars` | JWT+Ent | Create calendar |
| PUT | `/api/calendar/calendars/:id` | JWT+Ent | Update calendar |
| DELETE | `/api/calendar/calendars/:id` | JWT+Ent | Delete calendar |
| POST | `/api/calendar/calendars/:id/share` | JWT+Ent | Share calendar |
| GET | `/api/calendar/events` | JWT+Ent | List events (date range) |
| POST | `/api/calendar/events` | JWT+Ent | Create event |
| GET | `/api/calendar/events/:id` | JWT+Ent | Get event detail |
| PATCH | `/api/calendar/events/:id/reschedule` | JWT+Ent | Reschedule event |
| POST | `/api/calendar/ai/suggest-time` | JWT+Ent | AI time suggestion |
| POST | `/api/calendar/ai/generate-description` | JWT+Ent | AI event description |
| GET | `/api/calendar/availability/:userId` | Public | Get availability |
| PUT | `/api/calendar/availability` | JWT+Ent | Set availability |
| POST | `/api/calendar/booking-links` | JWT+Ent | Create booking link |
| GET | `/api/calendar/booking/:slug` | Public | Get booking page data |

### CRM (6 endpoints)
| Method | Path | Auth | Purpose |
|:-------|:-----|:-----|:--------|
| GET | `/api/crm/config` | JWT | Get CRM configuration |
| POST | `/api/crm/config` | JWT | Save CRM mapping |
| POST | `/api/crm/connect` | JWT | Connect CRM provider |
| POST | `/api/crm/disconnect` | JWT | Disconnect CRM |
| GET | `/api/crm/schema` | JWT | Get CRM field schema |
| GET | `/api/crm/sync-log` | JWT | View sync history |

### Workspace (12 endpoints)
| Method | Path | Auth | Purpose |
|:-------|:-----|:-----|:--------|
| GET | `/api/workspace/members` | JWT | List workspace members |
| POST | `/api/workspace/members/invite` | JWT+Admin | Invite member |
| DELETE | `/api/workspace/members/:id` | JWT+Admin | Remove member |
| GET | `/api/workspace/contacts` | JWT | Get workspace contacts |
| GET | `/api/workspace/billing/overview` | JWT | Billing overview |
| GET | `/api/workspace/billing/payment-methods` | JWT | List payment methods |
| POST | `/api/workspace/billing/payment-methods` | JWT | Add payment method |
| GET | `/api/workspace/billing/invoices` | JWT | List invoices |
| GET | `/api/workspace/data-policies` | JWT | Get data policies |
| PUT | `/api/workspace/data-policies` | JWT | Update data policies |
| GET | `/api/workspace/data-quality/dedupe-queue` | JWT | Get duplicate queue |
| POST | `/api/workspace/data-quality/queue/:id/merge` | JWT | Merge duplicates |

### Admin (8 endpoints)
| Method | Path | Auth | Purpose |
|:-------|:-----|:-----|:--------|
| GET | `/api/admin/incidents` | JWT+SA | List incidents |
| POST | `/api/admin/incidents` | JWT+SA | Create incident |
| POST | `/api/admin/incidents/:id/ack` | JWT+SA | Acknowledge incident |
| POST | `/api/admin/incidents/:id/resolve` | JWT+SA | Resolve incident |
| DELETE | `/api/admin/incidents/:id` | JWT+SA | Delete incident |
| GET | `/api/admin/integrations/health` | JWT+SA | Integration health |
| GET | `/api/admin/integrations/failed-syncs` | JWT+SA | Failed sync jobs |
| POST | `/api/admin/integrations/failed-syncs/:id/retry` | JWT+SA | Retry failed sync |

---

## 12. AUTHENTICATION & RBAC MODEL

### 12.1 Role Hierarchy

```
super_admin (Platform Admin)
    └── Can access ALL routes including /admin/*
    └── Can manage all workspaces, users, AI config, incidents

business_admin (Enterprise Admin)
    └── Can access /workspace/* and /dashboard/*
    └── Can invite/remove members, manage billing, data policies
    └── Can access calendar, email marketing features

user (Personal User)
    └── Can access /dashboard/* only
    └── Scan, contacts, events, drafts, settings, card creator

anonymous (Not Logged In)
    └── Can access /, /sign-in, /sign-up, /api-docs, /public-stats
    └── Can view public profiles at /u/:slug
    └── Can book meetings at /book/:slug
```

### 12.2 Tier-Based Feature Gating

| Feature | personal | pro | enterprise |
|:--------|:---------|:----|:-----------|
| Card Scanning | 10/month | 100/month | Unlimited |
| Calendar | ✗ | ✗ | ✓ |
| Email Marketing | ✗ | ✗ | ✓ |
| Workspace/Team | ✗ | ✗ | ✓ |
| API Sandbox | ✗ | ✓ | ✓ |
| CRM Export | ✗ | ✓ | ✓ |

---

## 13. REAL-TIME & BACKGROUND SYSTEMS

### 13.1 Socket.IO (WebSocket)

```javascript
// Server: Creates HTTP server + Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// Events emitted:
io.emit('contact:new', contactData)     // When card is scanned
io.emit('workspace:chat', messageData)  // Workspace chat messages
io.emit('scan:progress', progressData)  // Batch scan progress
```

### 13.2 Background Cron Jobs

| Job | Schedule | Purpose |
|:----|:---------|:--------|
| Calendar Reminder Checker | Every 5 minutes | Checks `event_reminders` for due reminders → sends email via SMTP |
| Invitation Expiry | Hourly | Marks expired workspace invitations as `status='expired'` |

### 13.3 Environment Variables

```env
# AI
GEMINI_API_KEY=...          # Google Gemini Vision API key
OPENAI_API_KEY=...          # OpenAI fallback API key

# Auth
JWT_SECRET=...              # JWT signing secret

# Email
SMTP_HOST=...               # SMTP server hostname
SMTP_PORT=587               # SMTP port
SMTP_USER=...               # SMTP username
SMTP_PASS=...               # SMTP password
SMTP_FROM=...               # Sender email address
SMTP_FROM_NAME=IntelliScan  # Sender display name

# Server
PORT=5000                   # Express server port
```

---

> **END OF DOCUMENT**  
> This document covers the complete system architecture, file structure, data flow, page interdependencies, and feature inventory for the IntelliScan platform. It is designed to be consumed by LLMs and developers for full project comprehension.
