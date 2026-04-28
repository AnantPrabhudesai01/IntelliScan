# IntelliScan — Complete System Documentation
## Presentation Guide | April 2026

---

## 1. Project Overview

**IntelliScan** is an AI-powered business card scanning and contact management SaaS platform. Users photograph business cards, and the system uses **Google Gemini AI** to extract contact data (name, email, phone, company, title) with high accuracy. The platform extends beyond scanning into a full **CRM, Email Marketing, Calendar, Digital Business Card, and Workspace Collaboration** suite.

| Attribute | Value |
|---|---|
| **Production URL** | `https://intelli-scan-psi.vercel.app` |
| **Frontend** | React 19 + Vite 8 + TailwindCSS 3 |
| **Backend** | Node.js 20 + Express 5 |
| **Database** | PostgreSQL (Supabase) — online, SQLite fallback for dev |
| **AI Engine** | Google Gemini 2.5 Flash (primary), OpenRouter multi-model |
| **Auth** | Auth0 (Google SSO) + JWT sessions |
| **Payments** | Razorpay |
| **Hosting** | Vercel (frontend + serverless API) |
| **WhatsApp** | Twilio Sandbox for mobile card sync |

---

## 2. User Roles & Access Matrix

### 2.1 Three User Roles

| Role | Description |
|---|---|
| `user` | Standard registered user. Can scan, manage contacts, use personal features. |
| `business_admin` | Workspace administrator. Can manage teams, CRM, routing rules, shared contacts. |
| `super_admin` | Platform-wide administrator. Full access to system health, AI models, audit logs, incidents. |

### 2.2 Three Subscription Tiers

| Tier | Rank | Description |
|---|---|---|
| `personal` (Free) | 0 | Basic scanning, limited quota (10 scans/month, 1 group scan) |
| `pro` | 1 | Unlocks: Calendar, Digital Card, Coach, Email Marketing, Kiosk, Meeting Tools, Card Creator, Marketplace |
| `enterprise` | 2 | Unlocks: Leaderboard, all workspace features, full batch upload |

### 2.3 Full Access Control Matrix

| Page / Feature | `user` Free | `user` Pro | `business_admin` | `super_admin` |
|---|---|---|---|---|
| Scan (Single Card) | ✅ | ✅ | ✅ | ✅ |
| Scan (Group Photo) | ✅ (1 limit) | ✅ | ✅ | ✅ |
| Scan (Batch Upload) | ✅ | ✅ | ✅ | ✅ |
| Contacts | ✅ | ✅ | ✅ | ✅ |
| Events | ✅ | ✅ | ✅ | ✅ |
| Drafts | ✅ | ✅ | ✅ | ✅ |
| Signals | ✅ | ✅ | ✅ | ✅ |
| Feedback | ✅ | ✅ | ✅ | ❌ |
| Settings | ✅ | ✅ | ✅ | ✅ |
| Billing | ✅ | ✅ | ✅ | ✅ |
| Calendar | 🔒 | ✅ | ✅ | ✅ |
| Digital Card (My Card) | 🔒 | ✅ | ✅ | ✅ |
| Card Creator | 🔒 | ✅ | ✅ | ✅ |
| AI Coach | 🔒 | ✅ | ✅ | ✅ |
| Email Marketing | 🔒 | ✅ | ✅ | ✅ |
| Meeting Presence | 🔒 | ✅ | ✅ | ✅ |
| Event Kiosk | 🔒 | ✅ | ✅ | ✅ |
| Marketplace | 🔒 | ✅ | ✅ | ✅ |
| Leaderboard | 🔒 | 🔒 | ✅ | ✅ |
| Workspace Dashboard | ❌ | ❌ | ✅ | ✅ |
| Workspace Members | ❌ | ❌ | ✅ | ✅ |
| CRM Mapping | ❌ | ❌ | ✅ | ✅ |
| Routing Rules | ❌ | ❌ | ✅ | ✅ |
| Data Policies | ❌ | ❌ | ✅ | ✅ |
| Data Quality | ❌ | ❌ | ✅ | ✅ |
| Pipeline | ❌ | ❌ | ✅ | ✅ |
| Webhooks | ❌ | ❌ | ✅ | ✅ |
| Admin Dashboard | ❌ | ❌ | ❌ | ✅ |
| Engine Performance | ❌ | ❌ | ❌ | ✅ |
| Audit Logs | ❌ | ❌ | ❌ | ✅ |
| Custom Models | ❌ | ❌ | ❌ | ✅ |
| System Incidents | ❌ | ❌ | ❌ | ✅ |
| Job Queues | ❌ | ❌ | ❌ | ✅ |

**Legend:** ✅ = Access | 🔒 = Tier-locked (upgrade required) | ❌ = Role-blocked

---

## 3. All Pages — With Descriptions

### 3.1 Public Pages (No Login Required)

| # | Page | Route | Description |
|---|---|---|---|
| 1 | Landing Page | `/` | Hero page with product pitch, feature highlights, CTA |
| 2 | Sign In | `/sign-in` | Auth0 Google SSO + email/password login |
| 3 | Sign Up | `/sign-up` | New account registration |
| 4 | Forgot Password | `/forgot-password` | Password reset flow |
| 5 | SSO Callback | `/sso-callback` | OAuth redirect handler |
| 6 | Onboarding | `/onboarding` | Post-signup profile setup wizard |
| 7 | Public Profile | `/u/:slug` | Digital business card microsite (public) |
| 8 | Booking Page | `/book/:slug` | Public calendar booking link |
| 9 | Public Stats | `/public-stats` | Platform analytics (public view) |
| 10 | API Docs | `/api-docs` | REST API documentation |
| 11 | About | `/about` | Company info |
| 12 | Product | `/product` | Product overview |
| 13 | Features | `/features` | Feature list |
| 14 | Pricing | `/pricing` | Plan comparison |
| 15 | FAQ | `/faq` | Frequently asked questions |
| 16 | Contact | `/contact` | Support contact form |
| 17 | Clients | `/clients` | Client testimonials |
| 18 | Services | `/services` | Services offered |
| 19 | Privacy | `/privacy` | Privacy policy |
| 20 | Terms | `/terms` | Terms of service |
| 21 | Careers | `/careers` | Job openings |

