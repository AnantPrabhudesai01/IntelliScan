# 📧 AI Drafts Page (Follow-Up Management)

> **Route**: `/dashboard/drafts`  
> **Component**: `DraftsPage.jsx` (187 lines)  
> **Access**: All authenticated users

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The AI Drafts page is your **"Follow-Up Inbox"**. After you scan a card, the AI automatically drafts a personalized email to that person based on their job title and company. You can review the draft, edit it if you want, and click "Send Now" to reach out immediately.

**Key features**:
- **Draft Status Tracking**: Visual indicators for "Needs Review" vs "Ready to Send".
- **AI-Personalized Text**: Every email template is customized—no more "nice to meet you" form letters.
- **Direct Send**: One-click emailing using your integrated SMTP settings.
- **Editable Proofing**: Full text editor to tweak the subject and message body.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `drafts` | `array` | List of AI-generated email drafts fetched from the backend |
| `editingDraft` | `object` | The draft currently open in the Edit Modal |
| `toast` | `string` | Notification message for user actions (e.g., "Draft sent") |

### Key Functions
1. **`fetchDrafts()`**: Pulls all pending and sent drafts from `GET /api/drafts`.
2. **`handleSend(id)`**: Dispatches the draft via `POST /api/drafts/{id}/send`. On success, removes it from the list.
3. **`handleDelete(id)`**: Permanently removes the draft from the database via `DELETE /api/drafts/{id}`.
4. **`handleSaveEdit()`**: Local state update to mark a draft as "Ready to Send" after user review.

### Lifecycle
```
Component Mounts
    → fetchDrafts() called
    → GET /api/drafts returns list of AI-suggested follow-ups
User Clicks "Edit"
    → Modal opens with subject/body in local state
    → User edits → "Save & Mark Ready"
    → State 'editingDraft' cleared → Draft card updated
User Clicks "Send Now"
    → POST /api/drafts/{id}/send
    → Backend SMTP sends the email
    → Response: HTTP 200 { sent: true }
    → Draft removed from the UI list
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/drafts` | Retrieves the user's AI-generated email queue |
| `POST` | `/api/drafts/:id/send` | Finalizes and sends the email draft via the SMTP service |
| `DELETE` | `/api/drafts/:id` | Deletes a draft permanently |
| `PUT` | `/api/drafts/:id` | Updates the subject and message body of a specific draft |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Provides the common sidebar navigation |
| `Lucide Icons` | Library | Iconography for Mail, Edit, Trash2, Send, etc. |
| `auth.js` | Utility | Handles user authentication tokens |
| `NodeMailer` (Backend) | Library | Service for final email delivery |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `ScanPage` | New scans trigger the automatic creation of drafts here |
| `ContactsPage` | Individual contact "AI Follow-Up" actions create drafts here |
| `CoachPage` | Suggests visiting this page to "Re-activate Stale Contacts" |
| `EmailMarketingPage` | Can source draft content for large-scale campaigns |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `ai_drafts` | SELECT, UPDATE, DELETE | Primary storage for individual email drafts |
| `contacts` | SELECT | Retrieves name/email for each draft |
| `user_smtp_settings` | SELECT | Backend uses this to send the emails |
