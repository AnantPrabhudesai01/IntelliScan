# IntelliScan Data Dictionary (Detailed)

Generated: 2026-04-04
Source: `DATA_DICTIONARY_INTELLISCAN_DB.md` (extracted from `intelliscan-server/intelliscan.db`)

This document provides a human-readable data dictionary derived from the real database schema.
For the authoritative DDL, use: `DATA_DICTIONARY_INTELLISCAN_DB.md`.

---

## 1) Conventions

- PK: Primary key
- FK: Foreign key reference
- Defaults and enum-like comments are shown when available
- Many-to-many links are typically stored as join tables (e.g., list membership)

---

## 2) Table Index

- `ai_drafts`: AI-generated follow-up drafts linked to contacts.
- `ai_models`: AI model registry and deploy/training/paused status flags.
- `analytics_logs`: Analytics events and usage telemetry.
- `api_sandbox_calls`: Sandbox/test API call logs from the API explorer tools.
- `audit_trail`: Immutable-ish audit trail for sensitive actions (exports, policy changes, billing).
- `availability_slots`: Availability windows used for booking.
- `billing_invoices`: Table used by IntelliScan features (purpose not annotated).
- `billing_orders`: Table used by IntelliScan features (purpose not annotated).
- `billing_payment_methods`: Table used by IntelliScan features (purpose not annotated).
- `booking_links`: Public booking links that map to availability.
- `calendar_events`: Calendar events, including recurring rules and attendees.
- `calendar_shares`: Sharing tokens for calendar access.
- `calendars`: Calendars owned by users/workspaces for scheduling.
- `campaign_recipients`: Denormalized recipient lists for campaign sends.
- `contact_relationships`: Relationship intelligence between contacts (mutuals, org mapping).
- `contact_sequences`: Enrollment records linking contacts to sequences.
- `contacts`: Core CRM entity created from scans. Stores extracted fields, enrichment fields, deal/pipeline fields, and multilingual/native-script fields.
- `crm_mappings`: Legacy/simple CRM mapping storage (older schema variant).
- `crm_sync_log`: CRM sync activity log for exports and provider status.
- `data_quality_dedupe_queue`: Queue of dedupe candidates for workspace admin review (merge/dismiss).
- `deals`: Pipeline stage/value metadata tied to contacts.
- `digital_cards`: Public-facing digital business cards and their analytics.
- `email_automations`: Automation rules for email marketing workflows.
- `email_campaigns`: Email campaigns (subject/body) for outbound marketing.
- `email_clicks`: Per-send click tracking events.
- `email_list_contacts`: Membership table linking contacts/emails to lists.
- `email_lists`: Named contact lists used as campaign audiences.
- `email_sends`: Per-recipient send records (opens, statuses).
- `email_sequence_steps`: Steps for a sequence (delays, content).
- `email_sequences`: Multi-step outreach sequences.
- `email_templates`: Reusable email templates for campaigns and sequences.
- `engine_config`: Engine configuration parameters (limits, toggles, model selection).
- `event_attendees`: Attendees for events and meetings.
- `event_contact_links`: Join table linking events and contacts.
- `event_reminders`: Reminder configuration records for events.
- `events`: Events and campaigns to group scanned contacts (trade shows, conferences).
- `integration_sync_jobs`: Integration sync jobs (failed syncs, retries, provider health).
- `model_versions`: Model version history and rollback support.
- `onboarding_prefs`: Onboarding preferences captured during first run.
- `platform_incidents`: Super admin incident records (status, ack/resolve).
- `routing_rules`: Lead routing if/then rules applied to contacts.
- `saved_cards`: Saved card designs or OCR artifacts (implementation dependent).
- `sessions`: Active sessions for signed-in devices. Used for session listing and revocation.
- `user_quotas`: Per-user usage counters and monthly cycle quota limits for scans and group scans.
- `users`: User accounts with role and subscription tier. Workspace membership is represented via workspace_id.
- `webhooks`: Webhook endpoints for on_scan / on_deal_update notifications.
- `workspace_chats`: Workspace chat message storage (with socket.io).
- `workspace_policies`: Compliance policies per workspace scope (retention, PII redaction, audit strictness).

---

## 3) Tables (Detailed)

### Table: `ai_drafts`

AI-generated follow-up drafts linked to contacts.

Primary key: `id`

| Column          | Type     | Constraints               | Description                                      |
| --------------- | -------- | ------------------------- | ------------------------------------------------ |
| `id`            | INTEGER  | PK                        | Primary key identifier.                          |
| `user_id`       | INTEGER  |                           | Foreign key reference to users.id (actor/owner). |
| `contact_id`    | INTEGER  |                           |                                                  |
| `contact_name`  | TEXT     |                           |                                                  |
| `subject`       | TEXT     |                           |                                                  |
| `body`          | TEXT     |                           |                                                  |
| `status`        | TEXT     | DEFAULT 'draft'           | Workflow status for this record.                 |
| `created_at`    | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |
| `contact_email` | TEXT     |                           |                                                  |
| `tone`          | TEXT     | DEFAULT 'professional'    |                                                  |
| `version`       | INTEGER  | DEFAULT 1                 |                                                  |
| `sent_at`       | DATETIME |                           | Timestamp field.                                 |

---

### Table: `ai_models`

AI model registry and deploy/training/paused status flags.

Primary key: `id`

| Column       | Type       | Constraints               | Description                      |
| ------------ | ---------- | ------------------------- | -------------------------------- |
| `id`         | INTEGER    | PK                        | Primary key identifier.          |
| `name`       | TEXT       | NOT NULL                  | Human-readable name/title.       |
| `status`     | TEXT       | DEFAULT 'deployed'        | Workflow status for this record. |
| `training`   |            |                           |                                  |
| `paused`     | ACCURACY   |                           |                                  |
| `latency_ms` | INTEGER    |                           |                                  |
| `calls_30d`  | INTEGER    | DEFAULT 0                 |                                  |
| `vram_gb`    | REAL       |                           |                                  |
| `type`       | TEXT       | NOT NULL                  |                                  |
| `openai`     |            |                           |                                  |
| `tesseract`  |            |                           |                                  |
| `custom`     | CREATED_AT | DEFAULT CURRENT_TIMESTAMP |                                  |
| `updated_at` | DATETIME   | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                 |

