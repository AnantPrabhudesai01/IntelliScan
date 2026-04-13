# 🛡️ Admin Dashboard (Platform Superadmin)

> **Route**: `/admin`  
> **Component**: `AdminDashboard.jsx` (22,767 bytes)  
> **Access**: `super_admin` only

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Admin Dashboard is the **god-mode view** of the entire platform. Only the Super Admin can access it. It shows global platform metrics — total users, total scans across all workspaces, system health, AI engine usage, and job queue status. This is the operations command center.

**Key features**:
- **Global KPIs**: Total users, total scans, platform-wide average confidence.
- **User Management**: View all registered users across every tier and workspace.
- **System Health**: Engine performance, background job queues, incident logs.
- **Revenue Metrics**: Billing data and subscription tier distribution.

---

## ⚙️ Technical Frontend Workflow

### Key Functions
1. Fetches platform-wide stats from `GET /api/admin/stats`.
2. Fetches recent platform activity from `GET /api/admin/activity`.
3. Renders KPI cards, usage charts, and user tables.
4. Navigation links to sub-admin pages (Engine Performance, Job Queues, etc.).

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/admin/stats` | Platform-wide statistics |
| `GET` | `/api/admin/activity` | Recent activity feed across all users |
| `GET` | `/api/admin/users` | Full user directory |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `AdminLayout` | Layout | Dedicated admin shell with restricted navigation |
| `auth.js` | Utility | JWT management |
| `RoleGuard` | Component | Restricts access to `super_admin` role |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `EnginePerformance` | Navigation link from admin dashboard |
| `JobQueuesPage` | Navigation link from admin dashboard |
| `SystemIncidentCenter` | Navigation link from admin dashboard |
| `SuperAdminFeedbackPage` | Navigation link from admin dashboard |
| `AiTrainingTuningSuperAdmin` | Navigation link from admin dashboard |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `users` | SELECT (Count, List) | Platform-wide user metrics |
| `contacts` | SELECT (Aggregate) | Global scan statistics |
| `workspaces` | SELECT (Count) | Total workspace count |
