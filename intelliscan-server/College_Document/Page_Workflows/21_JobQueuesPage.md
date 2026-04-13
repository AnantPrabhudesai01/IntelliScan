# 📊 Job Queues Page (Background Processing)

> **Route**: `/admin/job-queues`  
> **Component**: `JobQueuesPage.jsx` (13,597 bytes)  
> **Access**: `super_admin` only

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Job Queues page shows the **background processing pipeline**. IntelliScan runs several automated tasks in the background — sending sequence emails, processing batch scans, AI enrichment jobs. This page lets the Super Admin monitor what's queued, what's running, what succeeded, and what failed.

---

## ⚙️ Technical Frontend Workflow

### Key Functions
1. Fetches job queue status from `GET /api/admin/jobs`.
2. Renders job cards with status (pending, running, completed, failed).
3. Allows retry of failed jobs and cancellation of pending ones.
4. Real-time refresh to track active processing.

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/admin/jobs` | List all background job statuses |
| `POST` | `/api/admin/jobs/:id/retry` | Retry a failed job |
| `DELETE` | `/api/admin/jobs/:id` | Cancel a pending job |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `AdminLayout` | Layout | Admin shell |
| `auth.js` | Utility | JWT management |
| `RoleGuard` | Component | Restricts to `super_admin` |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `AdminDashboard` | Links here from admin overview |
| `EmailSequencesPage` | Sequence heartbeat jobs appear here |
| `SystemIncidentCenter` | Failed jobs may trigger incident alerts |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `job_queue` | SELECT, UPDATE, DELETE | Background task records |
| `contact_sequences` | SELECT | Sequence processing jobs |
| `email_campaigns` | SELECT | Campaign dispatch jobs |
