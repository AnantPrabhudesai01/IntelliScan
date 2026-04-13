# 🛒 Integration Marketplace

> **Page Route**: `/marketplace`  
> **Component**: `MarketplacePage.jsx`  
> **Access Level**: Business Admin (+ Personal User viewing)

---

## 📖 Overview
The Marketplace is the installation hub for IntelliScan's "App Ecosystem." It allows users to connect their OCR-extracted data directly to world-leading CRM, Marketing, and Communication platforms without writing code.

---

## 🛠️ Technical Workflow

### 1. Extensibility Engine
- **App Registry**: A local `apps` array (which in production maps to a `marketplace_apps` database table) defines each integration's schema.
- **Config Modal**: When an app is clicked, `AppModal` generates a dynamic form based on `app.configFields` (e.g., "API Key", "Webhook URL").
- **Installation**: Saves the configuration to the backend `/api/crm/connect` or similar mapping endpoints.

### 2. Live API Testing
- **API Doc Modal**: Provides developers with their **Bearer Token** and documentation for interacting with the IntelliScan Public API.
- **Webhooks**: Explains the `/v2/webhooks` pattern for pushing real-time data to external apps.

### 3. Usage & Quotas
- **Real-time Counters**: Shows total installed vs total available apps.
- **Auto-Sync Logic**: Apps like Salesforce/HubSpot toggle the "Enterprise Sync" buttons in the contact list.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `apiClient` | Utility | Handles the authenticated saving of app tokens and keys |
| `SettingsPage` | Link | Settings display which Marketplace apps are currently active |
| `ContactsPage` | Link | Triggers the specific data export for installed apps |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **External CRM Sync** | Moves leads into Salesforce, HubSpot, or Zoho with one click |
| **Slack Alerts** | Sends real-time messages to channels when high-value leads are scanned |
| **Developer API Access** | Allows enterprise customers to build custom internal tooling |

---

## 📋 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `crm_mappings` | INSERT/UPDATE | Stores API keys and webhooks for each provider |
| `crm_sync_log` | INSERT | Logs when an integration is installed or disconnected |