### 3.2 User Dashboard Pages (Login Required)

| # | Page | Route | Guard | Description |
|---|---|---|---|---|
| 1 | Scan | `/dashboard/scan` | Role | AI card scanner — single, group, batch modes |
| 2 | Contacts | `/dashboard/contacts` | Role | Full contact manager with search, tags, export |
| 3 | Events | `/dashboard/events` | Role | Networking event organizer |
| 4 | Drafts | `/dashboard/drafts` | Role | AI-generated follow-up email drafts |
| 5 | Signals | `/dashboard/signals` | Role | Networking intelligence feed |
| 6 | Calendar | `/dashboard/calendar` | Tier(pro) | Full calendar with event scheduling |
| 7 | Availability | `/dashboard/calendar/availability` | Tier(pro) | Set available time slots |
| 8 | Booking Links | `/dashboard/calendar/booking-links` | Tier(pro) | Shareable scheduling links |
| 9 | My Card | `/dashboard/my-card` | Tier(pro) | Digital business card designer |
| 10 | Card Creator | `/dashboard/card-creator` | Tier(pro) | AI-powered card design studio |
| 11 | Coach | `/dashboard/coach` | Tier(pro) | AI networking coach & insights |
| 12 | Meeting Presence | `/dashboard/presence` | Tier(pro) | Virtual background + QR generator |
| 13 | Event Kiosk | `/dashboard/kiosk` | Tier(pro) | Self-service scanning kiosk mode |
| 14 | Email Marketing | `/dashboard/email-marketing` | Tier(pro) | Campaign dashboard hub |
| 15 | Campaign List | `/dashboard/email-marketing/campaigns` | Tier(pro) | View all campaigns |
| 16 | Campaign Builder | `/dashboard/email-marketing/campaigns/new` | Tier(pro) | Create new campaign |
| 17 | Campaign Detail | `/dashboard/email-marketing/campaigns/:id` | Tier(pro) | Campaign analytics |
| 18 | Template Library | `/dashboard/email-marketing/templates` | Tier(pro) | Email templates |
| 19 | Template Editor | `/dashboard/email-marketing/templates/new` | Tier(pro) | Design email template |
| 20 | Contact Lists | `/dashboard/email-marketing/lists` | Tier(pro) | Manage subscriber lists |
| 21 | List Detail | `/dashboard/email-marketing/lists/:id` | Tier(pro) | View/edit subscriber list |
| 22 | Automations | `/dashboard/email-marketing/automations` | Tier(pro) | Email sequence automations |
| 23 | Sequence Detail | `/dashboard/email-marketing/automations/:id` | Tier(pro) | Edit automation sequence |
| 24 | Feedback | `/dashboard/feedback` | Role | Submit bug reports/suggestions |
| 25 | Settings | `/dashboard/settings` | Role | Profile, security, preferences |
| 26 | Billing | `/dashboard/billing` | Role | Subscription management |
| 27 | Checkout | `/dashboard/checkout/:planId` | Role | Payment processing |
| 28 | Leaderboard | `/dashboard/leaderboard` | Tier(enterprise) | Team performance rankings |
| 29 | Marketplace | `/marketplace` | Tier(pro) | App integrations store |
| 30 | Marketplace Detail | `/marketplace/:appId` | Tier(pro) | Individual app page |
| 31 | WhatsApp Setup | `/setup/whatsapp` | Role | WhatsApp bot configuration guide |

### 3.3 Workspace Admin Pages

| # | Page | Route | Description |
|---|---|---|---|
| 1 | Workspace Dashboard | `/workspace/dashboard` | Team overview & KPIs |
| 2 | Workspace Contacts | `/workspace/contacts` | Shared contact pool |
| 3 | Members | `/workspace/members` | Team member management |
| 4 | Scanner Links | `/workspace/scanner-links` | Branded scan links |
| 5 | CRM Mapping | `/workspace/crm-mapping` | Salesforce/HubSpot field mapping |
| 6 | Routing Rules | `/workspace/routing-rules` | Auto-assign contacts by rules |
| 7 | Data Policies | `/workspace/data-policies` | PII/GDPR compliance settings |
| 8 | Data Quality | `/workspace/data-quality` | Duplicate detection & merge |
| 9 | Analytics | `/workspace/analytics` | Team scan/contact analytics |
| 10 | Org Chart | `/workspace/org-chart` | Organization hierarchy |
| 11 | Email Campaigns | `/workspace/campaigns` | Workspace-level campaigns |
| 12 | Billing | `/workspace/billing` | Workspace billing |
| 13 | Shared Rolodex | `/workspace/shared` | Shared contact book |
| 14 | Pipeline | `/workspace/pipeline` | Deal/sales pipeline (Kanban) |
| 15 | Webhooks | `/workspace/webhooks` | Webhook endpoint management |
| 16 | Settings | `/workspace/settings` | Workspace configuration |

### 3.4 Super Admin Pages

| # | Page | Route | Description |
|---|---|---|---|
| 1 | Admin Dashboard | `/admin/dashboard` | Platform-wide metrics |
| 2 | Engine Performance | `/admin/engine-performance` | AI model latency & accuracy |
| 3 | Audit Logs | `/admin/audit-logs` | Security event timeline |
| 4 | Custom Models | `/admin/custom-models` | AI model management |
| 5 | System Incidents | `/admin/incidents` | Incident tracking & resolution |
| 6 | Job Queues | `/admin/job-queues` | Background task monitor |
| 7 | Integration Health | `/admin/integration-health` | Third-party API status |
| 8 | Feedback (Admin) | `/admin/feedback` | User feedback review |
| 9 | Admin Settings | `/admin/settings` | Platform-wide config |

