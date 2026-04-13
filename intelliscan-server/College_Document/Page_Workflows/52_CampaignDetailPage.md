# 📊 Campaign Detail & Intelligence View

> **Page Route**: `/dashboard/email-marketing/campaigns/:id`  
> **Component**: `CampaignDetailPage.jsx`  
> **Access Level**: Business Admin / Enterprise

---

## 📖 Overview
The Campaign Detail page is the post-send analytics command center for individual email campaigns. It provides real-time engagement metrics (reach, open rate, click-through, bounce), a time-series engagement chart, and a per-recipient interaction log showing exactly who opened, clicked, and when.

---

## 🛠️ Technical Workflow

### 1. Campaign Data Fetch (`/api/email/campaigns/:id`)
- **Authenticated GET**: Returns three data segments: `campaign` (metadata), `analytics` (aggregate metrics), and `recent_activity` (per-recipient log).

### 2. Analytics Grid (`CampaignStatsCard` Component)
| Metric | Source |
|---|---|
| Total Reach | `analytics.total` |
| Open Rate | `(analytics.opened / analytics.total) * 100` |
| Click-Thru Rate | `(analytics.clicked / analytics.total) * 100` |
| Bounce Rate | `(analytics.bounced / analytics.total) * 100` |

### 3. Engagement Visualization
- **Open Velocity Bar**: `OpenRateBar` component shows a horizontal progress bar.
- **Transmission Sequence Chart**: A 24-hour bar chart (20 CSS bars) showing send distribution over time.
- **Engagement Strength Score**: A composite 0–10 score comparing this campaign's performance against historical averages.

### 4. Interaction Log Table
- **Per-Recipient Tracking**: Shows each email recipient with their status (sent/failed), open count, click count, and timestamp.
- **Filterable**: Search box filters the activity log in real-time.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `CampaignListPage` | Navigation | "Back to Missions" links to the campaign list |
| `CampaignStatsCard` | Component | Shared stat card design system component |
| `EmailStatusBadge` | Component | Status indicator (Active/Paused/Completed) |
| `OpenRateBar` | Component | Engagement progress bar |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Per-Recipient Intelligence** | See exactly who engaged with each campaign |
| **Performance Benchmarking** | Engagement strength compares against historical averages |
| **Follow-Up Scheduling** | "Schedule Follow-up" button triggers a new campaign targeting engaged recipients |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `email_campaigns` | SELECT | Fetches campaign metadata |
| `email_campaign_recipients` | SELECT | Per-recipient engagement data |
| `email_tracking_events` | SELECT | Open and click event timestamps |
