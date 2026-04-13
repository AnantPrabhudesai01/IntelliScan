# 📧 Email Marketing Hub (Dashboard)

> **Page Route**: `/dashboard/email-marketing`  
> **Component**: `EmailMarketingPage.jsx`  
> **Access Level**: Business Admin / Enterprise

---

## 📖 Overview
The Email Marketing Hub is the primary overview dashboard for IntelliScan's email marketing engine. It displays aggregate campaign metrics, recent campaign activity with engagement bars, quick-access navigation to templates, automations, and lists, and AI-recommended optimal send times.

---

## 🛠️ Technical Workflow

### 1. Analytics Overview (`/api/email/analytics/overview`)
- **Metrics**: Total Campaigns, Total Emailed, Average Open Rate, Conversion Rate.
- **Component**: Uses `CampaignStatsCard` for consistent card design.

### 2. Recent Campaigns Table (`/api/email/campaigns`)
- Fetches the 5 most recent campaigns and displays them with:
  - Campaign name and subject line
  - **Dual-layer engagement bar**: Green segment = open rate, blue segment = click rate
  - Status badge (Active/Paused/Completed)
  - Creation timestamp
- **Navigation**: Click → `CampaignDetailPage` for full analytics.

### 3. Quick Actions Panel ("Intelligent Core")
- **Template Engine**: Link to `TemplateLibraryPage`
- **Drip Automations**: Link to sequence automations
- **AI Copywriter**: One-click launch of the campaign builder with AI mode pre-enabled.

### 4. AI Send Time Optimization
- **Recommendation**: Displays the suggested optimal send time (e.g., "Tuesday, 10:00 AM") based on historical open rate data.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `CampaignListPage` | Link | "View All" navigates to the full campaign list |
| `CampaignBuilderPage` | Link | "New Campaign" creates a new campaign |
| `ContactListsPage` | Link | "Manage Lists" navigates to audience segments |
| `TemplateLibraryPage` | Link | Template engine quick-access |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Marketing Overview** | Single-screen visibility into all email marketing activity |
| **AI Optimization** | Recommended send times improve open rates |
| **Quick Navigation** | Hub-and-spoke architecture enables fast access to sub-features |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `email_campaigns` | SELECT (aggregate + top 5) | Fetches campaign stats and recent activity |
| `email_tracking_events` | SELECT (aggregate) | Computes total opens/clicks for overview metrics |
