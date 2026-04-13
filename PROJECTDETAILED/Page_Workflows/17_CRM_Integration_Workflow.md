# 🔄 CRM Integration & Enterprise Sync Workflow

> **Direct Export Routes**: `/api/crm/export/:provider`  
> **Configuration Page**: `CrmMappingPage.jsx`  
> **Trigger Page**: `ContactsPage.jsx`

---

## 🧑‍💼 How It Works (Layman Explanation)
IntelliScan is designed to be the "Front-End" for your existing CRM (Salesforce, Zoho, Odoo, etc.). Instead of manually typing in business card data, you scan them with IntelliScan, and then "Sync" them to your professional database.

### The 3-Step Process:
1.  **Connect**: You link your CRM once in the Settings.
2.  **Map**: You tell IntelliScan which fields go where (e.g., "Full Name" in IntelliScan should be "Contact Name" in Salesforce).
3.  **Sync**: In your contact list, you click "Enterprise Sync". IntelliScan prepares a specialized file that your CRM understands perfectly and downloads it for you to upload, or sends it via a secure Webhook.

---

## ⚙️ Technical Frontend Workflow

### 1. Mapping Configuration (`CrmMappingPage.jsx`)
The user defines how data flows from IntelliScan to the target CRM.
- **Provider Selection**: Support for Salesforce, HubSpot, Zoho, and Pipedrive.
- **Field Mapping**: A table-based interface where `iscanField` (internal) is mapped to `crmField` (external).
- **AI-Enriched Mapping**: Special support for syncing AI-generated fields like *Industry* and *Seniority*.
- **Webhook Connection**: Instead of brittle OAuth, IntelliScan uses a **Webhook-Forwarding** model. You provide an endpoint (Zapier, Make.com, or a Custom API), and IntelliScan "pushes" the data there.

### 2. Export Trigger (`ContactsPage.jsx`)
- **`handleExportCRM(provider)`**: Triggered by the "Enterprise Sync" dropdown.
- **Payload**: Sends an array of `contact_ids` to the backend.
- **Feedback**: A real-time notification overlay shows "Authorizing CRM Link..." while the backend processes the mapping.

---

## 🖥️ Backend API & Data Logic

### `POST /api/crm/export/:provider`
This is the core engine of the integration. It performs the following steps:
1.  **Resolve Mapping**: Fetches the `crm_mappings` for the user's workspace.
2.  **Fetch Data**: Pulls the full contact records from the `contacts` table.
3.  **Transform**: Iterates through the contacts and **renames the keys** based on the saved mapping.
    *   *Example*: If `name` is mapped to `LastName`, the resulting record will have a `LastName` key.
4.  **CSV Generation**: Converts the transformed JSON into a standard CSV string.
5.  **Audit Logging**: Inserts a record into `crm_sync_log` (e.g., "Export completed. 50 contacts exported with 12 fields.").

---

## 🔗 Page Dependencies

### This Workflow Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `CrmMappingPage` | Config | Defines the field headers for the export |
| `ContactsPage` | Trigger | Selects which contacts to sync |
| `src/routes/workspaceRoutes` | API | Handles the saving and fetching of CRM configs |

### Features Enabled by This Workflow:
| Feature | Impact |
|---|---|
| **One-Click Salesforce Sync** | Moves leads from physical cards to corporate CRM in seconds |
| **Field Transformation** | Ensures data matches the target CRM's schema (e.g., Lead Sources, Custom Fields) |
| **Audit Trails** | Admins can see exactly when and who exported data to the CRM |

---

## 📊 Database Tables Affected
| Table | Operation | Description |
|---|---|---|
| `crm_mappings` | SELECT | Read the user's field configuration |
| `contacts` | SELECT | The source data for the export |
| `crm_sync_log` | INSERT | Records the success/failure of the sync action |
