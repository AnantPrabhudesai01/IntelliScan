ss# 📇 Shared Rolodex & Real-Time Team Collaboration

> **Page Route**: `/workspace/shared-rolodex`  
> **Component**: `SharedRolodexPage.jsx`  
> **Access Level**: Enterprise Admin / Enterprise Members

---

## 📖 Overview
The Shared Rolodex is the enterprise-grade, team-wide contact repository. It combines every business card scanned by every member of the workspace into a single, searchable, deduplicated view. It features **live cursor tracking** (Figma-style), **in-app team chat** via Socket.IO, and **duplicate outreach prevention** to eliminate the risk of multiple reps contacting the same lead.

---

## 🛠️ Technical Workflow

### 1. Multi-User Contact Aggregation
- **Fetch**: `GET /api/workspace/contacts` returns all contacts across the workspace, not just the current user's.
- **Duplicate Detection**: `GET /api/workspace/contacts/duplicates` identifies contacts scanned by multiple reps (same email).
- **Outreach Prevention**: Rows with duplicate emails are flagged with `⚠` icons and "Duplicate — multiple reps" status.

### 2. Real-Time Collaboration (Socket.IO)
- **Live Cursors**: `cursor-move` and `cursor-update` events broadcast each user's mouse position to all connected workspace members, rendered as floating cursor icons.
- **Team Chat**: `send-chat` / `new-chat-message` events power a persistent sidebar chat. Chat history is fetched from `GET /api/chats/:workspaceRoom`.

### 3. CRM Export
- **Provider Dropdown**: Supports one-click export to Salesforce, Zoho, and Odoo via `POST /api/crm/export/:provider`.
- **CSV Fallback**: Direct CSV download for non-integrated CRMs.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `Socket.IO Server` | Backend | Powers live cursors and real-time team chat |
| `ContactsPage` | Route | Individual contact drill-down navigates here |
| `CrmMappingPage` | Config | CRM export uses field mappings configured here |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Team-Wide Deduplication** | Prevents embarrassing double outreach to the same prospect |
| **Collaborative Intelligence** | Figma-style cursors show which contacts are being actively reviewed |
| **Centralized Export** | One-click CRM export for the entire workspace team |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `contacts` | SELECT (workspace-wide) | Fetches all contacts owned by any workspace member |
| `chat_messages` | INSERT/SELECT | Stores and retrieves team chat history |
| `crm_sync_log` | INSERT | Logs each CRM export action |