### 3.5 Auto-Generated Pages (~62 pages)

These are in `src/pages/generated/` and cover advanced features: GDPR center, API explorer, SSO config, whitelabel branding, system health, security monitoring, data export, help center, and more.

---

## 4. Database Schema — 30 Tables

| # | Table | Purpose |
|---|---|---|
| 1 | `users` | User accounts (name, email, role, tier, workspace_id) |
| 2 | `workspaces` | Team/org containers |
| 3 | `contacts` | Scanned business card data |
| 4 | `deals` | Sales pipeline opportunities |
| 5 | `calendars` | User calendar containers |
| 6 | `calendar_events` | Scheduled events |
| 7 | `event_reminders` | Calendar reminders |
| 8 | `notifications` | In-app notifications |
| 9 | `ai_models` | Registered AI models |
| 10 | `workspace_policies` | Data retention/PII rules |
| 11 | `ai_drafts` | AI-generated email drafts |
| 12 | `routing_rules` | Contact auto-assignment rules |
| 13 | `email_sequences` | Automation sequences |
| 14 | `email_sequence_steps` | Individual sequence emails |
| 15 | `contact_sequences` | Contact-to-sequence mapping |
| 16 | `audit_trail` | Security/action audit log |
| 17 | `analytics_logs` | User activity tracking |
| 18 | `events` | Networking events |
| 19 | `user_cards` | Digital business cards |
| 20 | `user_quotas` | Scan usage quotas |
| 21 | `webhooks` | Webhook configurations |
| 22 | `webhook_logs` | Webhook delivery logs |
| 23 | `scanner_links` | Branded scanner URLs |
| 24 | `crm_mappings` | CRM field mappings |
| 25 | `crm_sync_log` | CRM sync history |
| 26 | `billing_orders` | Payment orders (Razorpay) |
| 27 | `billing_invoices` | Generated invoices |
| 28 | `workspace_chats` | Team chat messages |
| 29 | `sessions` | Active login sessions |
| 30 | `otp_codes` | One-time password codes |
| 31 | `data_quality_dedupe_queue` | Duplicate detection queue |
| 32 | `feedbacks` | User feedback/bug reports |
| 33 | `system_incidents` | System incident records |
| 34 | `email_lists` | Marketing subscriber lists |
| 35 | `email_list_contacts` | List subscribers |
| 36 | `email_templates` | Email templates |
| 37 | `email_campaigns` | Marketing campaigns |
| 38 | `email_sends` | Individual email deliveries |
| 39 | `email_clicks` | Click tracking |
| 40 | `workspace_integrations` | Marketplace app installs |
| 41 | `whatsapp_discoveries` | WhatsApp device linking |
| 42 | `coach_insights_cache` | AI coach cache |
# IntelliScan — Part 2: Architecture & Dependencies

---

## 5. Complete Directory Mapping