---

### Table: `analytics_logs`

Analytics events and usage telemetry.

Primary key: `id`

| Column        | Type     | Constraints               | Description             |
| ------------- | -------- | ------------------------- | ----------------------- |
| `id`          | INTEGER  | PK                        | Primary key identifier. |
| `user_role`   | TEXT     | DEFAULT 'anonymous'       |                         |
| `user_email`  | TEXT     |                           |                         |
| `action`      | TEXT     |                           |                         |
| `path`        | TEXT     |                           |                         |
| `duration_ms` | INTEGER  |                           |                         |
| `timestamp`   | DATETIME | DEFAULT CURRENT_TIMESTAMP |                         |

---

### Table: `api_sandbox_calls`

Sandbox/test API call logs from the API explorer tools.

Primary key: `id`

| Column        | Type     | Constraints               | Description                                      |
| ------------- | -------- | ------------------------- | ------------------------------------------------ |
| `id`          | INTEGER  | PK                        | Primary key identifier.                          |
| `user_id`     | INTEGER  |                           | Foreign key reference to users.id (actor/owner). |
| `payload`     | TEXT     |                           |                                                  |
| `response`    | TEXT     |                           |                                                  |
| `status_code` | INTEGER  |                           |                                                  |
| `latency_ms`  | INTEGER  |                           |                                                  |
| `engine`      | TEXT     |                           |                                                  |
| `timestamp`   | DATETIME | DEFAULT CURRENT_TIMESTAMP |                                                  |

---

### Table: `audit_trail`

Immutable-ish audit trail for sensitive actions (exports, policy changes, billing).

Primary key: `id`

| Column          | Type     | Constraints               | Description                      |
| --------------- | -------- | ------------------------- | -------------------------------- |
| `id`            | INTEGER  | PK                        | Primary key identifier.          |
| `actor_user_id` | INTEGER  |                           |                                  |
| `actor_email`   | TEXT     |                           |                                  |
| `actor_role`    | TEXT     |                           |                                  |
| `action`        | TEXT     | NOT NULL                  |                                  |
| `resource`      | TEXT     |                           |                                  |
| `status`        | TEXT     | DEFAULT 'SUCCESS'         | Workflow status for this record. |
| `ip_address`    | TEXT     |                           |                                  |
| `user_agent`    | TEXT     |                           |                                  |
| `details_json`  | TEXT     |                           | JSON-encoded payload.            |
| `created_at`    | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                 |

---

### Table: `availability_slots`

Availability windows used for booking.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(user_id) REFERENCES users(id)`

| Column         | Type    | Constraints | Description                                      |
| -------------- | ------- | ----------- | ------------------------------------------------ |
| `id`           | INTEGER | PK          | Primary key identifier.                          |
| `user_id`      | INTEGER | NOT NULL    | Foreign key reference to users.id (actor/owner). |
| `day_of_week`  | INTEGER | NOT NULL    |                                                  |
| `start_time`   | TEXT    | NOT NULL    |                                                  |
| `end_time`     | TEXT    | NOT NULL    |                                                  |
| `is_available` | INTEGER | DEFAULT 1   |                                                  |

---

### Table: `billing_invoices`

Table used by IntelliScan features (purpose not annotated).

Primary key: `id`

| Column           | Type     | Constraints               | Description                                        |
| ---------------- | -------- | ------------------------- | -------------------------------------------------- |
| `id`             | INTEGER  | PK                        | Primary key identifier.                            |
| `workspace_id`   | INTEGER  | NOT NULL                  | Workspace identifier (organization scope).         |
| `invoice_number` | TEXT     | UNIQUE                    |                                                    |
| `amount_cents`   | INTEGER  | DEFAULT 0                 | Monetary amount (minor units depending on column). |
| `currency`       | TEXT     | DEFAULT 'USD'             | Currency code (e.g., INR).                         |
| `status`         | TEXT     | DEFAULT 'paid'            | Workflow status for this record.                   |
| `issued_at`      | DATETIME |                           | Timestamp field.                                   |
| `receipt_url`    | TEXT     |                           | URL or link string.                                |
| `created_at`     | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                   |
| `updated_at`     | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                   |

---

### Table: `billing_orders`

Table used by IntelliScan features (purpose not annotated).

Primary key: `id`

Table constraints:
- `UNIQUE(razorpay_order_id)`

| Column                | Type      | Constraints               | Description                                        |
| --------------------- | --------- | ------------------------- | -------------------------------------------------- |
| `id`                  | INTEGER   | PK                        | Primary key identifier.                            |
| `user_id`             | INTEGER   | NOT NULL                  | Foreign key reference to users.id (actor/owner).   |
| `workspace_id`        | INTEGER   | NOT NULL                  | Workspace identifier (organization scope).         |
| `plan_id`             | TEXT      | NOT NULL                  |                                                    |
| `amount_paise`        | INTEGER   | NOT NULL                  | Monetary amount (minor units depending on column). |
| `currency`            | TEXT      | DEFAULT 'INR'             | Currency code (e.g., INR).                         |
| `razorpay_order_id`   | TEXT      |                           | Order id returned by Razorpay Orders API.          |
| `razorpay_payment_id` | TEXT      |                           | Payment id returned by Razorpay Checkout.          |
| `razorpay_signature`  | TEXT      |                           | Signature used for server-side verification.       |
| `status`              | TEXT      | DEFAULT 'created'         | Workflow status for this record.                   |
| `paid`                |           |                           |                                                    |
| `failed`              | SIMULATED | DEFAULT 0                 |                                                    |
| `created_at`          | DATETIME  | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                   |
| `updated_at`          | DATETIME  | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                   |

---

### Table: `billing_payment_methods`

Table used by IntelliScan features (purpose not annotated).

Primary key: `id`

| Column         | Type     | Constraints               | Description                                |
| -------------- | -------- | ------------------------- | ------------------------------------------ |
| `id`           | INTEGER  | PK                        | Primary key identifier.                    |
| `workspace_id` | INTEGER  | NOT NULL                  | Workspace identifier (organization scope). |
| `brand`        | TEXT     | DEFAULT 'card'            |                                            |
| `last4`        | TEXT     | NOT NULL                  |                                            |
| `exp_month`    | INTEGER  | NOT NULL                  |                                            |
| `exp_year`     | INTEGER  | NOT NULL                  |                                            |
| `holder_name`  | TEXT     |                           |                                            |
| `is_primary`   | INTEGER  | DEFAULT 0                 |                                            |
| `is_backup`    | INTEGER  | DEFAULT 0                 |                                            |
| `created_at`   | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                           |
| `updated_at`   | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                           |

---

### Table: `booking_links`

Public booking links that map to availability.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(user_id) REFERENCES users(id)`

