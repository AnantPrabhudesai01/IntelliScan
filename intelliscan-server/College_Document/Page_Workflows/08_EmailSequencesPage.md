# ⚡ AI Outreach Sequences Page

> **Route**: `/dashboard/email/sequences`  
> **Component**: `EmailSequencesPage.jsx` (183 lines)  
> **Access**: All authenticated users (Enterprise features unlock unlimited sequences)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The AI Sequences page is your **autopilot for follow-ups**. Instead of manually emailing every new contact, you define a multi-step "sequence" (e.g., Day 0: Intro → Day 3: Value-Add → Day 7: Coffee Chat), and the system automatically sends each step on schedule.

Think of it as a **drip campaign** for individual networking. Once you enroll a contact, the AI takes over and sends carefully timed, personalized emails without you lifting a finger.

**Key features**:
- **One-Click Creation**: Name your strategy, and IntelliScan auto-generates a 3-step template.
- **Visual Pipeline**: Each sequence card shows the timeline with step markers.
- **Background Automation**: A 15-minute heartbeat on the server processes pending sends.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `sequences` | `array` | List of user-created sequences fetched from the backend |
| `loading` | `boolean` | Controls the loading skeleton during data fetch |
| `isCreating` | `boolean` | Disables the Create button during API submission |
| `newSequenceName` | `string` | Input for the name of a new sequence |
| `error` | `string` | Error message displayed if the API call fails |

### Key Functions
1. **`fetchSequences()`**: Loads all sequences from `GET /api/email-sequences`.
2. **`handleCreateSequence()`**: Submits a new sequence name + 3 default steps to `POST /api/email-sequences`. Each step has a `delay_days`, `subject`, and `template_body` with `{{name}}`/`{{company}}` merge tags.

### Lifecycle
```
Component Mounts → fetchSequences()
    → GET /api/email-sequences
    → Render sequence cards with step timelines
User Creates New Sequence
    → Input sequence name → Click "Create"
    → POST /api/email-sequences { name, steps: [...] }
    → Backend stores in email_sequences + email_sequence_steps
    → UI re-fetches and displays the new card
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/email-sequences` | List all user sequences with step counts |
| `POST` | `/api/email-sequences` | Create a new sequence with initial steps |

### Backend Automation (The Agentic Loop)
The real power is server-side. In `index.js`, a `setInterval` runs every **15 minutes**:
```
processPendingSequences()
    → SELECT all contact_sequences WHERE status='active'
    → For each: check if delay_days have elapsed since enrollment
    → If ready: send email via NodeMailer → advance to next step
    → If all steps complete: mark sequence as 'completed'
```

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Provides the common sidebar |
| `auth.js` | Utility | JWT token management |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `ContactsPage` | Enrollment dropdown reads sequences created here |
| `DraftsPage` | Sequence emails appear as drafts before dispatch |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `email_sequences` | SELECT, INSERT | Master sequence records |
| `email_sequence_steps` | INSERT | Individual step templates (delay, subject, body) |
| `contact_sequences` | SELECT | Enrollment tracking for the heartbeat scheduler |