```
intelliscan/
├── intelliscan-app/                    # FRONTEND (React + Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── public/
│   └── src/
│       ├── main.jsx                    # App entry — Auth0, providers, router
│       ├── App.jsx                     # Route definitions (322 lines)
│       ├── App.css                     # Global animations
│       ├── index.css                   # TailwindCSS + custom design tokens
│       │
│       ├── api/                        # API client helpers
│       ├── assets/                     # Static images
│       ├── data/                       # Static JSON data
│       │
│       ├── context/                    # React Context Providers
│       │   ├── RoleContext.jsx         # Auth role/tier state management
│       │   ├── ContactContext.jsx      # Contact CRUD operations
│       │   ├── BatchQueueContext.jsx   # Batch scan queue manager
│       │   ├── NotificationContext.jsx # In-app notifications
│       │   ├── ThemeContext.jsx        # Dark/light mode
│       │   └── LanguageContext.jsx     # i18n language toggle
│       │
│       ├── hooks/
│       │   └── useDarkMode.jsx         # Dark mode hook
│       │
│       ├── utils/
│       │   ├── auth.js                 # Token storage, JWT decode, route resolver
│       │   ├── calendarUtils.js        # Date formatting helpers
│       │   ├── checkoutService.js      # Razorpay checkout flow
│       │   ├── currency.js             # Currency formatting
│       │   └── socket.js              # Socket.io client
│       │
│       ├── layouts/                    # Page shells with sidebars
│       │   ├── DashboardLayout.jsx     # User dashboard sidebar + nav
│       │   ├── AdminLayout.jsx         # Admin/workspace sidebar + nav
│       │   └── PublicLayout.jsx        # Public page header/footer
│       │
│       ├── components/                 # Reusable UI components
│       │   ├── Auth0Synchronizer.jsx   # Auth0 → backend token sync
│       │   ├── RoleGuard.jsx           # Role-based route protection
│       │   ├── TierGuard.jsx           # Tier-based feature gating
│       │   ├── CommandPalette.jsx      # Ctrl+K command search
│       │   ├── ActivityTracker.jsx     # User activity logging
│       │   ├── ChatbotWidget.jsx       # AI chatbot assistant
│       │   ├── NotificationCenter.jsx  # Bell notification dropdown
│       │   ├── SplashScreen.jsx        # Loading splash screen
│       │   ├── ErrorBoundary.jsx       # React error boundary
│       │   ├── GlobalErrorBoundary.jsx # Top-level crash handler
│       │   ├── DevTools.jsx            # Dev-only debug panel
│       │   ├── LanguageToggle.jsx      # Language switcher
│       │   ├── SignalsCard.jsx         # AI signals widget
│       │   ├── VCardQRModal.jsx        # QR code + vCard modal
│       │   ├── common/
│       │   │   └── ConfirmationModal.jsx
│       │   ├── admin/                  # Admin-specific widgets
│       │   ├── analytics/              # Chart components
│       │   ├── billing/                # Billing UI components
│       │   ├── calendar/               # Calendar widgets
│       │   ├── email/                  # Email builder components
│       │   └── layout/                 # Layout helpers
│       │
│       └── pages/                      # All page components
│           ├── LandingPage.jsx         # Public hero page
│           ├── SignInPage.jsx          # Login page
│           ├── SignUpPage.jsx          # Registration page
│           ├── ForgotPassword.jsx      # Password reset
│           ├── OnboardingPage.jsx      # Post-signup wizard
│           ├── SsoCallback.jsx         # OAuth handler
│           ├── ScanPage.jsx            # AI card scanner (1302 lines)
│           ├── ContactsPage.jsx        # Contact manager (108KB)
│           ├── SettingsPage.jsx        # User settings (75KB)
│           ├── AnalyticsPage.jsx       # Analytics dashboard
│           ├── BillingPage.jsx         # Billing & plans
│           ├── CheckoutPage.jsx        # Payment flow
│           ├── MarketplacePage.jsx     # App marketplace
│           ├── MarketplaceDetailPage.jsx
│           ├── FeedbackPage.jsx        # Bug report form
│           ├── CardCreatorPage.jsx     # AI card designer
│           ├── AdminDashboard.jsx      # Admin overview
│           ├── EnginePerformance.jsx   # AI health monitor
│           ├── AiTrainingTuningSuperAdmin.jsx
│           ├── AdvancedApiExplorerSandbox.jsx
│           ├── SuperAdminFeedbackPage.jsx
│           ├── MembersPage.jsx         # Team members
│           ├── ScannerLinksPage.jsx    # Branded links
│           ├── OrgChartPage.jsx        # Org hierarchy
│           ├── WorkspaceDashboard.jsx  # Workspace home
│           ├── WorkspaceContacts.jsx   # Shared contacts
│           ├── SetupGuidePage.jsx      # WhatsApp setup
│           ├── PublicAnalyticsPage.jsx # Public stats
│           ├── ApiDocsPage.jsx         # API documentation
│           │
│           ├── dashboard/              # Dashboard sub-pages
│           │   ├── EventsPage.jsx
│           │   ├── DraftsPage.jsx
│           │   ├── MyCardPage.jsx
│           │   ├── CoachPage.jsx
│           │   ├── KioskMode.jsx
│           │   ├── MeetingToolsPage.jsx
│           │   ├── SignalsPage.jsx
│           │   └── Leaderboard.jsx
│           │
│           ├── email/                  # Email Marketing module
│           │   ├── EmailMarketingPage.jsx
│           │   ├── CampaignListPage.jsx
│           │   ├── CampaignBuilderPage.jsx
│           │   ├── CampaignDetailPage.jsx
│           │   ├── TemplateLibraryPage.jsx
│           │   ├── TemplateEditorPage.jsx
│           │   ├── ContactListsPage.jsx
│           │   ├── ListDetailPage.jsx
│           │   ├── EmailSequencesPage.jsx
│           │   └── SequenceDetailPage.jsx
│           │
│           ├── calendar/               # Calendar module
│           │   ├── CalendarPage.jsx
│           │   ├── AvailabilityPage.jsx
│           │   ├── BookingLinksPage.jsx
│           │   └── BookingPage.jsx
│           │
│           ├── workspace/              # Workspace admin module
│           │   ├── CrmMappingPage.jsx
│           │   ├── RoutingRulesPage.jsx
│           │   ├── DataPoliciesPage.jsx
│           │   ├── DataQualityCenterPage.jsx
│           │   ├── PipelinePage.jsx
│           │   ├── SharedRolodexPage.jsx
│           │   ├── EmailCampaignsPage.jsx
│           │   └── WebhookManagement.jsx
│           │
│           ├── admin/                  # Super admin module
│           │   ├── AuditTimelinePage.jsx
│           │   ├── CustomModelsPage.jsx
│           │   ├── JobQueuesPage.jsx
│           │   └── SystemIncidentCenter.jsx
│           │
│           ├── public/                 # Marketing pages
│           │   ├── AboutPage.jsx
│           │   ├── PricingPage.jsx
│           │   ├── FeaturesPage.jsx
│           │   ├── ProductPage.jsx
│           │   ├── FaqPage.jsx
│           │   ├── ContactPage.jsx
│           │   ├── ClientsPage.jsx
│           │   ├── ServicesPage.jsx
│           │   ├── CareersPage.jsx
│           │   ├── PrivacyPage.jsx
│           │   └── TermsPage.jsx
│           │
│           └── generated/              # 62 auto-generated pages
│               ├── routes.json
│               ├── PublicProfile.jsx
│               ├── GenSubscriptionPlanComparison.jsx
│               ├── GenSystemHealthSuperAdmin.jsx
│               ├── GenPrivacyGdprCommandCenter.jsx
│               ├── GenHelpCenterDocs.jsx
│               └── ... (58 more)
│
├── intelliscan-server/                 # BACKEND (Node.js + Express)
│   ├── package.json
│   └── src/
│       ├── server.js                   # HTTP server entry
│       ├── app.js                      # Express app, route mounting
│       ├── boot.js                     # Database schema migration (634 lines)
│       ├── diag.js                     # Diagnostic utilities
│       │
│       ├── config/
│       │   ├── constants.js            # JWT secret, admin emails, tier config
│       │   ├── passport.js             # Google OAuth strategy
│       │   └── prompts.js              # AI prompt templates (29KB)
│       │
│       ├── middleware/
│       │   ├── auth.js                 # JWT verification middleware
│       │   └── validate.js             # Request validation (Zod)
│       │
│       ├── controllers/                # Business logic (18 controllers)
│       │   ├── scanController.js       # AI card extraction logic
│       │   ├── contactsController.js   # CRUD + export + merge (38KB)
│       │   ├── adminController.js      # Admin dashboard data
│       │   ├── cardsController.js      # Digital card management
│       │   ├── cardController.js       # Card design + AI generation
│       │   ├── publicController.js     # Public profile resolution
│       │   ├── analyticsController.js  # Stats aggregation
│       │   ├── billingController.js    # Razorpay orders + tier upgrade
│       │   ├── calendarController.js   # Calendar CRUD
│       │   ├── marketingController.js  # Email campaigns (26KB)
│       │   ├── crmController.js        # CRM sync logic
│       │   ├── dealsController.js      # Deal pipeline CRUD
│       │   ├── aiController.js         # AI chatbot + text generation
│       │   ├── whatsappController.js   # Twilio WhatsApp handler (24KB)
│       │   ├── scannerLinksController.js
│       │   ├── searchController.js     # Global search
│       │   ├── webhookController.js    # Webhook dispatch
│       │   └── integrationsController.js
│       │
│       ├── routes/                     # Express routers (33 files)
│       │   ├── auth.js                 # /api/auth/* (login, signup, sync, me)
│       │   ├── scan.js                 # /api/scan
│       │   ├── contacts.js             # /api/contacts/*
│       │   ├── cards.js                # /api/cards/*
│       │   ├── user.js                 # /api/user/*
│       │   ├── billing.js              # /api/billing/*
│       │   ├── calendar.js             # /api/calendar/*
│       │   ├── marketing.js            # /api/email/*, /api/marketing/*
│       │   ├── admin.js                # /api/admin/*
│       │   ├── adminAudit.js           # /api/admin/audit/*
│       │   ├── analytics.js            # /api/analytics/*
│       │   ├── events.js               # /api/events/*
│       │   ├── drafts.js               # /api/drafts/*
│       │   ├── crm.js                  # /api/crm/*
│       │   ├── deals.js                # /api/deals/*
│       │   ├── webhooks.js             # /api/webhooks/*
│       │   ├── whatsapp.js             # /api/whatsapp/*
│       │   ├── coach.js                # /api/coach/*
│       │   ├── public.js               # /api/public/*
│       │   ├── system.js               # /api/system/*
│       │   ├── notifications.js        # /api/notifications/*
│       │   ├── workspaceRoutes.js      # /api/workspace/*
│       │   ├── routingRules.js         # /api/routing-rules/*
│       │   ├── incidents.js            # /api/incidents/*
│       │   ├── models.js               # /api/models/*
│       │   ├── feedbacks.js            # /api/feedbacks/*
│       │   ├── integrations.js         # /api/integrations/*
│       │   ├── chats.js                # /api/chats/*
│       │   ├── cron.js                 # /api/cron/* (scheduled tasks)
│       │   ├── search.js               # /api/search/*
│       │   └── scannerLinks.js         # /api/scanner-links/*
│       │
│       ├── services/                   # External integrations
│       │   ├── aiService.js            # Gemini + OpenRouter AI (30KB)
│       │   ├── emailService.js         # Nodemailer SMTP
│       │   ├── whatsappService.js      # Twilio WhatsApp
│       │   ├── crmService.js           # CRM API connector
│       │   ├── webhookService.js       # Webhook dispatcher
│       │   ├── notificationService.js  # Push notification service
│       │   └── imageService.js         # Image processing
│       │
│       ├── utils/                      # Shared utilities (18 files)
│       │   ├── db.js                   # Database connector (SQLite/Postgres)
│       │   ├── quota.js                # Scan quota enforcement
│       │   ├── scanUtils.js            # OCR pre-processing
│       │   ├── contactUtils.js         # Contact validation
│       │   ├── dedupeUtils.js          # Duplicate detection
│       │   ├── billingUtils.js         # Plan pricing logic
│       │   ├── crmUtils.js             # CRM field normalization
│       │   ├── calendarUtils.js        # Calendar helpers
│       │   ├── campaignUtils.js        # Campaign scheduling
│       │   ├── policyUtils.js          # GDPR compliance
│       │   ├── aiUtils.js              # AI response parsing
│       │   ├── smtp.js                 # SMTP transport config
│       │   ├── imageUpload.js          # ImgBB upload
│       │   ├── workspaceUtils.js       # Workspace helpers
│       │   ├── adminSeeder.js          # Default admin user seed
│       │   ├── incidentLogger.js       # Incident auto-logging
│       │   ├── logger.js               # Structured logger
│       │   └── auth.js                 # Password hashing
│       │
│       ├── schemas/
│       │   ├── contactSchema.js        # Zod contact validation
│       │   └── scanSchema.js           # Zod scan validation
│       │
│       └── workers/
│           └── tesseract_ocr_worker.js # OCR fallback worker
│
├── vercel.json                         # Vercel deployment config
├── package.json                        # Root monorepo config
└── database.sqlite                     # Local dev database
```

