# ⚡ Engine Performance Page (AI Monitoring)

> **Route**: `/admin/engine-performance`  
> **Component**: `EnginePerformance.jsx` (14,039 bytes)  
> **Access**: `super_admin` only

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Engine Performance page is the **AI health monitor**. It shows the Super Admin how the various OCR/AI engines (Gemini 1.5 Flash, Gemini 1.5 Pro, Gemini 2.5) are performing — response times, accuracy rates, error counts, and throughput. This helps in making decisions about which AI model to prioritize.

---

## ⚙️ Technical Frontend Workflow

### Key Functions
1. Fetches engine metrics from `GET /api/admin/engine-stats`.
2. Displays per-engine cards with latency, accuracy, and call volume.
3. Shows a comparison chart of engine performance over time.
4. Allows toggling engine priority or disabling underperforming models.

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/admin/engine-stats` | Per-engine metrics (latency, accuracy, volume) |

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
| `AdminDashboard` | Links here from the admin overview |
| `AiTrainingTuningSuperAdmin` | Uses engine data for model tuning decisions |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `scan_history` | SELECT (Aggregate) | Engine usage, latency, and accuracy per model |
| `contacts` | SELECT | Tracks which engine produced each extraction |