| Column                 | Type     | Constraints               | Description                                      |
| ---------------------- | -------- | ------------------------- | ------------------------------------------------ |
| `id`                   | INTEGER  | PK                        | Primary key identifier.                          |
| `user_id`              | INTEGER  | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `slug`                 | TEXT     | NOT NULL, UNIQUE          |                                                  |
| `title`                | TEXT     | NOT NULL                  |                                                  |
| `description`          | TEXT     |                           |                                                  |
| `duration_minutes`     | INTEGER  | DEFAULT 30                |                                                  |
| `buffer_minutes`       | INTEGER  | DEFAULT 0                 |                                                  |
| `max_bookings_per_day` | INTEGER  | DEFAULT 8                 |                                                  |
| `color`                | TEXT     | DEFAULT '#7b2fff'         |                                                  |
| `questions`            | TEXT     |                           |                                                  |
| `is_active`            | INTEGER  | DEFAULT 1                 |                                                  |
| `created_at`           | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `calendar_events`

Calendar events, including recurring rules and attendees.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(calendar_id) REFERENCES calendars(id) ON DELETE CASCADE`
- `FOREIGN KEY(user_id) REFERENCES users(id)`

| Column                   | Type     | Constraints               | Description                                      |
| ------------------------ | -------- | ------------------------- | ------------------------------------------------ |
| `id`                     | INTEGER  | PK                        | Primary key identifier.                          |
| `calendar_id`            | INTEGER  | NOT NULL                  |                                                  |
| `user_id`                | INTEGER  | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `title`                  | TEXT     | NOT NULL                  |                                                  |
| `description`            | TEXT     |                           |                                                  |
| `location`               | TEXT     |                           |                                                  |
| `start_datetime`         | DATETIME | NOT NULL                  |                                                  |
| `end_datetime`           | DATETIME | NOT NULL                  |                                                  |
| `all_day`                | INTEGER  | DEFAULT 0                 |                                                  |
| `color`                  | TEXT     |                           |                                                  |
| `status`                 | TEXT     | DEFAULT 'confirmed'       | Workflow status for this record.                 |
| `visibility`             | TEXT     | DEFAULT 'default'         |                                                  |
| `recurrence_rule`        | TEXT     |                           |                                                  |
| `recurrence_id`          | TEXT     |                           |                                                  |
| `original_start`         | DATETIME |                           |                                                  |
| `is_recurring_exception` | INTEGER  | DEFAULT 0                 |                                                  |
| `parent_event_id`        | INTEGER  |                           |                                                  |
| `conference_link`        | TEXT     |                           |                                                  |
| `conference_type`        | TEXT     |                           |                                                  |
| `timezone`               | TEXT     | DEFAULT 'UTC'             |                                                  |
| `created_at`             | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |
| `updated_at`             | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `calendar_shares`

Sharing tokens for calendar access.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(calendar_id) REFERENCES calendars(id) ON DELETE CASCADE`

| Column                | Type     | Constraints               | Description             |
| --------------------- | -------- | ------------------------- | ----------------------- |
| `id`                  | INTEGER  | PK                        | Primary key identifier. |
| `calendar_id`         | INTEGER  | NOT NULL                  |                         |
| `shared_with_email`   | TEXT     | NOT NULL                  |                         |
| `shared_with_user_id` | INTEGER  |                           |                         |
| `permission`          | TEXT     | DEFAULT 'view'            |                         |
| `accepted`            | INTEGER  | DEFAULT 0                 |                         |
| `share_token`         | TEXT     | UNIQUE                    |                         |
| `created_at`          | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.        |

---

### Table: `calendars`

Calendars owned by users/workspaces for scheduling.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(user_id) REFERENCES users(id)`

| Column         | Type     | Constraints               | Description                                      |
| -------------- | -------- | ------------------------- | ------------------------------------------------ |
| `id`           | INTEGER  | PK                        | Primary key identifier.                          |
| `user_id`      | INTEGER  | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `workspace_id` | INTEGER  |                           | Workspace identifier (organization scope).       |
| `name`         | TEXT     | NOT NULL                  | Human-readable name/title.                       |
| `description`  | TEXT     |                           |                                                  |
| `color`        | TEXT     | DEFAULT '#7b2fff'         |                                                  |
| `is_primary`   | INTEGER  | DEFAULT 0                 |                                                  |
| `is_shared`    | INTEGER  | DEFAULT 0                 |                                                  |
| `shared_with`  | TEXT     |                           |                                                  |
| `timezone`     | TEXT     | DEFAULT 'UTC'             |                                                  |
| `is_visible`   | INTEGER  | DEFAULT 1                 |                                                  |
| `type`         | TEXT     | DEFAULT 'personal'        |                                                  |
| `created_at`   | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `campaign_recipients`

Denormalized recipient lists for campaign sends.

Primary key: `id`

| Column                | Type     | Constraints               | Description                      |
| --------------------- | -------- | ------------------------- | -------------------------------- |
| `id`                  | INTEGER  | PK                        | Primary key identifier.          |
| `campaign_id`         | INTEGER  | NOT NULL                  |                                  |
| `contact_id`          | INTEGER  |                           |                                  |
| `email`               | TEXT     |                           | Email address.                   |
| `status`              | TEXT     | DEFAULT 'queued'          | Workflow status for this record. |
| `provider_message_id` | TEXT     |                           |                                  |
| `error_message`       | TEXT     |                           |                                  |
| `sent_at`             | DATETIME |                           | Timestamp field.                 |
| `created_at`          | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                 |

---

### Table: `contact_relationships`

Relationship intelligence between contacts (mutuals, org mapping).

Primary key: `id`

Table constraints:
- `UNIQUE(from_contact_id, to_contact_id, type)`

| Column            | Type       | Constraints               | Description             |
| ----------------- | ---------- | ------------------------- | ----------------------- |
| `id`              | INTEGER    | PK                        | Primary key identifier. |
| `from_contact_id` | INTEGER    |                           |                         |
| `to_contact_id`   | INTEGER    |                           |                         |
| `type`            | TEXT       |                           |                         |
| `colleague`       |            |                           |                         |
| `introduced_by`   | CREATED_AT | DEFAULT CURRENT_TIMESTAMP |                         |

---

### Table: `contact_sequences`

Enrollment records linking contacts to sequences.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE`
- `FOREIGN KEY(sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE`

