# 🏆 Leaderboard Page (Gamified Networking)

> **Route**: `/dashboard/leaderboard`  
> **Component**: `Leaderboard.jsx` (233 lines)  
> **Access**: All authenticated users (Typically within a Workspace/Enterprise context)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Leaderboard brings a fun, competitive edge to business networking. It ranks you and your teammates based on how many cards you've scanned and the "Pipeline Value" (the estimated business potential) of your new contacts. 

Think of it as the **"Networking Championship"**. You can see:
- Who is the top "Closer" or "Prospector" this week.
- Real-time rankings with a podium for the top 3 performers.
- Your own progress compared to the rest of the team.
- Special badges (like "Elite" or "Pioneer") for hitting certain milestones.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `rankings` | `array` | List of team members with their stats (name, scans, value, email) |
| `loading` | `boolean` | Controls the loading skeleton while fetching data |
| `activeTab` | `string` | Toggle for time range filter ('This Week', 'This Month', 'All Time') |

### Key Functions
1. **`fetchRankings()`**: Retrieves aggregated performance data from `GET /api/admin/leaderboard`.
2. **Tab Switching**: Updates `activeTab` state, which triggers a re-fetch of rankings for the selected time period.
3. **Badge Logic**: Maps static `BADGES` array to the top 3 users (`index < 3`) and applies "Elite" status for users with >20 scans.

### Lifecycle
```
Component Mounts
    → fetchRankings() called
    → Request to GET /api/admin/leaderboard (with Auth header)
    → Rankings state updated
    → Render podium (Top 3) and Detailed Table (rest of the team)
User Clicks Tab ('This Week' etc.)
    → State activeTab changes
    → useEffect re-triggers fetchRankings()
    → UI refreshes with new period statistics
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/admin/leaderboard` | Fetches aggregated scan counts and pipeline values per user |

### SQL Logic (Conceptual)
The backend performs a group-by query across multiple tables:
```sql
SELECT u.name, u.email, COUNT(c.id) as total_scans, SUM(c.potential_value) as pipeline_value
FROM users u
LEFT JOIN contacts c ON u.id = c.user_id
GROUP BY u.id
ORDER BY total_scans DESC
```

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Provides the common sidebar shell |
| `auth.js` | Utility | Handles user authentication tokens |
| `Lucide Icons` | Library | Iconography for Trophy, Crown, Medals, etc. |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `ScanPage` | Every scan performed there increments the user's score here |
| `WorkspaceDashboard` | Often displays a "Top Performers" widget linked to this page |
| `AdminDashboard` | High-level overview of team activity sourced from leaderboard data |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `users` | SELECT | Retrieves user profile info (name, email) |
| `contacts` | SELECT (Count/Sum) | Calculates total scans and estimated business value per user |
| `workspaces` | SELECT (Filter) | Ensures rankings are confined to the user's workspace |
