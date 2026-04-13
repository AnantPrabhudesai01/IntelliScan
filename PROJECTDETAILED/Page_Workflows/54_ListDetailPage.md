# 👤 List Detail & Contact Import

> **Page Route**: `/dashboard/email-marketing/lists/:id`  
> **Component**: `ListDetailPage.jsx`  
> **Access Level**: Business Admin / Enterprise

---

## 📖 Overview
The List Detail page is the member management view for a single audience segment. It shows all contacts within the list, their subscription status, and provides the critical "Import from IntelliScan" workflow that bridges the card scanning pipeline with the email marketing engine.

---

## 🛠️ Technical Workflow

### 1. List Data Fetch (`/api/email/lists/:id`)
- **Authenticated GET**: Returns the list metadata (`list`) and all member contacts (`contacts`).

### 2. Contact Import Modal ("Intake Intelligence")
- **Trigger**: "Add Contacts" button opens the import modal.
- **CRM Bridge**: `handleFetchMatchingContacts()` fetches all IntelliScan contacts via `GET /api/contacts`, filters out those already in the list (by email), and presents the remaining as selectable candidates.
- **Selective Import**: Users check individual contacts and click "Inject N selected profiles."
- **API**: `POST /api/email/lists/:id/contacts` with `{ contacts: [...selectedContacts] }`.

### 3. Contact Table
- **Columns**: Identity (name + avatar), Company, Email, Status (Subscribed/Unsubscribed), Date Added.
- **Search**: Filters across first name, last name, email, and company.
- **Delete**: Per-row remove button (removes from list, not from the contact database).

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `ContactListsPage` | Navigation | "Back to Audiences" returns to the list grid |
| `ContactsPage` | Data Source | imports contacts from the main IntelliScan database |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **CRM-to-Marketing Bridge** | Scanned contacts flow directly into email campaigns |
| **Subscription Management** | Tracks opt-in/opt-out status per contact per list |
| **Selective Import** | Users choose exactly which contacts to add, preventing unwanted overlap |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `email_lists` | SELECT | Fetches list metadata |
| `email_list_contacts` | SELECT/INSERT/DELETE | Manages list membership |
| `contacts` | SELECT | Sources available contacts for import |