---

## 6. Page Dependency Graph

### 6.1 Frontend Provider Hierarchy

```
BrowserRouter
└── LanguageProvider
    └── Auth0Provider
        └── RoleProvider
            └── Auth0Synchronizer
                └── ContactProvider
                    └── BatchQueueProvider
                        └── GlobalErrorBoundary
                            └── App (ThemeProvider + NotificationProvider)
                                └── Routes
```

### 6.2 Layout Dependencies

| Layout | Sidebar | Pages Inside |
|---|---|---|
| `DashboardLayout` | User sidebar (Scan, Contacts, etc.) | All `/dashboard/*`, `/marketplace/*` routes |
| `AdminLayout` (business_admin) | Workspace sidebar | All `/workspace/*` routes |
| `AdminLayout` (super_admin) | Admin sidebar | All `/admin/*` routes |
| No layout | Standalone | Public pages, Sign In, Public Profile |

### 6.3 Page → Backend API Dependencies

| Frontend Page | Backend APIs Consumed |
|---|---|
| **ScanPage** | `POST /api/scan`, `POST /api/scan-multi`, `GET /api/user/quota`, `GET /api/events`, `GET /api/access/me`, `GET /api/contacts`, `POST /api/contacts`, `GET /api/contacts/mutual` |
| **ContactsPage** | `GET /api/contacts`, `POST /api/contacts`, `PUT /api/contacts/:id`, `DELETE /api/contacts/:id`, `GET /api/events` |
| **CalendarPage** | `GET /api/calendar/calendars`, `GET /api/calendar/events`, `POST /api/calendar/events`, `PUT /api/calendar/events/:id` |
| **MyCardPage** | `GET /api/my-card`, `POST /api/cards/save`, `POST /api/cards/generate-design`, `POST /api/cards/generate-logo` |
| **MeetingToolsPage** | Uses `safeReadStoredUser()` for profile slug, QR code API |
| **PublicProfile** | `GET /api/public/profile/:slug` |
| **DraftsPage** | `GET /api/drafts`, `POST /api/drafts`, `PUT /api/drafts/:id`, `POST /api/drafts/:id/send` |
| **CoachPage** | `GET /api/coach/insights` |
| **EventsPage** | `GET /api/events`, `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id` |
| **BillingPage** | `GET /api/billing/status`, `POST /api/billing/create-order`, `POST /api/billing/verify` |
| **SettingsPage** | `GET /api/auth/me`, `PUT /api/user/profile`, `GET /api/user/sessions`, `DELETE /api/user/sessions/:id` |
| **EmailMarketingPage** | `GET /api/marketing/campaigns`, `GET /api/marketing/stats` |
| **AdminDashboard** | `GET /api/admin/dashboard` |
| **AuditTimelinePage** | `GET /api/admin/audit/audit-timeline`, `GET /api/admin/audit/security-pulse` |
| **EnginePerformance** | `GET /api/models`, `GET /api/admin/ai-health` |
| **CrmMappingPage** | `GET /api/crm/mappings`, `POST /api/crm/mappings`, `POST /api/crm/sync` |

