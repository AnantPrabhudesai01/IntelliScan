# IntelliScan — Data Dictionary (Human-Friendly Summary)

This document is a human-friendly summary of key IntelliScan tables and fields.

For the authoritative, complete schema dump extracted from the actual local SQLite database (`intelliscan-server/intelliscan.db`), use:

- `DATA_DICTIONARY_INTELLISCAN_DB.md`

---

## 1. IDENTITY & ENFORCEMENT

### Table: `users`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | Sequence ID |
| `email` | TEXT | UNIQUE, NOT NULL | Account email |
| `password_hash` | TEXT | NOT NULL | Bcrypt hash |
| `name` | TEXT | | Full Name |
| `company` | TEXT | | Affiliated Organization |
| `role` | TEXT | DEFAULT 'user' | Access level |
| `tier` | TEXT | DEFAULT 'personal'| Plan limit |
| `onboarded` | INTEGER | DEFAULT 0 | 1 = Completed first run |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

### Table: `sessions`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `token` | TEXT | UNIQUE, NOT NULL | JWT token string |
| `user_id` | INTEGER | FK -> users(id) ON DELETE CASCADE | |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| `expires_at` | DATETIME | NOT NULL | Token expiration limit |

### Table: `user_quotas`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `user_id` | INTEGER | UNIQUE, FK -> users(id) | |
| `scans_total` | INTEGER | NOT NULL | Maximum permitted scans |
| `scans_used` | INTEGER | DEFAULT 0 | Consumed amount |
| `group_scans_total`| INTEGER | NOT NULL | Bulk photo maximum |
| `group_scans_used` | INTEGER | DEFAULT 0 | Bulk group consumed |

---

## 2. CONTACT PIPELINE (CRM CORE)

### Table: `contacts`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `user_id` | INTEGER | FK -> users(id) | The scanning user |
| `workspace_id`| INTEGER | FK -> workspaces(id) | If shared to org |
| `workspace_scope`| TEXT | DEFAULT 'private' | 'private' or 'shared' |
| `scan_date` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Upload timestamp |
| `image_url` | TEXT | | Associated cloud blob |
| `json_data` | TEXT | NOT NULL | LLM raw output |
| `deal_score` | REAL | DEFAULT 0.0 | AI generated priority |
| `is_deleted` | INTEGER | DEFAULT 0 | Soft deletion flag |

### Table: `workspace_chats`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `workspace_id`| INTEGER | NOT NULL, FK -> workspaces(id) | |
| `user_id` | INTEGER | NOT NULL, FK -> users(id) | Sender |
| `message` | TEXT | NOT NULL | String text |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

### Table: `ai_drafts`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `user_id` | INTEGER | NOT NULL, FK -> users(id) | |
| `contact_id`| INTEGER | NOT NULL, FK -> contacts(id) | The lead target |
| `subject` | TEXT | NOT NULL | Draft email Subject |
| `body` | TEXT | NOT NULL | Draft email Text |
| `status` | TEXT | DEFAULT 'draft' | 'draft' or 'sent' |

---

## 3. EMAIL MARKETING SUITE

### Table: `email_templates`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `user_id` | INTEGER | NOT NULL, FK -> users(id) | |
| `name` | TEXT | NOT NULL | Design Name |
| `subject` | TEXT | NOT NULL | Pre-configured subject |
| `html_body` | TEXT | NOT NULL | Raw HTML structure |
| `is_shared` | INTEGER | DEFAULT 0 | Global Workspace usage |

### Table: `email_lists` & `email_list_contacts`
| Field Name (Lists) | Type | Field Name (Contacts) | Type |
|---|---|---|---|
| `id` | INTEGER PK | `id` | INTEGER PK |
| `user_id` | INTEGER FK | `list_id` | INTEGER FK |
| `name` | TEXT | `contact_id` | INTEGER FK |
| `type` | TEXT 'static' | `email` | TEXT NOT NULL |
| `contact_count`| INTEGER DEFAULT 0 | `subscribed` | INTEGER DEFAULT 1 |