| Column         | Type               | Constraints               | Description                      |
| -------------- | ------------------ | ------------------------- | -------------------------------- |
| `id`           | INTEGER            | PK                        | Primary key identifier.          |
| `contact_id`   | INTEGER            | NOT NULL                  |                                  |
| `sequence_id`  | INTEGER            | NOT NULL                  |                                  |
| `status`       | TEXT               | DEFAULT 'active'          | Workflow status for this record. |
| `completed`    |                    |                           |                                  |
| `stopped`      | CURRENT_STEP_INDEX | DEFAULT 0                 |                                  |
| `next_send_at` | DATETIME           |                           | Timestamp field.                 |
| `created_at`   | DATETIME           | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                 |

---

### Table: `contacts`

Core CRM entity created from scans. Stores extracted fields, enrichment fields, deal/pipeline fields, and multilingual/native-script fields.

Primary key: `id`

| Column               | Type     | Constraints               | Description                                                                                           |
| -------------------- | -------- | ------------------------- | ----------------------------------------------------------------------------------------------------- |
| `id`                 | INTEGER  | PK                        | Primary key identifier.                                                                               |
| `user_id`            | INTEGER  |                           | Foreign key reference to users.id (actor/owner).                                                      |
| `name`               | TEXT     |                           | Human-readable name/title.                                                                            |
| `email`              | TEXT     |                           | Email address.                                                                                        |
| `phone`              | TEXT     |                           |                                                                                                       |
| `company`            | TEXT     |                           |                                                                                                       |
| `job_title`          | TEXT     |                           |                                                                                                       |
| `confidence`         | INTEGER  | DEFAULT 95                |                                                                                                       |
| `scan_date`          | DATETIME | DEFAULT CURRENT_TIMESTAMP |                                                                                                       |
| `image_url`          | TEXT     |                           | URL or link string.                                                                                   |
| `notes`              | TEXT     |                           |                                                                                                       |
| `tags`               | TEXT     |                           |                                                                                                       |
| `event_id`           | INTEGER  |                           |                                                                                                       |
| `inferred_industry`  | TEXT     |                           |                                                                                                       |
| `inferred_seniority` | TEXT     |                           |                                                                                                       |
| `workspace_scope`    | INTEGER  |                           | Workspace scope identifier used for workspace-wide queries (derived from workspace_id or user scope). |
| `crm_synced`         | INTEGER  | DEFAULT 0                 | 1 if the contact has been synced/exported to the configured CRM provider.                             |
| `crm_synced_at`      | DATETIME |                           | Timestamp field.                                                                                      |
| `engine_used`        | TEXT     |                           |                                                                                                       |
| `deal_score`         | INTEGER  | DEFAULT 0                 |                                                                                                       |
| `deal_status`        | TEXT     | DEFAULT 'None'            |                                                                                                       |
| `linkedin_url`       | TEXT     |                           | URL or link string.                                                                                   |
| `linkedin_photo`     | TEXT     |                           |                                                                                                       |
| `linkedin_bio`       | TEXT     |                           |                                                                                                       |
| `ai_enrichment_news` | TEXT     |                           |                                                                                                       |
| `search_vector`      | TEXT     |                           | Text blob used for semantic search / indexing (implementation-dependent).                             |
| `name_native`        | TEXT     |                           | Name preserved in original script when card is non-Latin.                                             |
| `company_native`     | TEXT     |                           | Company preserved in original script when card is non-Latin.                                          |
| `title_native`       | TEXT     |                           | Title preserved in original script when card is non-Latin.                                            |
| `detected_language`  | TEXT     |                           | Primary detected language for the business card text.                                                 |

---

### Table: `crm_mappings`

Legacy/simple CRM mapping storage (older schema variant).

Primary key: `user_id`

| Column         | Type    | Constraints | Description                                      |
| -------------- | ------- | ----------- | ------------------------------------------------ |
| `user_id`      | INTEGER | PK          | Foreign key reference to users.id (actor/owner). |
| `provider`     | TEXT    |             |                                                  |
| `mapping_json` | TEXT    |             | JSON-encoded payload.                            |

---

### Table: `crm_sync_log`

CRM sync activity log for exports and provider status.

Primary key: `id`

| Column         | Type     | Constraints               | Description                                |
| -------------- | -------- | ------------------------- | ------------------------------------------ |
| `id`           | INTEGER  | PK                        | Primary key identifier.                    |
| `workspace_id` | INTEGER  | NOT NULL                  | Workspace identifier (organization scope). |
| `provider`     | TEXT     | NOT NULL                  |                                            |
| `status`       | TEXT     | NOT NULL                  | Workflow status for this record.           |
| `message`      | TEXT     | NOT NULL                  |                                            |
| `created_at`   | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                           |

---

### Table: `data_quality_dedupe_queue`

Queue of dedupe candidates for workspace admin review (merge/dismiss).

Primary key: `id`

Table constraints:
- `UNIQUE(workspace_id, fingerprint)`

