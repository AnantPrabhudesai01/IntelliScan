# IntelliScan — Comprehensive Data Dictionary

This document fulfills the final requirement for **Section 3.5: Data Dictionary**. It maps the exact schema, data types, primary/foreign keys, and constraint properties of the IntelliScan SQLite database powering the entire application.

---

## 1. Core Identity & Security

### Table: `users`
**Description**: Primary identity store for authentication and tier assignment.
| Field Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Unique identifier for registered users. |
| `email` | TEXT | UNIQUE, NOT NULL | Primary login handler. |
| `password_hash` | TEXT | NOT NULL | Bcrypt hashed secure password. |
| `role` | TEXT | DEFAULT 'user' | RBAC control ('user', 'business_admin', 'super_admin'). |
| `tier` | TEXT | DEFAULT 'personal' | Subscription level ('personal', 'enterprise'). |
| `name` | TEXT | Nullable | Real name of the profile user. |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp. |

### Table: `user_quotas`
**Description**: Tracks point consumption for rate-limiting AI usage based on the user's `tier`.
| Field Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Unique sequence identifier. |
| `user_id` | INTEGER | UNIQUE, FK -> users(id) | The owner of the quota. |
| `scans_total` | INTEGER | NOT NULL | Maximum allowed Single AI scans. |
| `scans_used` | INTEGER | DEFAULT 0 | Count of single scans executed. |
| `group_scans_total` | INTEGER | NOT NULL | Maximum allowed Batch Group scans. |
| `group_scans_used`| INTEGER | DEFAULT 0 | Count of bulk scans executed. |

---

## 2. Contact Management & Network

### Table: `contacts`
**Description**: The main CRM rolodex storing AI-extracted digital card logic.
| Field Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Unique identifier for the extracted lead. |
| `user_id` | INTEGER | FK -> users(id) | The owner who scanned the card. |
| `workspace_id`| INTEGER | Nullable, FK -> workspaces(id)| Enterprise grouping ID if shared. |
| `scan_date` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When the LLM successfully extracted the JSON. |
| `image_url` | TEXT | Nullable | Cloud/local path to original physical card image. |
| `json_data` | TEXT | NOT NULL | Stringified JSON of parsed data (name, email, phone).|
| `deal_score` | REAL | DEFAULT 0.0 | Calculated AI lead priority score (0-100). |
| `is_deleted` | INTEGER | DEFAULT 0 | Soft deletion flag (1 = deleted, 0 = active). |

---

## 3. Artificial Intelligence Engine Management

### Table: `ai_models`
**Description**: Dynamic scaling configuration tracking the operational status of fallback LLMs.
| Field Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Unique engine configuration ID. |
| `name` | TEXT | NOT NULL | Human readable name (e.g., 'Gemini 1.5 Flash'). |
| `type` | TEXT | NOT NULL | System routing key ('gemini', 'openai', 'tesseract'). |
| `vram_gb` | REAL | DEFAULT 0 | Theoretical memory allocation cost. |
| `status` | TEXT | DEFAULT 'deployed' | Traffic routing flag ('deployed', 'paused', 'training').|
| `latency_ms` | INTEGER | DEFAULT 0 | Rolling average response time. |
| `calls_30d` | INTEGER | DEFAULT 0 | Number of invocations over a 30-day window. |

### Table: `engine_config`
**Description**: Encrypted storage for SuperAdmin platform-wide configuration settings and API Keys.
| Field Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Unique sequence identifier. |
| `key` | TEXT | UNIQUE, NOT NULL | Config parameter string (e.g., 'OPENAI_API_KEY'). |
| `value` | TEXT | NOT NULL | The AES-encrypted API string or token. |

---

## 4. Calendar & Automations

### Table: `calendar_events`
**Description**: Core events table mapping to user dashboards.
| Field Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Unique scheduled event ticket ID. |
| `user_id` | INTEGER | FK -> users(id) | Meeting organizer. |
| `title` | TEXT | NOT NULL | Title of the event. |
| `description` | TEXT | Nullable | Body text (Often generated via Ghostwriter AI). |
| `start_datetime`| DATETIME | NOT NULL | Exact UNIX or ISO meeting start point. |
| `end_datetime`| DATETIME | NOT NULL | Exact ISO meeting conclusion point. |
| `status` | TEXT | DEFAULT 'confirmed' | State ('confirmed', 'cancelled'). |

### Table: `event_attendees`
**Description**: Mappings of external individuals invited to an event used for SMTP triggers.
| Field Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Relational array ID. |
| `event_id` | INTEGER | FK -> calendar_events(id) | ON DELETE CASCADE - The parent meeting. |
| `email` | TEXT | NOT NULL | Target inbox for Nodemailer dispatch. |
| `status` | TEXT | DEFAULT 'pending' | RSVP logic ('pending', 'accepted', 'declined'). |

---

## 5. Enterprise Collaboration

### Table: `workspaces`
**Description**: Parent table grouping multiple Enterprise admins/users into an 'Organization'.
| Field Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Unique Organization ID. |
| `name` | TEXT | NOT NULL | Business entity name (e.g., 'Acme Corp'). |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Instantiation date. |

### Table: `workspace_members`
**Description**: The pivot junction table resolving many-to-many RBAC access for workspaces.
| Field Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Sequential ID. |
| `workspace_id`| INTEGER | FK -> workspaces(id) | The joined organization. |
| `user_id` | INTEGER | FK -> users(id) | The team member. |
| `ws_role` | TEXT | DEFAULT 'member' | Internal permission ('owner', 'admin', 'member'). |

---

## 6. Marketing & Metrics

### Table: `email_sends`
**Description**: Granular tracking table for individual outbound marketing dispatches.
| Field Name | Data Type | Key / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto Increment | Outbound array ID. |
| `campaign_id` | INTEGER | FK -> email_campaigns(id) | The parent HTML campaign entity. |
| `email` | TEXT | NOT NULL | Target subscriber inbox. |
| `status` | TEXT | DEFAULT 'pending' | SMTP routing state ('sent', 'bounced'). |
| `open_count` | INTEGER | DEFAULT 0 | Triggered via embedded tracking GIF pixel log. |
| `click_count` | INTEGER | DEFAULT 0 | Link-hijacking redirect log occurrences. |
| `tracking_id` | TEXT | UNIQUE | Unpredictable uuid4 mapped to URL payloads. |
