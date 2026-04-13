# 📈 Open Product Analytics (Public)

> **Page Route**: `/public-analytics`  
> **Component**: `PublicAnalyticsPage.jsx`  
> **Access Level**: Public (No authentication required)

---

## 📖 Overview
The Public Analytics page is a transparency-first feature that exposes real-time platform telemetry to the public internet. It shows tracked logins, page views, total clicks, average time-on-page, and the most trafficked internal routes — all without requiring authentication. This builds trust with potential enterprise buyers.

---

## 🛠️ Technical Workflow

### 1. Live Telemetry Fetching
- **API Call**: `GET /api/analytics/stats` (unauthenticated).
- **Auto-Refresh**: `setInterval` at 10-second intervals provides a "live dashboard" feel.
- **Error Handling**: Graceful fallback displays "Server might be offline" if the API is unreachable.

### 2. Metric Cards (`StatCard` Component)
- **Tracked Logins**: Unique authenticated accounts.
- **Page Views**: Total screens loaded across all users.
- **Total Clicks**: Button and link engagement count.
- **Avg Time**: Average time spent per view in seconds.

### 3. Most Trafficked Routes
- **Route Table**: Lists the top internal paths (e.g., `/dashboard/scan`, `/contacts`) ranked by visit count.
- **Empty State**: Encourages navigation to generate telemetry data.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `analytics_events` table | Database | Stores click and page-view telemetry |
| `LandingPage` | Link | Navigation header links back to the public homepage |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Sales Transparency** | Enterprise buyers can verify platform activity before purchasing |
| **Product-Market Fit Signal** | Real usage data validates the product's traction |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `analytics_events` | SELECT (aggregate) | Counts by event type (page_view, click) |
| `users` | SELECT (count) | Unique registered user count |