| Column               | Type              | Constraints               | Description                                |
| -------------------- | ----------------- | ------------------------- | ------------------------------------------ |
| `id`                 | INTEGER           | PK                        | Primary key identifier.                    |
| `workspace_id`       | INTEGER           | NOT NULL                  | Workspace identifier (organization scope). |
| `fingerprint`        | TEXT              | NOT NULL                  |                                            |
| `contact_ids_json`   | TEXT              | NOT NULL                  | JSON-encoded payload.                      |
| `primary_contact_id` | INTEGER           |                           |                                            |
| `reason`             | TEXT              |                           |                                            |
| `confidence`         | INTEGER           | DEFAULT 80                |                                            |
| `status`             | TEXT              | DEFAULT 'pending'         | Workflow status for this record.           |
| `merged`             |                   |                           |                                            |
| `dismissed`          | MERGED_CONTACT_ID |                           |                                            |
| `resolved_by`        | INTEGER           |                           |                                            |
| `resolution_note`    | TEXT              |                           |                                            |
| `created_at`         | DATETIME          | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                           |
| `updated_at`         | DATETIME          | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                           |

---

### Table: `deals`

Pipeline stage/value metadata tied to contacts.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(contact_id) REFERENCES contacts(id) ON DELETE CASCADE`
- `FOREIGN KEY(user_id) REFERENCES users(id)`

| Column           | Type     | Constraints               | Description                                      |
| ---------------- | -------- | ------------------------- | ------------------------------------------------ |
| `id`             | INTEGER  | PK                        | Primary key identifier.                          |
| `contact_id`     | INTEGER  | NOT NULL                  |                                                  |
| `user_id`        | INTEGER  | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `workspace_id`   | INTEGER  |                           | Workspace identifier (organization scope).       |
| `stage`          | TEXT     | DEFAULT 'Prospect'        |                                                  |
| `Qualified`      |          |                           |                                                  |
| `Proposal`       |          |                           |                                                  |
| `Closed`         | VALUE    | DEFAULT 0                 |                                                  |
| `expected_close` | DATETIME |                           |                                                  |
| `notes`          | TEXT     |                           |                                                  |
| `created_at`     | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |
| `updated_at`     | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `digital_cards`

Public-facing digital business cards and their analytics.

Primary key: `id`

| Column        | Type    | Constraints      | Description                                      |
| ------------- | ------- | ---------------- | ------------------------------------------------ |
| `id`          | INTEGER | PK               | Primary key identifier.                          |
| `user_id`     | INTEGER |                  | Foreign key reference to users.id (actor/owner). |
| `url_slug`    | TEXT    | UNIQUE           | URL or link string.                              |
| `views`       | INTEGER | DEFAULT 0        |                                                  |
| `saves`       | INTEGER | DEFAULT 0        |                                                  |
| `theme_color` | TEXT    | DEFAULT 'indigo' |                                                  |
| `design_json` | TEXT    |                  | JSON-encoded payload.                            |
| `headline`    | TEXT    |                  |                                                  |

---

### Table: `email_automations`

Automation rules for email marketing workflows.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(user_id) REFERENCES users(id)`

| Column           | Type     | Constraints               | Description                                      |
| ---------------- | -------- | ------------------------- | ------------------------------------------------ |
| `id`             | INTEGER  | PK                        | Primary key identifier.                          |
| `user_id`        | INTEGER  | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `name`           | TEXT     | NOT NULL                  | Human-readable name/title.                       |
| `trigger_type`   | TEXT     | NOT NULL                  |                                                  |
| `trigger_config` | TEXT     |                           |                                                  |
| `status`         | TEXT     | DEFAULT 'inactive'        | Workflow status for this record.                 |
| `steps`          | TEXT     | NOT NULL                  |                                                  |
| `created_at`     | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `email_campaigns`

Email campaigns (subject/body) for outbound marketing.

Primary key: `id`

| Column             | Type     | Constraints               | Description                                      |
| ------------------ | -------- | ------------------------- | ------------------------------------------------ |
| `id`               | INTEGER  | PK                        | Primary key identifier.                          |
| `user_id`          | INTEGER  |                           | Foreign key reference to users.id (actor/owner). |
| `name`             | TEXT     |                           | Human-readable name/title.                       |
| `subject`          | TEXT     |                           |                                                  |
| `body`             | TEXT     |                           |                                                  |
| `target_industry`  | TEXT     |                           |                                                  |
| `target_seniority` | TEXT     |                           |                                                  |
| `sent_count`       | INTEGER  | DEFAULT 0                 |                                                  |
| `open_rate`        | INTEGER  | DEFAULT 0                 |                                                  |
| `click_rate`       | INTEGER  | DEFAULT 0                 |                                                  |
| `delivered_count`  | INTEGER  | DEFAULT 0                 |                                                  |
| `failed_count`     | INTEGER  | DEFAULT 0                 |                                                  |
| `send_mode`        | TEXT     | DEFAULT 'simulated'       |                                                  |
| `created_at`       | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |
| `preview_text`     | TEXT     |                           |                                                  |
| `from_name`        | TEXT     |                           |                                                  |
| `from_email`       | TEXT     |                           |                                                  |
| `reply_to`         | TEXT     |                           |                                                  |
| `html_body`        | TEXT     |                           |                                                  |
| `text_body`        | TEXT     |                           |                                                  |
| `template_id`      | INTEGER  |                           |                                                  |
| `list_ids`         | TEXT     |                           |                                                  |
| `status`           | TEXT     | DEFAULT 'draft'           | Workflow status for this record.                 |
| `scheduled_at`     | DATETIME |                           | Timestamp field.                                 |
| `sent_at`          | DATETIME |                           | Timestamp field.                                 |
| `total_recipients` | INTEGER  | DEFAULT 0                 |                                                  |
| `workspace_id`     | INTEGER  |                           | Workspace identifier (organization scope).       |

---

### Table: `email_clicks`

