# Prompt: IntelliScan Database Architecture Generator

**Instructions for the User:** 
Copy the entire text below the line and paste it directly into Claude Desktop. It contains all the necessary context, table structures, and instructions for Claude to generate a massive, highly detailed database architecture.

---

**[COPY BELOW THIS LINE AND PASTE INTO CLAUDE]**

You are an Expert Enterprise Database Architect and Technical Writer. 

Your task is to write a highly detailed, comprehensive **Database Architecture and Theoretical Schema Document** for my platform, **IntelliScan**. 

### Context about IntelliScan:
IntelliScan is an enterprise-grade SaaS CRM platform built with React, Vite, Node.js, Express, and SQLite. It provides multi-tenant (workspace) capabilities. Core features include:
1. **AI Business Card Scanning** (using Gemini, OpenAI, and Tesseract.js fallbacks).
2. **CRM Contact Management** with Org Charts and duplicate detection.
3. **Advanced Calendar & Booking** (recurring events, attendee tracking, public booking pages).
4. **Email Marketing Suite** (campaigns, templates, tracking 1x1 pixels, lists).
5. **AI Generative Tools** (auto-composing drafts, networking coach insights).
6. **Platform Operations** (Super Admin system incident tracking, granular RBAC, integration queue syncing, and audit trails).

### Instructions for the Document:
I need you to generate a robust, beautifully formatted markdown document that covers the database schema in extremely fine detail. Please include:

1. **Theoretical Data Model**
   - Provide an overarching theory on how the relational model supports the SaaS infrastructure. Explain the boundaries of the RBAC roles (`super_admin`, `business_admin`, `user`), the multi-tenant isolation methodology via `workspace_id`, and how tracking hooks (emails, clicks) flow back into the platform.

2. **Mermaid ER Diagrams**
   - Create at least **3 detailed `mermaid` erDiagram charts**. 
   - A core Master Diagram showing the primary flow between Users, Contacts, Emails, and Calendars.
   - A specialized diagram focusing exclusively on the Email Marketing Engine (Lists -> Campaigns -> Sends -> Clicks).
   - A specialized diagram focusing exclusively on the Admin/Integrations layer (Sync Jobs, Audits, Quality Queues).

3. **In-Depth Table Breakdowns**
   - For every table listed in the raw schema below, provide a detailed description. 
   - State the table's purpose.
   - Break down the core columns with expected data types and what they conceptually represent in the app (e.g., explain what `confidence` means in the contacts table, or what `workspace_scope` does).

### Raw Extracted Database Schema:
Please base your entire architectural thesis on the following exact SQLite schema extracted from our production backend:

