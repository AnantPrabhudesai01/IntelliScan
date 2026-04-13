# 📋 Audience Segments & Contact Lists

> **Page Route**: `/dashboard/email-marketing/lists`  
> **Component**: `ContactListsPage.jsx`  
> **Access Level**: Business Admin / Enterprise

---

## 📖 Overview
The Contact Lists page manages audience segments for email campaigns. Users create named lists (e.g., "Fintech Decision Makers"), add contacts from their IntelliScan database, and target these segments in campaigns. It supports full list CRUD, searchable grid view, and per-list contact counts.

---

## 🛠️ Technical Workflow

### 1. List CRUD
- **Create**: `POST /api/email/lists` with `{ name, description }`.
- **Read**: `GET /api/email/lists` returns all lists with contact counts and timestamps.
- **Delete**: `DELETE /api/email/lists/:id` — removes the list grouping (contacts remain intact).

### 2. Grid Card Display
- Each list is rendered as a card showing:
  - List name and type badge ("Active Segment")
  - Contact count ("Reach")
  - Last sync date (formatted via `date-fns`)
  - Delete button (hover-reveal)

### 3. Navigation
- **Click Card**: Navigates to `ListDetailPage` for full contact management within that segment.
- **Create Modal**: In-page modal with name and description fields.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `ListDetailPage` | Route | Drill-down into individual list members |
| `CampaignBuilderPage` | Consumer | Campaigns select target lists from this page |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Audience Segmentation** | Enables targeted campaigns instead of mass blasts |
| **Reusable Segments** | Same list can power multiple campaigns over time |
| **Clean Separation** | Deleting a list doesn't delete the underlying contacts |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `email_lists` | INSERT/SELECT/DELETE | Full CRUD for list metadata |
| `email_list_contacts` | SELECT (count) | Provides contact counts per list |
