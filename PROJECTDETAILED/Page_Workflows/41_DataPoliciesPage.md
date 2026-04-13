# 🛡️ Data Compliance & Retention Policies

> **Page Route**: `/workspace/data-policies`  
> **Component**: `DataPoliciesPage.jsx`  
> **Access Level**: Enterprise Admin

---

## 📖 Overview
The Data Policies page enforces organization-wide GDPR and SOC2 compliance rules. Admins configure three critical data governance controls: automated data retention/purging schedules, PII image redaction during OCR, and immutable audit logging of all contact-related operations.

---

## 🛠️ Technical Workflow

### 1. Automated Data Retention
- **Configuration**: Admins choose a retention window (30/60/90/365 days or Forever).
- **Purge Logic**: On save, the backend evaluates all contacts older than the threshold. Unsynced contacts (not exported to any CRM) are permanently deleted.
- **API**: `PUT /api/workspace/data-policies` with `{ retention_days, pii_redaction_enabled, strict_audit_storage_enabled }`.
- **Feedback**: Returns `purged_contacts` count so admins know how many records were removed.

### 2. PII Image Redaction
- **Toggle**: When enabled, the AI engine blurs personal mobile numbers and personal email domains (e.g., @gmail.com) on the raw scanned image before it's stored.
- **Privacy-by-Design**: Ensures that even if the database is compromised, raw PII is not visible in stored images.

### 3. Strict Compliance Audit Storage
- **Immutable Ledger**: When enabled, every user action involving exports, deletions, and CRM syncs is logged to an append-only `audit_logs` table.
- **SOC2 Alignment**: Supports enterprise compliance requirements for third-party security audits.

---

## 🔗 Page Dependencies

### This Page Depends On:
| Dependency | Type | Reason |
|---|---|---|
| `workspace_settings` table | Database | Stores the policy configuration per workspace |
| `contacts` table | Database | Subject to the retention purge window |

### Features Enabled by This Page:
| Feature | Impact |
|---|---|
| **GDPR Right to Erasure** | Automated data deletion ensures compliance |
| **Enterprise Compliance** | SOC2 audit trails for security-conscious customers |
| **Data Minimization** | PII redaction reduces the attack surface |

---

## 📊 Database Impacts
| Table | Operation | Description |
|---|---|---|
| `workspace_settings` | SELECT/UPDATE | Reads and saves policy configuration |
| `contacts` | DELETE | Purges contacts outside the retention window |
| `audit_logs` | INSERT | Appends immutable records for every data operation |
