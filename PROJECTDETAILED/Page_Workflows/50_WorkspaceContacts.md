# 👥 Workspace Team Contacts View

> **Page Route**: `/workspace/contacts`  
> **Component**: `WorkspaceContacts.jsx`  
> **Access Level**: Enterprise Admin / Enterprise Members

---

## 📖 Overview
The Workspace Contacts page is a streamlined, read-optimized view of all business card contacts owned by the current workspace. It provides search, engine-level filtering (Gemini Vision Pro vs. IntelliScan OCR-v2), confidence-level filtering, and bulk export capabilities. It is distinct from the Shared Rolodex in that it focuses on data quality metrics rather than real-time collaboration.

---

## 🛠️ Technical Workflow

### 1. Contact Data Source
- **Context API**: Uses `useContacts()` from `ContactContext` — a shared React context that caches contacts across the app.
- **No Direct API Call**: This page does not fetch from the backend directly; it relies on the global context pre-populated at login.

### 2. Filterable Table
- **Search**: Text search across name, company, and email fields.
- **Engine Filter**: Dropdown to filter by OCR engine used (Gemini Vision Pro / IntelliScan OCR-v2).
- **Confidence Filter**: Groups contacts by High (95%+), Reliable (80%+), and Needs Review (<80%).

### 3. Confidence Score Badging
- **≥90%**: Green badge — "High"
- **70–89%**: Amber badge — "Reliable"
- **<70%**: Red badge — "Review"

### 4. Action Buttons
- **Export to CSV**: Downloads the current workspace contacts as a CSV file.
- **Push to CRM**: Navigates to the CRM export flow.

### 5. Pagination
- **Client-Side Pagination**: Displays page controls (Prev/Next/Page Numbers) at the table footer.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `ContactContext` | React Context | Pre-loaded global workspace contacts |
| `ScanPage` | Source | Scanned contacts populate this view |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Quality Triage** | Confidence filters identify contacts needing manual review |
| **Engine Comparison** | Side-by-side accuracy assessment of different OCR engines |
| **Bulk Export** | One-click CSV download for external processing |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `contacts` | SELECT (via Context) | Pre-fetched by ContactContext at app initialization |
