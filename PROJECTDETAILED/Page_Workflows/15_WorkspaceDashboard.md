# 🏢 Workspace Dashboard (Enterprise Analytics)

> **Route**: `/workspace`  
> **Component**: `WorkspaceDashboard.jsx` (218 lines)  
> **Access**: `business_admin`, `super_admin` (Enterprise tier)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Workspace Dashboard is the **nerve center for enterprise teams**. It gives business admins a bird's-eye view of their team's networking activity — total scans, average confidence, active members, and leads generated — all in real-time. It also shows a live scan volume chart and an activity feed of recent scans by team members.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `data` | `object` | Full workspace analytics payload (stats, charts, activity feed) |
| `loading` | `boolean` | Initial loading state |
| `refreshing` | `boolean` | Manual refresh indicator |

### Key Functions
1. **`fetchData(showRefresh)`**: Loads analytics from `GET /api/workspace/analytics`.
2. **Stat Cards**: Renders 4 KPI cards (Total Scans, Avg Confidence, Active Members, Leads Generated).
3. **Bar Chart**: Renders a 30-day scan volume histogram from `data.scan_by_day`.
4. **Engine Breakdown**: Shows the % usage of each OCR model (e.g., Gemini 1.5 vs 2.5).
5. **Activity Feed**: Live table of the most recent scans with contact name, company, scanner, confidence, and time.

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/workspace/analytics` | Full workspace metrics + activity feed |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Common shell |
| `auth.js` | Utility | JWT management |
| `ScanPage` | Data | All scan data feeds the analytics |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `WorkspaceContacts` | "View All" navigates to workspace contacts |
| `AnalyticsPage` | "View Full Analytics" links here |
| `Leaderboard` | Scan counts shown here also drive the leaderboard |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `contacts` | SELECT (Aggregate) | Total scans, confidence averages, daily volumes |
| `users` | SELECT (Count) | Active workspace members |
| `workspaces` | SELECT | Workspace membership and metadata |