### Table: `email_campaigns`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `user_id` | INTEGER | NOT NULL, FK -> users(id) | |
| `name` | TEXT | NOT NULL | |
| `status` | TEXT | DEFAULT 'draft' | |
| `html_body` | TEXT | | The compiled email |
| `list_ids` | TEXT | | Which target databases |
| `sent_at` | DATETIME | | Dispatch Time |

### Table: `email_sends` & `email_clicks`
| Field Name (Sends) | Type | Description |
|---|---|---|
| `campaign_id` | INTEGER FK | The master broadcast |
| `email` | TEXT NOT NULL | Recipient Address |
| `open_count` | INTEGER DEFAULT 0| Fired by HTML Pixel tracker |
| `click_count` | INTEGER DEFAULT 0| Redirect hijacking tracker |
| `tracking_id` | TEXT UNIQUE | The hidden Pixel UUID |

---

## 4. CALENDAR SCHEDULING SYSTEM

### Table: `calendars`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `user_id` | INTEGER | NOT NULL, FK -> users(id) | |
| `name` | TEXT | NOT NULL | 'Personal' or 'Work' |
| `color` | TEXT | DEFAULT '#7b2fff' | UI Render color |
| `is_primary`| INTEGER | DEFAULT 0 | |

### Table: `calendar_events`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `calendar_id` | INTEGER | NOT NULL, FK ON DELETE CASCADE| |
| `title` | TEXT | NOT NULL | |
| `start_datetime`| DATETIME| NOT NULL | Meeting Start |
| `end_datetime` | DATETIME| NOT NULL | Meeting Over |
| `all_day` | INTEGER | DEFAULT 0 | |
| `status` | TEXT | DEFAULT 'confirmed' | |

### Table: `event_attendees` & `booking_links`
| Field Name | Type | Description |
|---|---|---|
| `event_id` | INTEGER FK | Parent meeting identifier |
| `email` | TEXT NOT NULL | Target inbox for SMTP request |
| `status` | TEXT ('pending')| Have they RSVP'd? |
| `slug` (Booking)| TEXT UNIQUE | /book/my-custom-name url |
| `duration_mins` | INTEGER | 30, 45, 60 min blocks |

---

## 5. EXTERNAL CRM & SYNC LOGS

### Table: `crm_mappings`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `workspace_id`| INTEGER | NOT NULL, FK -> workspaces | |
| `provider` | TEXT | NOT NULL | ('salesforce', 'hubspot') |
| `field_mappings`| TEXT | NOT NULL | Complex JSON schema map |
| `is_connected`| INTEGER | DEFAULT 0 | OAuth validator |

### Table: `crm_sync_log`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `provider` | TEXT | NOT NULL | The integration utilized |
| `status` | TEXT | NOT NULL | Success/Fail string |
| `message` | TEXT | NOT NULL | HTTP Output Payload |

---

## 6. PLATFORM INFRASTRUCTURE (SUPER ADMIN)

### Table: `ai_models`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `name` | TEXT | NOT NULL | 'Gemini 1.5 Flash' |
| `type` | TEXT | NOT NULL | System API Router Switch |
| `vram_gb` | REAL | DEFAULT 0 | Hardware cost config |
| `status` | TEXT | DEFAULT 'deployed' | Toggled via Admin UI |
| `accuracy` | REAL | DEFAULT 0 | Metric tracked score |
| `latency_ms`| INTEGER | DEFAULT 0 | Ping time log |
| `calls_30d` | INTEGER | DEFAULT 0 | Volume usage monitor |

### Table: `engine_config`
| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `key` | TEXT | UNIQUE, NOT NULL | Setting (ex: OPENAI_KEY) |
| `value` | TEXT | NOT NULL | Vault encrypted Hash |
