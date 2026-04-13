# 🏗️ Sales Pipeline & Deal Management

> **Page Route**: `/workspace/pipeline`  
> **Component**: `PipelinePage.jsx`  
> **Access Level**: Enterprise Admin

---

## 📖 Overview
The Pipeline is a Kanban-style deal management board that tracks contacts through five sales stages: Prospect → Qualified → Proposal → Negotiation → Closed. It supports drag-and-drop stage transitions, deal valuation, and expected close dates, providing a visual revenue forecast for the sales organization.

---

## 🛠️ Technical Workflow

### 1. Deal Fetching & Rendering (`/api/deals`)
- **Authenticated Fetch**: `GET /api/deals` returns all contacts that have an active `deal_status`.
- **Stage Grouping**: Contacts are bucketed into one of 5 `STAGES` columns via `filteredContacts.filter()`.
- **Revenue Stats**: `totalValue` and `closedValue` are computed in real-time from the loaded data.

### 2. Drag-and-Drop Stage Transitions
- **HTML5 DnD API**: Each card carries a `draggable` attribute. `handleDragStart` writes the `contactId` to `dataTransfer`.
- **Column Drop**: `handleDrop` reads the contact ID, then calls `PUT /api/contacts/:id/deal` with the new `{ stage }`.
- **Optimistic Refresh**: Refetches the full deal list after each transition.

### 3. Deal Update Modal
- **Fields**: Pipeline Stage (dropdown), Deal Value ($), Expected Close Date, and Notes.
- **API**: `PUT /api/contacts/:id/deal` persists all fields simultaneously.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `contacts` table | Database | Deals are stored as extended fields on each contact |
| `ContactsPage` | Link | Contacts must exist before they can be assigned deals |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Revenue Forecasting** | Real-time pipeline value enables accurate sales projections |
| **Stage Automation** | Combined with Routing Rules, contacts auto-advance through stages |
| **Team Visibility** | All workspace members see the shared pipeline |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `contacts` | SELECT/UPDATE | Reads deal status; updates `deal_status`, `deal_value`, `deal_notes`, `expected_close` |
