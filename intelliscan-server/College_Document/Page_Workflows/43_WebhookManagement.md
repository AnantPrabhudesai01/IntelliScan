# 🪝 Webhook Integrations & Event Automation

> **Page Route**: `/workspace/webhooks`  
> **Component**: `WebhookManagement.jsx`  
> **Access Level**: Enterprise Admin

---

## 📖 Overview
The Webhook Management page is the real-time integration hub for connecting IntelliScan to external automation platforms. Admins register destination URLs (Zapier, Slack, custom APIs) and select trigger events (`on_scan`, `on_deal_update`, `on_export`). The system pushes a JSON payload via HTTP POST to these endpoints immediately when events occur.

---

## 🛠️ Technical Workflow

### 1. Webhook CRUD
- **Register**: `POST /api/webhooks` with `{ url, event_type }`.
- **List**: `GET /api/webhooks` returns all configured hooks with status and creation date.
- **Delete**: `DELETE /api/webhooks/:id` removes a webhook endpoint.

### 2. Supported Event Types
| Event | Trigger |
|---|---|
| `on_scan` | Fires when a new business card is scanned and contact is created |
| `on_deal_update` | Fires when a contact's deal stage changes |
| `on_export` | Fires when a daily batch export CSV is generated |

### 3. Delivery Logs
- **Activity Feed**: Shows recent webhook deliveries with HTTP status codes (200/500), payload previews, and timestamps.
- **Retry**: Failed deliveries can be manually retried from the log.

### 4. API Payload Documentation
- **Inline Code Block**: Displays a sample `on_scan` payload with JSON structure for developer reference.
- **Zapier Integration**: Dedicated call-to-action for connecting with 5,000+ apps via Zapier templates.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `ScanPage` | Event Source | Triggers `on_scan` events |
| `PipelinePage` | Event Source | Triggers `on_deal_update` events |
| `ApiDocsPage` | Link | Full webhook API documentation |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **Real-Time Sync** | Scanned contacts appear in Slack/Salesforce within seconds |
| **Custom Integrations** | Developers can build bespoke internal tools using webhook events |
| **Zapier Ecosystem** | No-code connection to 5,000+ SaaS platforms |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `webhooks` | INSERT/SELECT/DELETE | Full lifecycle management of registered endpoints |
| `webhook_deliveries` | INSERT/SELECT | Logs each delivery attempt with status and payload |