Per-send click tracking events.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(send_id) REFERENCES email_sends(id) ON DELETE CASCADE`

| Column        | Type     | Constraints               | Description             |
| ------------- | -------- | ------------------------- | ----------------------- |
| `id`          | INTEGER  | PK                        | Primary key identifier. |
| `send_id`     | INTEGER  | NOT NULL                  |                         |
| `campaign_id` | INTEGER  | NOT NULL                  |                         |
| `url`         | TEXT     | NOT NULL                  | URL or link string.     |
| `clicked_at`  | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.        |

---

### Table: `email_list_contacts`

Membership table linking contacts/emails to lists.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(list_id) REFERENCES email_lists(id) ON DELETE CASCADE`

| Column            | Type     | Constraints               | Description             |
| ----------------- | -------- | ------------------------- | ----------------------- |
| `id`              | INTEGER  | PK                        | Primary key identifier. |
| `list_id`         | INTEGER  | NOT NULL                  |                         |
| `contact_id`      | INTEGER  |                           |                         |
| `email`           | TEXT     | NOT NULL                  | Email address.          |
| `first_name`      | TEXT     |                           |                         |
| `last_name`       | TEXT     |                           |                         |
| `company`         | TEXT     |                           |                         |
| `subscribed`      | INTEGER  | DEFAULT 1                 |                         |
| `unsubscribed_at` | DATETIME |                           | Timestamp field.        |
| `added_at`        | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.        |

---

### Table: `email_lists`

