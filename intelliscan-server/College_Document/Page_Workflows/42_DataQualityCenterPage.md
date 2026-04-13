# ✨ Data Quality Center & Deduplication Engine

> **Page Route**: `/workspace/data-quality`  
> **Component**: `DataQualityCenterPage.jsx`  
> **Access Level**: Enterprise Admin

---

## 📖 Overview
The Data Quality Center is the workspace's hygiene engine. It automatically detects duplicate contacts using AI-powered fuzzy matching, presents merge suggestions with confidence scores, and allows admins to select a primary record and merge or dismiss each suggestion. This ensures the Shared Rolodex stays clean and accurate.

---

## 🛠️ Technical Workflow

### 1. Deduplication Queue (`/api/workspace/data-quality/dedupe-queue`)
- **Queue Generation**: The backend runs a fuzzy-match algorithm across all workspace contacts, grouping likely duplicates by email, phone, or name similarity.
- **Confidence Scoring**: Each suggestion includes a `confidence` percentage (e.g., 92%).
- **Summary Stats**: Displays counts for Pending, Merged, Dismissed, and Impacted Contacts.

### 2. Merge Workflow
- **Primary Selection**: Admin selects which contact record to keep as the "primary."
- **Merge Suggestions**: The system proposes field enrichment (e.g., "Fill missing phone from duplicate B").
- **API**: `POST /api/workspace/data-quality/queue/:id/merge` with `{ primary_contact_id }`.
- **Result**: The primary contact absorbs missing fields from duplicates; duplicates are soft-deleted.

### 3. Dismiss Workflow
- **API**: `POST /api/workspace/data-quality/queue/:id/dismiss` with `{ reason }`.
- **Effect**: The suggestion is removed from the pending queue but the contacts remain untouched.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `SharedRolodexPage` | Feature | Deduplication directly cleans the shared contact pool |
| `contacts` table | Database | Source data for the fuzzy-matching algorithm |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Contact Hygiene** | Prevents CRM pollution from duplicate scans |
| **Field Enrichment** | Missing fields on the primary record are filled from duplicates |
| **Audit Trail** | Merge/dismiss actions are logged for compliance |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `dedupe_queue` | SELECT/UPDATE | Reads pending suggestions; updates status to merged/dismissed |
| `contacts` | SELECT/UPDATE/DELETE | Soft-deletes duplicates; enriches the primary record |