```sql
-- Table: users
CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, email TEXT UNIQUE, password TEXT, role TEXT DEFAULT 'user',
        workspace_id INTEGER, tier TEXT DEFAULT 'personal');

-- Table: contacts
CREATE TABLE contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT, email TEXT,
        phone TEXT, company TEXT, job_title TEXT, scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        image_url TEXT, notes TEXT, tags TEXT, event_id INTEGER, inferred_industry TEXT, 
        inferred_seniority TEXT, confidence INTEGER DEFAULT 95, engine_used TEXT, 
        workspace_scope INTEGER, crm_synced INTEGER DEFAULT 0, crm_synced_at DATETIME);

-- Table: analytics_logs
CREATE TABLE analytics_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_role TEXT DEFAULT 'anonymous',
        user_email TEXT, action TEXT, path TEXT, duration_ms INTEGER, timestamp DATETIME);

-- Table: engine_config
CREATE TABLE engine_config (key TEXT PRIMARY KEY, value TEXT, updated_at DATETIME);

-- Table: model_versions
CREATE TABLE model_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, version_tag TEXT, description TEXT,
        ocr_accuracy REAL, avg_latency_ms INTEGER, status TEXT DEFAULT 'standby', created_at DATETIME);

-- Table: api_sandbox_calls
CREATE TABLE api_sandbox_calls (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, payload TEXT,
        response TEXT, status_code INTEGER, latency_ms INTEGER, engine TEXT, timestamp DATETIME);

-- Table: sessions
CREATE TABLE sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, token TEXT,
        device_info TEXT, ip_address TEXT, location TEXT, last_active DATETIME, is_active BOOLEAN);

-- Table: events
CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT, date TEXT,
        location TEXT, type TEXT, attendees_count INTEGER DEFAULT 0, status TEXT, created_at DATETIME);

-- Table: ai_drafts
CREATE TABLE ai_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, contact_id INTEGER,
        contact_name TEXT, subject TEXT, body TEXT, status TEXT DEFAULT 'draft',
        contact_email TEXT, tone TEXT DEFAULT 'professional', version INTEGER, sent_at DATETIME);

-- Table: workspace_chats
CREATE TABLE workspace_chats (
        id TEXT PRIMARY KEY, workspace_id TEXT, user_name TEXT, message TEXT,
        color TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);

-- Table: digital_cards
CREATE TABLE digital_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER UNIQUE, url_slug TEXT UNIQUE,
        views INTEGER DEFAULT 0, saves INTEGER DEFAULT 0, theme_color TEXT DEFAULT 'indigo', 
        design_json TEXT, bio TEXT, headline TEXT);

-- Table: user_quotas
CREATE TABLE user_quotas (
        user_id INTEGER PRIMARY KEY, used_count INTEGER DEFAULT 0, limit_amount INTEGER DEFAULT 100, 
        group_scans_used INTEGER DEFAULT 0);

-- Table: routing_rules
CREATE TABLE routing_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, condition_field TEXT,
        condition_op TEXT, condition_val TEXT, action TEXT, target TEXT,
        priority TEXT DEFAULT 'medium', is_active INTEGER DEFAULT 1);

-- Table: crm_mappings
CREATE TABLE crm_mappings (user_id INTEGER PRIMARY KEY, provider TEXT, mapping_json TEXT);

-- Table: onboarding_prefs
CREATE TABLE onboarding_prefs (user_id INTEGER PRIMARY KEY, preferences_json TEXT);

-- Table: email_campaigns
CREATE TABLE email_campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT, subject TEXT,
        body TEXT, target_industry TEXT, target_seniority TEXT, sent_count INTEGER DEFAULT 0,
        open_rate INTEGER, click_rate INTEGER, delivered_count INTEGER, failed_count INTEGER, 
        send_mode TEXT DEFAULT 'simulated', preview_text TEXT, from_name TEXT, from_email TEXT, 
        reply_to TEXT, html_body TEXT, text_body TEXT, template_id INTEGER, list_ids TEXT, 
        status TEXT DEFAULT 'draft', scheduled_at DATETIME, sent_at DATETIME, 
        total_recipients INTEGER DEFAULT 0, workspace_id INTEGER);

-- Table: contact_relationships
CREATE TABLE contact_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT, from_contact_id INTEGER, to_contact_id INTEGER,
        type TEXT /* reports_to, colleague, introduced_by */, created_at DATETIME,
        UNIQUE(from_contact_id, to_contact_id, type));

-- Table: platform_incidents
CREATE TABLE platform_incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, severity TEXT, service TEXT,
        status TEXT, impact TEXT, acknowledged_by TEXT, acknowledged_at DATETIME, created_at DATETIME);

-- Table: integration_sync_jobs
CREATE TABLE integration_sync_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, workspace_id INTEGER,
        provider TEXT NOT NULL, contact_count INTEGER, payload_json TEXT, status TEXT DEFAULT 'queued',
        retry_count INTEGER, max_retries INTEGER DEFAULT 3, last_error TEXT,
        last_attempt_at DATETIME, next_retry_at DATETIME, succeeded_at DATETIME);

-- Table: data_quality_dedupe_queue
CREATE TABLE data_quality_dedupe_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT, workspace_id INTEGER NOT NULL, fingerprint TEXT NOT NULL,
        contact_ids_json TEXT NOT NULL, primary_contact_id INTEGER, reason TEXT, confidence INTEGER,
        status TEXT DEFAULT 'pending', merged_contact_id INTEGER, resolved_by INTEGER,
        resolution_note TEXT, UNIQUE(workspace_id, fingerprint));

-- Table: audit_trail
CREATE TABLE audit_trail (
        id INTEGER PRIMARY KEY AUTOINCREMENT, actor_user_id INTEGER, actor_email TEXT,
        actor_role TEXT, action TEXT NOT NULL, resource TEXT, status TEXT DEFAULT 'SUCCESS',
        ip_address TEXT, user_agent TEXT, details_json TEXT, created_at DATETIME);

-- Table: workspace_policies
CREATE TABLE workspace_policies (
        workspace_id INTEGER PRIMARY KEY, retention_days INTEGER DEFAULT 90,
        pii_redaction_enabled INTEGER DEFAULT 1, strict_audit_storage_enabled INTEGER DEFAULT 1,
        updated_by INTEGER, updated_at DATETIME);

-- Table: billing_payment_methods
CREATE TABLE billing_payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT, workspace_id INTEGER NOT NULL, brand TEXT DEFAULT 'card',
        last4 TEXT NOT NULL, exp_month INTEGER NOT NULL, exp_year INTEGER NOT NULL, holder_name TEXT,
        is_primary INTEGER DEFAULT 0, is_backup INTEGER DEFAULT 0);

-- Table: billing_invoices
CREATE TABLE billing_invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT, workspace_id INTEGER NOT NULL, invoice_number TEXT UNIQUE,
        amount_cents INTEGER DEFAULT 0, currency TEXT DEFAULT 'USD', status TEXT DEFAULT 'paid',
        issued_at DATETIME, receipt_url TEXT);

-- Table: email_lists, email_list_contacts, email_templates, email_sends, email_clicks, email_automations
CREATE TABLE email_lists (id INTEGER PRIMARY KEY AUTOINCREMENT, workspace_id INTEGER, user_id INTEGER NOT NULL, name TEXT NOT NULL, description TEXT, type TEXT DEFAULT 'static', segment_rules TEXT, contact_count INTEGER DEFAULT 0);
CREATE TABLE email_list_contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, list_id INTEGER NOT NULL, contact_id INTEGER, email TEXT NOT NULL, first_name TEXT, last_name TEXT, company TEXT, subscribed INTEGER DEFAULT 1, unsubscribed_at DATETIME);
CREATE TABLE email_templates (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, subject TEXT NOT NULL, html_body TEXT NOT NULL, category TEXT DEFAULT 'general', is_shared INTEGER DEFAULT 0, variables TEXT);
CREATE TABLE email_sends (id INTEGER PRIMARY KEY AUTOINCREMENT, campaign_id INTEGER NOT NULL, email TEXT NOT NULL, status TEXT DEFAULT 'pending', opened_at DATETIME, open_count INTEGER DEFAULT 0, clicked_at DATETIME, click_count INTEGER DEFAULT 0, tracking_id TEXT UNIQUE);
CREATE TABLE email_clicks (id INTEGER PRIMARY KEY AUTOINCREMENT, send_id INTEGER NOT NULL, campaign_id INTEGER NOT NULL, url TEXT NOT NULL, clicked_at DATETIME);
CREATE TABLE email_automations (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, trigger_type TEXT NOT NULL, steps TEXT NOT NULL, status TEXT DEFAULT 'inactive');

-- Table: calendars, calendar_events, event_attendees, event_reminders, calendar_shares, event_contact_links, availability_slots, booking_links
CREATE TABLE calendars (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, workspace_id INTEGER, name TEXT NOT NULL, color TEXT DEFAULT '#7b2fff', is_primary INTEGER DEFAULT 0, timezone TEXT DEFAULT 'UTC');
CREATE TABLE calendar_events (id INTEGER PRIMARY KEY AUTOINCREMENT, calendar_id INTEGER NOT NULL, user_id INTEGER NOT NULL, title TEXT NOT NULL, start_datetime DATETIME NOT NULL, end_datetime DATETIME NOT NULL, recurrence_rule TEXT, status TEXT DEFAULT 'confirmed');
CREATE TABLE event_attendees (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, email TEXT NOT NULL, status TEXT DEFAULT 'pending', response_token TEXT UNIQUE);
CREATE TABLE event_reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, user_id INTEGER NOT NULL, minutes_before INTEGER NOT NULL, method TEXT DEFAULT 'email');
CREATE TABLE calendar_shares (id INTEGER PRIMARY KEY AUTOINCREMENT, calendar_id INTEGER NOT NULL, shared_with_email TEXT NOT NULL, permission TEXT DEFAULT 'view', share_token TEXT UNIQUE);
CREATE TABLE availability_slots (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, day_of_week INTEGER NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL);
CREATE TABLE booking_links (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, duration_minutes INTEGER DEFAULT 30, questions TEXT);
CREATE TABLE crm_sync_log (id INTEGER PRIMARY KEY AUTOINCREMENT, workspace_id INTEGER NOT NULL, provider TEXT NOT NULL, status TEXT NOT NULL, message TEXT NOT NULL);
```

Please structure your response cleanly with clear headings matching the requirements above.