### 6.4 Cross-Page Navigation Dependencies

| From Page | Navigates To | Trigger |
|---|---|---|
| ScanPage → ContactsPage | After saving scanned contact | "Save" button |
| ScanPage → ScanPage (Group) | Multi-card detected in single mode | "Switch to Group" banner |
| ContactsPage → DraftsPage | Generate follow-up email | "Draft Email" button |
| MyCardPage → PublicProfile | Preview live card | "Preview" link |
| MeetingToolsPage → PublicProfile | View digital profile | "Digital Profile" button |
| BillingPage → CheckoutPage | Start payment | Plan selection |
| LandingPage → SignInPage | CTA click | "Get Started" |
| SignInPage → Dashboard | Auth success | Auto-redirect |
| DashboardLayout → Any page | Sidebar navigation | Sidebar links |
| TierGuard → BillingPage | Feature locked | "View Plans" button |
| RoleGuard → SignInPage | Not authenticated | Auto-redirect |

---

## 7. Technology Stack Detail

### Frontend Dependencies
| Package | Purpose |
|---|---|
| `react` 19 | UI framework |
| `react-router-dom` 7 | Client-side routing |
| `@auth0/auth0-react` | Google SSO authentication |
| `axios` | HTTP client |
| `tailwindcss` 3 | Utility-first CSS |
| `lucide-react` | Icon library |
| `recharts` | Data visualization charts |
| `react-hot-toast` | Toast notifications |
| `xlsx` | Excel export |
| `qrcode.react` | QR code generation |
| `html-to-image` | Screenshot/export utility |
| `date-fns` | Date manipulation |
| `@dnd-kit/*` | Drag and drop (Pipeline) |
| `socket.io-client` | Real-time communication |

### Backend Dependencies
| Package | Purpose |
|---|---|
| `express` 5 | HTTP framework |
| `pg` | PostgreSQL driver (Supabase) |
| `jsonwebtoken` | JWT auth tokens |
| `@google/generative-ai` | Gemini AI SDK |
| `openai` | OpenRouter multi-model AI |
| `bcryptjs` | Password hashing |
| `nodemailer` | SMTP email sending |
| `twilio` | WhatsApp integration |
| `razorpay` | Payment processing |
| `tesseract.js` | OCR fallback engine |
| `helmet` | Security headers |
| `express-rate-limit` | API rate limiting |
| `zod` | Request validation |
| `multer` | File upload handling |
| `passport` | OAuth strategies |
# IntelliScan — Part 3: Presentation Questions & System Flows

---

## 8. Anticipated Presentation / Viva Questions

### 8.1 Architecture & Design (15 Questions)

| # | Question | Key Answer Points |
|---|---|---|
| 1 | What is the overall architecture of IntelliScan? | Monorepo with React SPA frontend + Node.js REST API backend. Deployed on Vercel (serverless). PostgreSQL on Supabase. |
| 2 | Why did you choose a monorepo structure? | Shared deployment config (`vercel.json`), unified Git history, easier cross-project refactoring. |
| 3 | How does the frontend communicate with the backend? | RESTful API calls via `fetch`/`axios`. JWT Bearer tokens in `Authorization` header. |
| 4 | What is the role of `boot.js`? | Self-healing schema migration system. Creates 42 tables, patches missing columns, seeds default AI models on every cold start. |
| 5 | Why Express 5 instead of Express 4? | Native async/await error handling, better TypeScript support, modern routing. |
| 6 | How do you handle serverless cold starts? | `boot.js` runs as a global promise on module load. Health/public routes bypass the boot wait. 5-second timeout fallback. |
| 7 | What design patterns are used? | Provider pattern (React Context), Guard pattern (RoleGuard/TierGuard), Controller-Service-Route pattern (backend), Middleware chain. |
| 8 | How is the sidebar navigation implemented? | `DashboardLayout.jsx` and `AdminLayout.jsx` render sidebar nav items. Items are filtered by role and tier. |
| 9 | What is the Provider hierarchy? | Auth0Provider → RoleProvider → Auth0Synchronizer → ContactProvider → BatchQueueProvider → App |
| 10 | How does routing work? | React Router v7 with nested `<Route>` elements. Three layout groups: Dashboard, Workspace Admin, Super Admin. |
| 11 | What are "generated pages"? | 62 auto-scaffolded JSX pages in `/pages/generated/` for advanced features. Loaded via `import.meta.glob`. |
| 12 | How do you handle errors globally? | `GlobalErrorBoundary` (React), `process.on('uncaughtException')` (Node), centralized Express error middleware. |
| 13 | What is the CommandPalette? | A Ctrl+K keyboard shortcut that opens a fuzzy search across all pages and actions. |
| 14 | How is real-time communication handled? | Socket.io for workspace chat. Polling for notifications and quota updates. |
| 15 | What is the ActivityTracker component? | Logs user page views and actions to `/api/analytics/activity` for usage analytics. |

