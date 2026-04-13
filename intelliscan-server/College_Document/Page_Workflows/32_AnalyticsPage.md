# 📊 System Analytics Dashboard

> **Page Route**: `/dashboard/analytics`  
> **Component**: `AnalyticsPage.jsx`  
> **Access Level**: Business Admin / Enterprise

---

## 📖 Overview
The Analytics Dashboard is a real-time business intelligence engine that visualizes the entire scanning operation. It provides deep insights into scan volume trends, industry demographics, seniority distributions, team leaderboards, lead-conversion pipeline stages, and system health logs — all powered by server-side aggregation and AI-inferred metadata.

---

## 🛠️ Technical Workflow

### 1. Data Fetching (`/api/analytics/dashboard`)
- **Authenticated Request**: Sends a `GET` request with `?range=` query param (`7d`, `30d`, `90d`) and `Bearer` token.
- **Server Aggregation**: Backend queries the `contacts`, `scans`, and `system_logs` tables with date-range windowing.
- **Fallback Data**: If the backend returns nothing (e.g. no contacts yet), a hardcoded fallback dataset renders so the UI is never empty.

### 2. Visualization Components
- **Bento Grid Stats**: Total Scans, Avg Confidence, Processing Latency displayed in a responsive CSS grid.
- **SVG Donut Chart**: Industry breakdown rendered via computed `strokeDasharray` and `strokeDashoffset` on SVG `<circle>` elements.
- **Bar Chart**: Month-over-month scan volume with hover tooltips revealing exact counts.
- **Seniority Bars**: Horizontal progress bars for CXO/VP/Senior/Mid/Entry levels.
- **Top Networkers**: Workspace leaderboard showing members ranked by scan count.

### 3. System Health Logs
- **Categorized Logs**: `error`, `success`, `warning`, and `info` severities with distinct color-coded left-border styling.
- **Icon Registry**: A safe `ICON_MAP` prevents React crashes from undefined icon references.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `contacts` table | Database | Source data for industry/seniority inference |
| `system_logs` table | Database | Feeds the System Health widget |
| `Leaderboard` | Component | Shares the same team-ranking data source |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **ROI Measurement** | Quantifies the value of card scanning in terms of pipeline conversion |
| **Team Accountability** | Leaderboard drives competitive engagement among sales reps |
| **Operational Monitoring** | System logs provide early warning of OCR engine issues |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `contacts` | SELECT (aggregate) | Grouped by industry, seniority, and creation date |
| `scans` | SELECT (aggregate) | Counts and confidence scores per time window |
| `system_logs` | SELECT | Latest 10 system events for the health panel |
| `users` | SELECT | Workspace member scan counts for the leaderboard |
