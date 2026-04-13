# 📨 Workspace Email Campaigns (Enterprise AI Builder)

> **Page Route**: `/workspace/email-campaigns`  
> **Component**: `EmailCampaignsPage.jsx`  
> **Access Level**: Enterprise Admin

---

## 📖 Overview
The Workspace Email Campaigns page is the enterprise-tier AI-powered campaign builder. Unlike the dashboard-level email marketing, this page features a **Gemini-powered auto-writer** that generates email copy based on AI-inferred industry and seniority demographics, **real-time audience preview** that dynamically counts matching contacts, and **live/simulated send modes** for A/B testing delivery.

---

## 🛠️ Technical Workflow

### 1. AI Campaign Builder
- **Audience Segmentation**: Dropdowns for Target Industry (AI-inferred) and Target Seniority (AI-inferred).
- **Real-Time Audience Preview**: `GET /api/campaigns/audience-preview?targetIndustry=X&targetSeniority=Y` dynamically counts matching contacts as filters change (debounced at 180ms).
- **AI Auto-Writer**: `POST /api/campaigns/auto-write` sends `{ name, targetIndustry, targetSeniority }` to the Gemini engine and receives `{ subject, body }`.

### 2. Campaign Dispatch
- **Send**: `POST /api/campaigns/send` dispatches the campaign to all matching contacts.
- **Dynamic Variables**: Email body supports `{{firstName}}` and `{{company}}` merge tags.
- **Send Modes**: Backend operates in either `smtp` (live delivery) or `sim` (simulated for testing), indicated by badges in the telemetry log.

### 3. Telemetry Log
- **Campaign Database Table**: Lists all sent campaigns with columns for:
  - Campaign details (name, subject, date, send mode)
  - Target Audience (Industry/Seniority badges)
  - Delivered count and failure count
  - Performance metrics (open rate bar + click rate bar)

### 4. Top-Level Metrics
- **Total Emails Sent**: Aggregate across all campaigns.
- **Average Open Rate**: With trend indicator (+/- vs. last period).
- **Active Campaigns**: Count of currently running campaigns.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `contacts` table | Database | AI filters query contacts by `inferred_industry` and `inferred_seniority` |
| `ScanPage` | Source | Contacts must have AI-inferred metadata from scanning |
| `SettingsPage` | Config | SMTP credentials configured in workspace settings |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **AI-Powered Copy Generation** | Zero-effort email content creation from demographic context |
| **Dynamic Audience Sizing** | Real-time feedback on campaign reach before sending |
| **Enterprise-Grade Telemetry** | Per-campaign delivery, open, click, and failure tracking |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `campaigns` | INSERT/SELECT | Creates and lists workspace campaigns |
| `contacts` | SELECT (filtered) | Counts and retrieves contacts matching AI demographics |
| `campaign_recipients` | INSERT | Records each recipient for tracking |
| `email_tracking_events` | INSERT | Logs open and click events via tracking pixels |