### 8.2 AI & Machine Learning (10 Questions)

| # | Question | Key Answer Points |
|---|---|---|
| 1 | Which AI model powers the card scanning? | Google Gemini 2.5 Flash via `@google/generative-ai` SDK. Multimodal — accepts images directly. |
| 2 | How does the OCR pipeline work? | Image → compress to 3200px JPEG → send base64 to `/api/scan` → Gemini extracts structured JSON (name, email, phone, company, title). |
| 3 | What is the multi-card (group photo) feature? | `/api/scan-multi` sends one image with multiple cards. Gemini extracts an array of contacts. Uses specialized prompt in `prompts.js`. |
| 4 | What is the AI confidence score? | Gemini returns a confidence percentage (0-100) for each extraction. Default is 95. Shown in contact details. |
| 5 | How do you handle AI failures? | Multi-chance retry (up to 5 attempts). Tesseract.js OCR fallback worker. Graceful error messages to user. |
| 6 | What AI models are registered in the system? | Nvidia Nemotron 340B, Gemini 3 Flash, GPT-4o Mini, Claude 3.5 Sonnet, Llama 3 70B — tracked in `ai_models` table. |
| 7 | How does the AI Coach work? | Analyzes user's contact network patterns, generates networking insights and follow-up suggestions. Cached in `coach_insights_cache`. |
| 8 | How does AI-powered email drafting work? | User selects a contact → AI generates personalized follow-up email with adjustable tone (professional, casual, sales). |
| 9 | How does the AI card design generator work? | User provides name/title/company/vibe → Gemini generates a color palette, layout style, headline, and bio as JSON. |
| 10 | What is the "enrichment" feature? | If AI detects a scanned card matches the logged-in user (self-scan), it offers to sync extracted data back to their profile. |

### 8.3 Security & Authentication (10 Questions)

| # | Question | Key Answer Points |
|---|---|---|
| 1 | How does authentication work? | Auth0 for Google SSO. Backend issues custom JWT on `/api/auth/sync`. Token stored in localStorage. |
| 2 | What is Auth0Synchronizer? | React component that bridges Auth0 session → backend JWT. Runs on every page load. Provisions user in DB if new. |
| 3 | How are roles enforced? | `RoleGuard` component checks JWT role claim against allowed roles. `super_admin` bypasses all guards. |
| 4 | How are tiers enforced? | `TierGuard` checks tier rank (personal=0, pro=1, enterprise=2). Shows upgrade prompt if insufficient. |
| 5 | What prevents unauthorized API access? | `authenticateToken` middleware verifies JWT on every protected route. Returns 401/403 on failure. |
| 6 | How is the admin whitelist managed? | `ADMIN_EMAILS` environment variable (comma-separated). Checked during `/api/auth/sync` for auto-promotion to `super_admin`. |
| 7 | What is the audit trail? | Every significant action (login, scan, delete, export) is logged in `audit_trail` table with actor, IP, user-agent, timestamp. |
| 8 | How are passwords stored? | Bcrypt hashing via `bcryptjs`. Salted with 10 rounds. |
| 9 | What security middleware is used? | Helmet (security headers), CORS (origin validation), express-rate-limit (1000 req/15min), trust proxy. |
| 10 | What is the "Unstoppable Logout Protocol"? | `signOut()` clears localStorage, sessionStorage, cookies, sets severance key, and forces `window.location.replace('/')`. |

### 8.4 Database (8 Questions)

| # | Question | Key Answer Points |
|---|---|---|
| 1 | Which database do you use? | PostgreSQL hosted on Supabase (production). SQLite for local development. `db.js` abstracts both. |
| 2 | How many tables are there? | 42 tables covering users, contacts, calendars, billing, CRM, email marketing, audit, and more. |
| 3 | How do schema migrations work? | `boot.js` runs `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ADD COLUMN` patches on every server start. Self-healing. |
| 4 | How is data integrity maintained? | Foreign key constraints, unique constraints, NOT NULL checks, default values. Self-healing queries in boot. |
| 5 | How do you handle soft deletes? | `contacts` table has `is_deleted` boolean and `deleted_at` timestamp. Queries filter `WHERE is_deleted = false`. |
| 6 | What indexes exist? | `idx_contacts_user_id`, `idx_contacts_is_deleted`, `idx_audit_created_at`, `idx_contacts_email`. |
| 7 | How is the user quota system implemented? | `user_quotas` table tracks `used_count` vs `limit_amount`. Checked before every scan. Reset monthly. |
| 8 | How does the dual-database abstraction work? | `db.js` exports `dbGetAsync`, `dbAllAsync`, `dbRunAsync` — same interface for both SQLite and Postgres. `isPostgres` flag for SQL dialect differences. |

### 8.5 Frontend & UX (8 Questions)

| # | Question | Key Answer Points |
|---|---|---|
| 1 | What CSS framework do you use? | TailwindCSS 3 with custom design tokens (brand colors, shadows, fonts). Dark mode via `dark:` prefix. |
| 2 | How does dark mode work? | `ThemeContext` + `useDarkMode` hook. Toggles `dark` class on `<html>`. Persisted in localStorage. |
| 3 | How does the scan upload work? | File input → image compressed to 3200px JPEG (canvas) → base64 → POST to backend → results rendered. |
| 4 | How do you handle large contact lists? | Virtual scrolling, pagination, search/filter. Export to Excel (xlsx library). |
| 5 | What is the Kiosk Mode? | Full-screen self-service scanning mode for events. Attendees scan their cards without logging in. |
| 6 | How does the email template editor work? | Rich text editor with variable interpolation (`{{first_name}}`). Preview pane. Save as reusable templates. |
| 7 | What is the Pipeline page? | Kanban-style deal pipeline using `@dnd-kit` drag-and-drop. Stages: Prospect → Qualified → Proposal → Won/Lost. |
| 8 | How does the QR code system work? | `qrcode.react` generates QR codes pointing to `/u/:slug`. Used in Meeting Presence and Digital Card. |