Named contact lists used as campaign audiences.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(user_id) REFERENCES users(id)`

| Column          | Type     | Constraints               | Description                                      |
| --------------- | -------- | ------------------------- | ------------------------------------------------ |
| `id`            | INTEGER  | PK                        | Primary key identifier.                          |
| `workspace_id`  | INTEGER  |                           | Workspace identifier (organization scope).       |
| `user_id`       | INTEGER  | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `name`          | TEXT     | NOT NULL                  | Human-readable name/title.                       |
| `description`   | TEXT     |                           |                                                  |
| `type`          | TEXT     | DEFAULT 'static'          |                                                  |
| `segment_rules` | TEXT     |                           |                                                  |
| `contact_count` | INTEGER  | DEFAULT 0                 |                                                  |
| `created_at`    | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |
| `updated_at`    | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `email_sends`

Per-recipient send records (opens, statuses).

Primary key: `id`

Table constraints:
- `FOREIGN KEY(campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE`

| Column            | Type     | Constraints       | Description                      |
| ----------------- | -------- | ----------------- | -------------------------------- |
| `id`              | INTEGER  | PK                | Primary key identifier.          |
| `campaign_id`     | INTEGER  | NOT NULL          |                                  |
| `email`           | TEXT     | NOT NULL          | Email address.                   |
| `first_name`      | TEXT     |                   |                                  |
| `status`          | TEXT     | DEFAULT 'pending' | Workflow status for this record. |
| `sent_at`         | DATETIME |                   | Timestamp field.                 |
| `opened_at`       | DATETIME |                   | Timestamp field.                 |
| `open_count`      | INTEGER  | DEFAULT 0         |                                  |
| `clicked_at`      | DATETIME |                   | Timestamp field.                 |
| `click_count`     | INTEGER  | DEFAULT 0         |                                  |
| `bounced_at`      | DATETIME |                   | Timestamp field.                 |
| `bounce_reason`   | TEXT     |                   |                                  |
| `unsubscribed_at` | DATETIME |                   | Timestamp field.                 |
| `tracking_id`     | TEXT     | UNIQUE            |                                  |

---

### Table: `email_sequence_steps`

Steps for a sequence (delays, content).

Primary key: `id`

Table constraints:
- `FOREIGN KEY(sequence_id) REFERENCES email_sequences(id) ON DELETE CASCADE`

| Column        | Type    | Constraints | Description             |
| ------------- | ------- | ----------- | ----------------------- |
| `id`          | INTEGER | PK          | Primary key identifier. |
| `sequence_id` | INTEGER | NOT NULL    |                         |
| `order_index` | INTEGER | NOT NULL    |                         |
| `subject`     | TEXT    | NOT NULL    |                         |
| `html_body`   | TEXT    | NOT NULL    |                         |
| `delay_days`  | INTEGER | DEFAULT 0   |                         |

---

### Table: `email_sequences`

Multi-step outreach sequences.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(user_id) REFERENCES users(id)`

| Column     | Type       | Constraints               | Description                                      |
| ---------- | ---------- | ------------------------- | ------------------------------------------------ |
| `id`       | INTEGER    | PK                        | Primary key identifier.                          |
| `user_id`  | INTEGER    | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `name`     | TEXT       | NOT NULL                  | Human-readable name/title.                       |
| `status`   | TEXT       | DEFAULT 'active'          | Workflow status for this record.                 |
| `paused`   |            |                           |                                                  |
| `archived` | CREATED_AT | DEFAULT CURRENT_TIMESTAMP |                                                  |

---

### Table: `email_templates`

Reusable email templates for campaigns and sequences.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(user_id) REFERENCES users(id)`

| Column       | Type     | Constraints               | Description                                      |
| ------------ | -------- | ------------------------- | ------------------------------------------------ |
| `id`         | INTEGER  | PK                        | Primary key identifier.                          |
| `user_id`    | INTEGER  | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `name`       | TEXT     | NOT NULL                  | Human-readable name/title.                       |
| `subject`    | TEXT     | NOT NULL                  |                                                  |
| `html_body`  | TEXT     | NOT NULL                  |                                                  |
| `text_body`  | TEXT     |                           |                                                  |
| `category`   | TEXT     | DEFAULT 'general'         |                                                  |
| `thumbnail`  | TEXT     |                           |                                                  |
| `is_shared`  | INTEGER  | DEFAULT 0                 |                                                  |
| `variables`  | TEXT     |                           |                                                  |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `engine_config`

Engine configuration parameters (limits, toggles, model selection).

Primary key: `key`

| Column       | Type     | Constraints               | Description      |
| ------------ | -------- | ------------------------- | ---------------- |
| `key`        | TEXT     | PK                        |                  |
| `value`      | TEXT     |                           |                  |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field. |

---

### Table: `event_attendees`

Attendees for events and meetings.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE`

| Column           | Type     | Constraints       | Description                      |
| ---------------- | -------- | ----------------- | -------------------------------- |
| `id`             | INTEGER  | PK                | Primary key identifier.          |
| `event_id`       | INTEGER  | NOT NULL          |                                  |
| `email`          | TEXT     | NOT NULL          | Email address.                   |
| `name`           | TEXT     |                   | Human-readable name/title.       |
| `status`         | TEXT     | DEFAULT 'pending' | Workflow status for this record. |
| `is_organizer`   | INTEGER  | DEFAULT 0         |                                  |
| `response_token` | TEXT     | UNIQUE            |                                  |
| `responded_at`   | DATETIME |                   | Timestamp field.                 |
| `notified_at`    | DATETIME |                   | Timestamp field.                 |

---

### Table: `event_contact_links`

Join table linking events and contacts.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE`

| Column       | Type    | Constraints        | Description             |
| ------------ | ------- | ------------------ | ----------------------- |
| `id`         | INTEGER | PK                 | Primary key identifier. |
| `event_id`   | INTEGER | NOT NULL           |                         |
| `contact_id` | INTEGER | NOT NULL           |                         |
| `link_type`  | TEXT    | DEFAULT 'attendee' |                         |

---

### Table: `event_reminders`

Reminder configuration records for events.

Primary key: `id`

Table constraints:
- `FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE`

| Column           | Type     | Constraints     | Description                                      |
| ---------------- | -------- | --------------- | ------------------------------------------------ |
| `id`             | INTEGER  | PK              | Primary key identifier.                          |
| `event_id`       | INTEGER  | NOT NULL        |                                                  |
| `user_id`        | INTEGER  | NOT NULL        | Foreign key reference to users.id (actor/owner). |
| `method`         | TEXT     | DEFAULT 'email' |                                                  |
| `minutes_before` | INTEGER  | NOT NULL        |                                                  |
| `sent_at`        | DATETIME |                 | Timestamp field.                                 |

---

### Table: `events`

Events and campaigns to group scanned contacts (trade shows, conferences).

Primary key: `id`

| Column       | Type     | Constraints               | Description                                      |
| ------------ | -------- | ------------------------- | ------------------------------------------------ |
| `id`         | INTEGER  | PK                        | Primary key identifier.                          |
| `user_id`    | INTEGER  |                           | Foreign key reference to users.id (actor/owner). |
| `name`       | TEXT     |                           | Human-readable name/title.                       |
| `date`       | TEXT     |                           |                                                  |
| `location`   | TEXT     |                           |                                                  |
| `type`       | TEXT     |                           |                                                  |
| `status`     | TEXT     | DEFAULT 'active'          | Workflow status for this record.                 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `integration_sync_jobs`

Integration sync jobs (failed syncs, retries, provider health).

Primary key: `id`

| Column            | Type        | Constraints               | Description                                      |
| ----------------- | ----------- | ------------------------- | ------------------------------------------------ |
| `id`              | INTEGER     | PK                        | Primary key identifier.                          |
| `user_id`         | INTEGER     | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `workspace_id`    | INTEGER     |                           | Workspace identifier (organization scope).       |
| `provider`        | TEXT        | NOT NULL                  |                                                  |
| `contact_count`   | INTEGER     | DEFAULT 0                 |                                                  |
| `payload_json`    | TEXT        |                           | JSON-encoded payload.                            |
| `status`          | TEXT        | DEFAULT 'queued'          | Workflow status for this record.                 |
| `processing`      |             |                           |                                                  |
| `succeeded`       |             |                           |                                                  |
| `failed`          |             |                           |                                                  |
| `retry_queued`    | RETRY_COUNT | DEFAULT 0                 |                                                  |
| `max_retries`     | INTEGER     | DEFAULT 3                 |                                                  |
| `last_error`      | TEXT        |                           |                                                  |
| `last_attempt_at` | DATETIME    |                           | Timestamp field.                                 |
| `next_retry_at`   | DATETIME    |                           | Timestamp field.                                 |
| `succeeded_at`    | DATETIME    |                           | Timestamp field.                                 |
| `created_at`      | DATETIME    | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |
| `updated_at`      | DATETIME    | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `model_versions`

Model version history and rollback support.

Primary key: `id`

| Column           | Type     | Constraints               | Description                      |
| ---------------- | -------- | ------------------------- | -------------------------------- |
| `id`             | INTEGER  | PK                        | Primary key identifier.          |
| `version_tag`    | TEXT     |                           |                                  |
| `description`    | TEXT     |                           |                                  |
| `ocr_accuracy`   | REAL     |                           |                                  |
| `avg_latency_ms` | INTEGER  |                           |                                  |
| `status`         | TEXT     | DEFAULT 'standby'         | Workflow status for this record. |
| `created_at`     | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                 |

---

### Table: `onboarding_prefs`

Onboarding preferences captured during first run.

Primary key: `user_id`

| Column             | Type    | Constraints | Description                                      |
| ------------------ | ------- | ----------- | ------------------------------------------------ |
| `user_id`          | INTEGER | PK          | Foreign key reference to users.id (actor/owner). |
| `preferences_json` | TEXT    |             | JSON-encoded payload.                            |

---

### Table: `platform_incidents`

Super admin incident records (status, ack/resolve).

Primary key: `id`

| Column            | Type     | Constraints               | Description                      |
| ----------------- | -------- | ------------------------- | -------------------------------- |
| `id`              | INTEGER  | PK                        | Primary key identifier.          |
| `title`           | TEXT     | NOT NULL                  |                                  |
| `severity`        | TEXT     | DEFAULT 'medium'          |                                  |
| `service`         | TEXT     | NOT NULL                  |                                  |
| `status`          | TEXT     | DEFAULT 'open'            | Workflow status for this record. |
| `impact`          | TEXT     |                           |                                  |
| `acknowledged_by` | TEXT     |                           |                                  |
| `acknowledged_at` | DATETIME |                           | Timestamp field.                 |
| `created_at`      | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                 |
| `updated_at`      | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                 |

---

### Table: `routing_rules`

Lead routing if/then rules applied to contacts.

Primary key: `id`

| Column            | Type    | Constraints      | Description                                      |
| ----------------- | ------- | ---------------- | ------------------------------------------------ |
| `id`              | INTEGER | PK               | Primary key identifier.                          |
| `user_id`         | INTEGER |                  | Foreign key reference to users.id (actor/owner). |
| `condition_field` | TEXT    |                  |                                                  |
| `condition_op`    | TEXT    |                  |                                                  |
| `condition_val`   | TEXT    |                  |                                                  |
| `action`          | TEXT    |                  |                                                  |
| `target`          | TEXT    |                  |                                                  |
| `priority`        | TEXT    | DEFAULT 'medium' |                                                  |
| `is_active`       | INTEGER | DEFAULT 1        |                                                  |

---

### Table: `saved_cards`

Saved card designs or OCR artifacts (implementation dependent).

Primary key: `id`

Table constraints:
- `FOREIGN KEY(user_id) REFERENCES users(id)`

| Column        | Type     | Constraints               | Description                                      |
| ------------- | -------- | ------------------------- | ------------------------------------------------ |
| `id`          | INTEGER  | PK                        | Primary key identifier.                          |
| `user_id`     | INTEGER  | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `card_data`   | TEXT     | NOT NULL                  |                                                  |
| `design_data` | TEXT     | NOT NULL                  |                                                  |
| `created_at`  | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `sessions`

Active sessions for signed-in devices. Used for session listing and revocation.

Primary key: `id`

| Column        | Type     | Constraints               | Description                                      |
| ------------- | -------- | ------------------------- | ------------------------------------------------ |
| `id`          | INTEGER  | PK                        | Primary key identifier.                          |
| `user_id`     | INTEGER  |                           | Foreign key reference to users.id (actor/owner). |
| `token`       | TEXT     |                           | Opaque token used for authentication or sharing. |
| `device_info` | TEXT     |                           |                                                  |
| `ip_address`  | TEXT     |                           |                                                  |
| `location`    | TEXT     |                           |                                                  |
| `last_active` | DATETIME | DEFAULT CURRENT_TIMESTAMP |                                                  |
| `is_active`   | BOOLEAN  | DEFAULT 1                 |                                                  |

---

### Table: `user_quotas`

Per-user usage counters and monthly cycle quota limits for scans and group scans.

Primary key: `user_id`

| Column             | Type     | Constraints               | Description                                        |
| ------------------ | -------- | ------------------------- | -------------------------------------------------- |
| `user_id`          | INTEGER  | PK                        | Foreign key reference to users.id (actor/owner).   |
| `used_count`       | INTEGER  | DEFAULT 0                 |                                                    |
| `limit_amount`     | INTEGER  | DEFAULT 100               | Monetary amount (minor units depending on column). |
| `group_scans_used` | INTEGER  | DEFAULT 0                 |                                                    |
| `last_reset_date`  | DATETIME | DEFAULT CURRENT_TIMESTAMP |                                                    |

---

### Table: `users`

User accounts with role and subscription tier. Workspace membership is represented via workspace_id.

Primary key: `id`

| Column         | Type    | Constraints        | Description                                           |
| -------------- | ------- | ------------------ | ----------------------------------------------------- |
| `id`           | INTEGER | PK                 | Primary key identifier.                               |
| `name`         | TEXT    |                    | Human-readable name/title.                            |
| `email`        | TEXT    | UNIQUE             | Email address.                                        |
| `password`     | TEXT    |                    | Password hash (bcrypt). Stored server-side only.      |
| `role`         | TEXT    | DEFAULT 'user'     | Role used for access control (RBAC).                  |
| `workspace_id` | INTEGER |                    | Workspace identifier (organization scope).            |
| `tier`         | TEXT    | DEFAULT 'personal' | Subscription tier used for quotas and feature gating. |

---

### Table: `webhooks`

Webhook endpoints for on_scan / on_deal_update notifications.

Primary key: `id`

| Column           | Type      | Constraints               | Description                                      |
| ---------------- | --------- | ------------------------- | ------------------------------------------------ |
| `id`             | INTEGER   | PK                        | Primary key identifier.                          |
| `user_id`        | INTEGER   | NOT NULL                  | Foreign key reference to users.id (actor/owner). |
| `workspace_id`   | INTEGER   |                           | Workspace identifier (organization scope).       |
| `url`            | TEXT      | NOT NULL                  | URL or link string.                              |
| `event_type`     | TEXT      | DEFAULT 'on_scan'         |                                                  |
| `on_deal_update` | IS_ACTIVE | DEFAULT 1                 |                                                  |
| `created_at`     | DATETIME  | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                                 |

---

### Table: `workspace_chats`

Workspace chat message storage (with socket.io).

Primary key: `id`

| Column         | Type     | Constraints               | Description                                |
| -------------- | -------- | ------------------------- | ------------------------------------------ |
| `id`           | TEXT     | PK                        | Primary key identifier.                    |
| `workspace_id` | TEXT     |                           | Workspace identifier (organization scope). |
| `user_name`    | TEXT     |                           |                                            |
| `message`      | TEXT     |                           |                                            |
| `color`        | TEXT     |                           |                                            |
| `timestamp`    | DATETIME | DEFAULT CURRENT_TIMESTAMP |                                            |

---

### Table: `workspace_policies`

Compliance policies per workspace scope (retention, PII redaction, audit strictness).

Primary key: `workspace_id`

| Column                         | Type     | Constraints               | Description                                |
| ------------------------------ | -------- | ------------------------- | ------------------------------------------ |
| `workspace_id`                 | INTEGER  | PK                        | Workspace identifier (organization scope). |
| `retention_days`               | INTEGER  | DEFAULT 90                |                                            |
| `pii_redaction_enabled`        | INTEGER  | DEFAULT 1                 |                                            |
| `strict_audit_storage_enabled` | INTEGER  | DEFAULT 1                 |                                            |
| `updated_by`                   | INTEGER  |                           |                                            |
| `updated_at`                   | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp field.                           |

---
