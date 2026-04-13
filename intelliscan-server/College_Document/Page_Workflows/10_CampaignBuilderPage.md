# 🛠️ Campaign Builder Page (Multi-Step Wizard)

> **Route**: `/dashboard/email-marketing/campaigns/new`  
> **Component**: `CampaignBuilderPage.jsx` (444 lines)  
> **Access**: All authenticated users

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Campaign Builder is a **4-step wizard** that walks you through creating an email campaign from start to finish:
1. **Setup**: Define the campaign name, subject line, sender details.
2. **Audience**: Select which contact lists to send to.
3. **Design**: Write your email HTML or use the **AI Orchestrator** to auto-generate content.
4. **Review**: Verify everything and hit "Initialize Send" to dispatch.

This is the most complex email page — it combines list management, template selection, AI content generation, and a live preview panel.

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `step` | `number (1-4)` | Current wizard step |
| `campaign` | `object` | Full campaign payload (name, subject, body, list_ids, template_id, etc.) |
| `lists` | `array` | Available audience segments from `GET /api/email/lists` |
| `templates` | `array` | Available email templates from `GET /api/email/templates` |
| `aiGenerating` | `boolean` | Loading state during AI content generation |
| `loading` | `boolean` | Loading state during save/send operations |

### Key Functions
1. **`fetchLists()`**: Loads contact lists for audience selection.
2. **`fetchTemplates()`**: Loads reusable email templates.
3. **`handleGenerateAI()`**: Calls `POST /api/email/templates/generate-ai` with context (purpose, tone, industry) → Gemini generates subject + HTML body.
4. **`handleTemplateSelect(id)`**: Populates campaign fields from a pre-built template.
5. **`handleSave(isSend)`**: Saves the campaign via `POST /api/email/campaigns`. If `isSend=true`, immediately dispatches via `POST /api/email/campaigns/:id/send`.

### 4-Step Wizard Lifecycle
```
Step 1 (Setup): Name → Subject → Preview Text → Sender Info
Step 2 (Audience): Select contact lists (toggleable multi-select)
Step 3 (Design): Choose template OR generate via AI → Edit HTML
Step 4 (Review): Summary → Save as Draft OR Initialize Send
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/email/lists` | Fetch contact segments/lists |
| `GET` | `/api/email/templates` | Fetch reusable email templates |
| `POST` | `/api/email/templates/generate-ai` | Gemini AI generates email HTML and subject |
| `POST` | `/api/email/campaigns` | Create/save a new campaign |
| `POST` | `/api/email/campaigns/:id/send` | Trigger campaign dispatch |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Common shell |
| `EmailPreview` | Component | Live preview of HTML email in desktop/mobile frames |
| `ContactListsPage` | Data | Audience segments selected in Step 2 |
| `TemplateLibraryPage` | Data | Templates loaded in Step 3 |
| `auth.js` | Utility | JWT management |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `CampaignListPage` | Campaigns created here appear in the list |
| `CampaignDetailPage` | Campaign analytics accessible after send |
| `TemplateLibraryPage` | "AI Composer Active" button links here |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `email_campaigns` | INSERT | New campaign record |
| `campaign_recipients` | INSERT | Maps campaign to recipient contacts |
| `email_templates` | SELECT | Template body used for content |
| `email_lists` | SELECT | Contact segments for audience targeting |
