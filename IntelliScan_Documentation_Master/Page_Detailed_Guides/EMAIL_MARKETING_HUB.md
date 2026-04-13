# Deep Dive: Email Marketing & AI Sequences

This module automates the follow-up process, turning a passive contact into an active engagement.

---

## 📄 Overview
-   **Page Path**: `/dashboard/email-marketing`
-   **User Role**: Pro, Enterprise.
-   **Core Backend**: NodeMailer + Background Daemon.

## 🔄 Technical Workflow
1.  **AI Authoring**: When a card is scanned, the AI (Gemini) generates an initial "Thank You" draft.
2.  **Sequence Selection**: Users choose a "Sequence" (e.g., "Conference Follow-up" - 3 emails over 7 days).
3.  **Queueing**: Emails are written to the `campaign_queues` table with a `sent_at` timestamp.
4.  **The Daemon**: A background job (running every hour) checks for due emails and sends them via SMTP.
5.  **Telemetry**: When the recipient opens the email or clicks a link, the `SignalsPage` is updated in real-time.

## 🛠️ Key Components
-   **React Component**: `src/pages/email/CampaignBuilderPage.jsx` - UI for drafting and scheduling.
-   **Template Library**: Pre-built HTML templates for consistent branding.
-   **Signal Tracker**: A backend route that logs tracking-pixel hits.

## 💎 Features
-   **Drip Automation**: Multi-step communication without manual intervention.
-   **Template Variable Injection**: AI automatically inserts the contact's name, company, and inferred industry into the template.
-   **Performance Metrics**: Real-time charts showing Open Rate, Click Rate, and Response Rate.

## 🔗 Dependencies
-   **Depends On**: `SCAN_MODULE`, `ENTERPRISE_PIPELINE`.
-   **Prerequisite For**: `SignalsPage` (Opportunity detection).
