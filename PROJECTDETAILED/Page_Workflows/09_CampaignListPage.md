# 📊 Campaign List Page (Email Marketing Hub)

> **Route**: `/dashboard/email-marketing/campaigns`  
> **Component**: `CampaignListPage.jsx` (178 lines)  
> **Access**: All authenticated users (Enterprise features unlock advanced analytics)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Campaign List is your **command center for email blasts**. Unlike individual AI Drafts (one-to-one), campaigns are **one-to-many** — you design a single email and send it to hundreds or thousands of contacts at once.

**Key features**:
- **Campaign Dashboard**: View all campaigns (draft, scheduled, sending, sent) in one list.
- **Performance Metrics**: See open rates and click rates for sent campaigns at a glance.
- **Status Filters**: Quickly filter by draft, scheduled, sending, or sent status.
- **Full CRUD**: Create, search, edit, and delete campaigns.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `campaigns` | `array` | List of all email campaigns from the backend |
| `loading` | `boolean` | Controls loading skeleton during data fetch |
| `searchTerm` | `string` | Text filter for campaign names/subjects |
| `statusFilter` | `string` | Filter by campaign status ('all', 'draft', 'scheduled', 'sending', 'sent') |

### Key Functions
1. **`fetchCampaigns()`**: Loads all campaigns from `GET /api/email/campaigns`.
2. **`handleDelete(id)`**: Sends `DELETE /api/email/campaigns/:id` after user confirmation.
3. **Client-side filtering**: `filteredCampaigns` applies search + status filters locally.
4. **Navigation**: Routes to the Campaign Builder (`/new`) or Campaign Detail (`/:id`) for analytics.

### Lifecycle
```
Component Mounts → fetchCampaigns()
    → GET /api/email/campaigns
    → Render campaign cards with status badges and metrics
    → User filters by status or searches by name
    → User clicks "New Campaign" → navigates to CampaignBuilderPage
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/email/campaigns` | Fetch all campaigns with stats |
| `DELETE` | `/api/email/campaigns/:id` | Delete a campaign |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Common shell |
| `EmailStatusBadge` | Component | Renders colored badges per campaign status |
| `date-fns` | Library | Date formatting for campaign creation timestamps |
| `auth.js` | Utility | JWT token management |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `CampaignBuilderPage` | "New Campaign" button navigates here |
| `CampaignDetailPage` | "View Analytics" navigates to per-campaign reporting |
| `EmailMarketingPage` | Parent dashboard with links to this list |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `email_campaigns` | SELECT, DELETE | Primary campaign storage |
| `campaign_recipients` | SELECT (Count) | Aggregated recipient counts |
| `campaign_analytics` | SELECT | Open/click rate metrics for sent campaigns |
