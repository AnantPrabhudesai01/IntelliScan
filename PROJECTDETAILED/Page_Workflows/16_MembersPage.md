# 👥 Members Page (Team Management)

> **Route**: `/workspace/members`  
> **Component**: `MembersPage.jsx` (328 lines)  
> **Access**: `business_admin`, `super_admin`

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Members Page is the **team roster**. Enterprise admins use it to invite new team members, assign roles (Member vs Admin), and remove people from the workspace. It's the HR control panel for OntelliScan's multi-tenant architecture.

**Key features**:
- **Invite System**: Send invitations via email with a role assignment (Member or Admin).
- **Role Badges**: Visual distinction between Enterprise Admins (shield icon) and regular Members.
- **Activity Status**: Live green indicators show active members.
- **Tier Display**: Shows each member's subscription tier (Personal, Enterprise).
- **Security Posture Widget**: Workspace compliance and admin oversight metrics.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `members` | `array` | All workspace members |
| `loading` | `boolean` | Controls loading state |
| `isInviteModalOpen` | `boolean` | Invite modal visibility |
| `inviteData` | `object` | Name, email, and role for the new invite |
| `isInviting` | `boolean` | Prevents double submission |

### Key Functions
1. **`fetchMembers()`**: Loads the team from `GET /api/workspace/members`.
2. **`handleInvite(e)`**: Submits invite via `POST /api/workspace/members/invite`. Uses `react-hot-toast` for success/error feedback.
3. **`removeMember(id)`**: Removes a member via `DELETE /api/workspace/members/:id` with confirmation dialog.

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/workspace/members` | List all workspace members with roles and tiers |
| `POST` | `/api/workspace/members/invite` | Send an invitation to a new team member |
| `DELETE` | `/api/workspace/members/:id` | Remove a member from the workspace |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Common shell |
| `react-hot-toast` | Library | Toast notifications for invite/remove feedback |
| `auth.js` | Utility | JWT management |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `OrgChartPage` | Org chart is built from the team roster managed here |
| `WorkspaceDashboard` | Active member count sourced from this data |
| `Leaderboard` | Rankings depend on the members in the workspace |
| `RoutingRulesPage` | Routing rules assign leads to members listed here |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `users` | SELECT, INSERT | Read team roster and create invited users |
| `workspace_members` | SELECT, INSERT, DELETE | Maps users to workspaces |
| `workspaces` | SELECT | Validates workspace ownership |
