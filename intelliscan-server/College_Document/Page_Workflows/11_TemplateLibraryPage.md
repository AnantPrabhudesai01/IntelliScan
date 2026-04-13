# 📄 Template Library Page (Email Vector Library)

> **Route**: `/dashboard/email-marketing/templates`  
> **Component**: `TemplateLibraryPage.jsx` (121 lines)  
> **Access**: All authenticated users

---

## 🧑‍💼 What This Page Does (Layman Explanation)
The Template Library is your collection of **reusable email designs**. Instead of building every campaign from scratch, you save proven layouts and copy here, then reuse them. Categories include Welcome emails, Follow-ups, Newsletters, and Promotional offers.

**Key features**:
- **Category Filtering**: Browse by welcome, follow-up, newsletter, promotional, or general.
- **AI Composer Link**: One button takes you to the Campaign Builder with AI pre-activated.
- **Template Cards**: Visual previews of each stored template with quick actions (use, edit, duplicate, delete).

---

## ⚙️ Technical Frontend Workflow

### State Management
| State Variable | Type | Purpose |
|---|---|---|
| `templates` | `array` | List of saved email templates |
| `loading` | `boolean` | Controls loading skeleton |
| `searchTerm` | `string` | Filter by template name or subject |
| `categoryFilter` | `string` | Filter by category (welcome, follow-up, etc.) |

### Key Functions
1. **`fetchTemplates()`**: Loads all templates from `GET /api/email/templates`.
2. **`onSelect(template)`**: Navigates to Campaign Builder with the selected template pre-loaded.
3. **AI Composer button**: Routes to Campaign Builder with `{ state: { useAI: true } }`.

### Lifecycle
```
Component Mounts → fetchTemplates()
    → GET /api/email/templates
    → Render TemplateCard grid
    → User filters by category or searches
    → User clicks template → navigate to Campaign Builder
```

---

## 🖥️ Backend API Endpoints Used

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/email/templates` | Fetch all saved email templates |

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `DashboardLayout` | Layout | Common shell |
| `TemplateCard` | Component | Visual card for each template |
| `auth.js` | Utility | JWT token management |

### Pages That Depend On This Page:
| Page | Relationship |
|---|---|
| `CampaignBuilderPage` | Templates are selectable in Step 3 |
| `CoachPage` | "Create Template" action can lead here |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `email_templates` | SELECT | Primary read of all template records |
