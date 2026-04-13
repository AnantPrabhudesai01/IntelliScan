# 🧠 AI Networking Coach Page

> **Route**: `/dashboard/coach`  
> **Component**: `CoachPage.jsx` (188 lines)  
> **Access**: All authenticated users

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The AI Coach is your personal **networking strategist**. It doesn't just store contacts; it analyzes your daily interactions, follow-up times, and "Network Health Score" to give you actionable advice. 

The Coach looks at your data and tells you:
- **"Hey, these 5 people have gone cold—send them a follow-up!"**
- **"Your strongest networking is in the Fintech sector—here's a custom outreach template for that industry."**
- **"You're missing emails for several recent scans—let's fix that context."**

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `insights` | `object` | Stores the AI coach's findings (health score, status, actions) |
| `loading` | `boolean` | State during initial fetch of AI insights |
| `fallbackInsights` | `object` | Default values used when the API is unavailable or the user is new |

### Key Functions
1. **`fetchData()`**: Retrieves current AI insights from `GET /api/coach/insights`.
2. **`handleAction(id)`**: Navigates the user to the corresponding page based on the Coach's advice (e.g., to `DraftsPage` for "stale" contacts, or `ContactsPage` for "missing context").
3. **Health Score Visualization**: A dynamic SVG gauge renders the `healthScore` (0-100) with a smooth transition animation.

### Lifecycle
```
Component Mounts
    → fetchData() called
    → GET /api/coach/insights (with Auth header)
    → Server-side engine evaluates user's CRM activity
    → Response: 3 Strategic Actions + Momentum Status + Health Score
    → UI renders the Health Gauge and Insight Cards
User Clicks CTA
    → handleAction() → navigate() to specific functional page
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/coach/insights` | Core AI analysis engine for generating user-specific advice |

### AI Analysis Logic (Conceptual)
The backend runs several checks:
1. **Recency**: Are there scans older than 48h with no follow-ups? → Action "Stale Contacts".
2. **Cluster**: Are >40% of contacts in a single industry? → Action "Strategic Focus".
3. **Quality**: Are >10% of contacts missing a critical field? → Action "Missing Context".

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Provides the common dashboard container |
| `Lucide Icons` | Library | Iconography for Target, TrendingUp, MessageSquare, etc. |
| `auth.js` | Utility | Handles user authentication tokens |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `DraftsPage` | Receives users from the "Stale Contacts" suggestion |
| `ContactsPage` | Receives users for "Complete Context" actions |
| `TemplateLibraryPage` | Receives users to launch industry-specific campaigns |
| `AnalyticsPage` | Historical trends from coach insights feed the long-term charts |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `contacts` | SELECT | Reads recent scan dates and field completion percentage |
| `ai_drafts` | SELECT | Checks for pending vs sent follow-ups |
| `users` | SELECT | Retrieves user profile for personalized momentum status |
| `workspaces` | SELECT | Evaluates group networking health for enterprise users |