### 8.6 Business Logic (8 Questions)

| # | Question | Key Answer Points |
|---|---|---|
| 1 | How does the billing system work? | Razorpay integration. Create order → user pays → verify signature → upgrade tier in DB → refresh JWT. |
| 2 | What is the CRM mapping feature? | Maps IntelliScan contact fields to Salesforce/HubSpot/Zoho fields. Auto-sync on new scans. |
| 3 | How do routing rules work? | Condition-based auto-assignment: "If company contains 'Google' → assign to Sales Team A". Evaluated on contact save. |
| 4 | How does duplicate detection work? | `dedupeUtils.js` computes fingerprints from name+email+phone. Fuzzy matching. Merge queue in `data_quality_dedupe_queue`. |
| 5 | How does the WhatsApp integration work? | Twilio Sandbox. Users send a discovery code via WhatsApp → system links their phone → they can scan cards by sending photos. |
| 6 | What is the Digital Business Card? | User designs a card (AI or manual) → saved in `user_cards` → accessible at `/u/:slug`. vCard download, QR code, share links. |
| 7 | How does the email marketing module work? | Create campaigns → select lists → compose email → schedule/send → track opens/clicks/bounces via tracking pixels. |
| 8 | What is the booking system? | Users set availability → generate booking links → public visitors can book time slots → creates calendar events. |

### 8.7 DevOps & Deployment (5 Questions)

| # | Question | Key Answer Points |
|---|---|---|
| 1 | How is the app deployed? | Vercel. Frontend: static build. Backend: serverless functions via `vercel.json` rewrites. |
| 2 | How do environment variables work? | `.env` for local dev. Vercel Environment Variables for production. `ADMIN_EMAILS`, `JWT_SECRET`, `DATABASE_URL`, API keys. |
| 3 | What is the health check system? | `/api/health` → `/api/system/health` returns uptime, DB status, boot status, memory usage. |
| 4 | How is rate limiting implemented? | `express-rate-limit`: 1000 requests per 15 minutes per IP on all `/api/*` routes. |
| 5 | How do you handle production errors? | `process.on('uncaughtException')` + `process.on('unhandledRejection')` for crash recovery. `system_incidents` table for logging. |

### 8.8 Advanced / Edge Cases (6 Questions)

| # | Question | Key Answer Points |
|---|---|---|
| 1 | What happens if the AI fails to extract data? | Toast error message. User can retry with a clearer photo. Tesseract OCR fallback available. |
| 2 | How do you handle multi-language business cards? | Gemini is multilingual. `contacts` table has `name_native`, `company_native`, `title_native` for non-Latin scripts. |
| 3 | What is the "Flash-Kick" problem? | When RoleGuard redirects before JWT is decoded. Solved by `tryDecodeJwtPayload()` for instant local role check. |
| 4 | How do you prevent scan quota abuse? | Server-side enforcement in `quota.js`. Client-side display only. Quota resets monthly via `last_reset_date`. |
| 5 | What is the self-healing database? | `boot.js` re-creates missing tables and columns on every server start. Handles Vercel ephemeral filesystem. |
| 6 | How does the image compression work? | Canvas API: resize to max 3200px width, JPEG quality 0.80. Preserves OCR legibility while reducing payload. |

---

## 9. Key System Flows

### 9.1 Card Scanning Flow
```
User uploads image
  → Frontend compresses (3200px, 80% JPEG)
  → POST /api/scan with base64
  → Backend checks quota
  → Sends to Gemini AI with extraction prompt
  → Gemini returns structured JSON
  → Backend validates fields
  → Returns to frontend
  → User reviews & edits
  → User clicks Save
  → POST /api/contacts
  → Stored in database
  → Quota incremented
```

### 9.2 Authentication Flow
```
User clicks "Sign in with Google"
  → Auth0 redirects to Google
  → Google authenticates
  → Auth0 returns to app
  → Auth0Synchronizer fires
  → POST /api/auth/sync with Auth0 user data
  → Backend creates/updates user in DB
  → Backend checks admin whitelist for promotion
  → Backend provisions digital card if missing
  → Returns JWT token
  → Frontend stores token in localStorage
  → RoleContext refreshes from /api/auth/me
  → Dashboard renders with correct permissions
```

### 9.3 Payment Flow
```
User selects plan on Billing page
  → Navigate to /dashboard/checkout/:planId
  → POST /api/billing/create-order
  → Backend creates Razorpay order
  → Frontend opens Razorpay checkout modal
  → User completes payment
  → POST /api/billing/verify with payment details
  → Backend verifies Razorpay signature
  → Updates user tier in DB
  → Returns new JWT with updated tier
  → Frontend refreshes RoleContext
  → Pro/Enterprise features unlock immediately
```

---

## 10. Key Metrics

| Metric | Value |
|---|---|
| Total Frontend Files | ~130+ JSX components |
| Total Backend Files | ~75+ JS files |
| Total Pages | ~100+ (31 dashboard + 16 workspace + 9 admin + 21 public + 62 generated) |
| Database Tables | 42 |
| API Endpoints | ~80+ REST endpoints |
| Lines of Code (estimated) | ~50,000+ |
| AI Models Registered | 5 (Gemini, GPT-4o, Claude, Nemotron, Llama) |
| External Integrations | Auth0, Supabase, Razorpay, Twilio, Google Gemini, OpenRouter, ImgBB |
