# 📇 Contacts Page (CRM Hub)

> **Route**: `/dashboard/contacts`  
> **Component**: `ContactsPage.jsx` (851 lines)  
> **Access**: All authenticated users (user, business_admin, super_admin)

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Contacts Page is your **digital rolodex**—a beautifully organized list of every business card you have ever scanned. You can search, filter, export, and take instant action on any contact. It's like having a personal CRM assistant that also writes emails for you.

**Key capabilities**:
- **Smart Search**: AI-powered semantic search ("find people in fintech from Bangalore").
- **AI Composer**: Click the sparkle icon on any contact to have Gemini write a follow-up email instantly.
- **Multi-format Export**: Download as Excel (CSV), vCard (.vcf), or push directly to Salesforce/Zoho/Odoo.
- **Sequence Enrollment**: Enroll any contact into an automated multi-step email sequence.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `search` | `string` | Text filter for name/email/company |
| `isSmartSearch` | `boolean` | Toggle between basic filter and AI semantic search |
| `viewMode` | `'grid' \| 'list'` | Toggle between card grid and table list views |
| `sequences` | `array` | List of available AI sequences for enrollment |
| `composerContact` | `object` | The contact currently open in the AI email composer modal |
| `composerTone` | `string` | Selected email tone (professional/friendly/executive/cold_outreach) |
| `generatedDraft` | `object` | AI-generated email with subject and body |
| `filterConfidence` | `boolean` | Filter to show only >90% confidence contacts |
| `exportDropdownOpen` | `boolean` | Controls the CRM export dropdown visibility |

### Key Functions
1. **`fetchSequences()`**: Loads AI sequences from `GET /api/email-sequences` for the enrollment dropdown.
2. **`handleExportCSV()`**: Uses the `xlsx` library to generate a downloadable Excel file.
3. **`handleExportVCard()`**: Builds vCard 3.0 format strings and triggers a browser download.
4. **`handleExportCRM(provider)`**: Sends contacts to `POST /api/crm/export/{provider}` for Salesforce/Zoho/Odoo CSV generation.
5. **`generateDraft()`**: Sends contact data + tone to `POST /api/drafts/generate` → Gemini AI writes a personalized email.
6. **`handleSendDraft()`**: Dispatches the generated email via `POST /api/drafts/{id}/send` → NodeMailer SMTP delivery.
7. **`handleEnrollSequence(contactId, sequenceId)`**: Enrolls a contact into an automated email sequence via `POST /api/contacts/{id}/enroll-sequence`.
8. **`handleEnrich(contactId)`**: Triggers AI data enrichment to fill missing fields.

### AI Composer Modal Lifecycle
```
User clicks ✦ sparkle icon on contact card
    → Modal opens with contact info pre-filled
    → User selects tone (Professional/Friendly/Executive/Cold)
    → Clicks "Generate Follow-Up with Gemini ✦"
    → POST /api/drafts/generate (contact data + tone)
    → Gemini AI crafts personalized subject + body
    → Draft displayed in editable text fields
    → User can edit, then:
        → "Send Now" → POST /api/drafts/{id}/send → SMTP delivery
        → "Save Draft" → PUT /api/drafts/{id} → Saved for later
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/contacts` | Fetch all user contacts |
| `GET` | `/api/contacts/stats` | Aggregate statistics (total, avg confidence) |
| `GET` | `/api/contacts/search` | AI-powered semantic search |
| `DELETE` | `/api/contacts/:id` | Remove a contact |
| `POST` | `/api/contacts/:id/enrich` | AI data enrichment |
| `POST` | `/api/contacts/:id/enroll-sequence` | Enroll in AI automation |
| `GET` | `/api/email-sequences` | List available sequences |
| `POST` | `/api/drafts/generate` | AI email generation via Gemini |
| `PUT` | `/api/drafts/:id` | Save/edit a draft |
| `POST` | `/api/drafts/:id/send` | Send email via SMTP |
| `POST` | `/api/crm/export/:provider` | Generate CRM-specific CSV |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Sidebar and responsive shell |
| `ContactContext` | Context | Provides contacts array, deleteContact, enrichContact, semanticSearch |
| `RoleContext` | Context | Tier-based export limits |
| `auth.js` | Utility | JWT token management |
| `xlsx` (library) | NPM Package | Excel file generation |
| `apiClient` | Utility | Axios-based HTTP client |
| `ScanPage` | Data Source | All contacts originate from scans |
| `EmailSequencesPage` | Feature | Fetches sequences for enrollment dropdown |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `DraftsPage` | Drafts generated here appear in the Drafts page |
| `EmailSequencesPage` | Contacts enrolled here drive the sequence engine |
| `CalendarPage` | "Schedule Meeting" button navigates to calendar |
| `WorkspaceContacts` | Enterprise workspace version mirrors this data |
| `AnalyticsPage` | Contact volume metrics |
| `CoachPage` | AI Coach analyzes contact health patterns |
| `SharedRolodexPage` | Workspace-shared contacts |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `contacts` | SELECT, DELETE | Read and manage contact records |
| `ai_drafts` | INSERT, UPDATE | Store AI-generated email drafts |
| `contact_sequences` | INSERT | Track sequence enrollment |
| `email_sequences` | SELECT | Read available sequences |
