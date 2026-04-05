-- Table: users
CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        workspace_id INTEGER
      , tier TEXT DEFAULT 'personal');

-- Table: contacts
CREATE TABLE contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        email TEXT,
        phone TEXT,
        company TEXT,
        job_title TEXT,
        scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        image_url TEXT,
        notes TEXT,
        tags TEXT
      , event_id INTEGER, inferred_industry TEXT, inferred_seniority TEXT, confidence INTEGER DEFAULT 95, engine_used TEXT, workspace_scope INTEGER, crm_synced INTEGER DEFAULT 0, crm_synced_at DATETIME);

-- Table: analytics_logs
CREATE TABLE analytics_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_role TEXT DEFAULT 'anonymous',
        user_email TEXT,
        action TEXT,
        path TEXT,
        duration_ms INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: engine_config
CREATE TABLE engine_config (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: model_versions
CREATE TABLE model_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version_tag TEXT,
        description TEXT,
        ocr_accuracy REAL,
        avg_latency_ms INTEGER,
        status TEXT DEFAULT 'standby',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: api_sandbox_calls
CREATE TABLE api_sandbox_calls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        payload TEXT,
        response TEXT,
        status_code INTEGER,
        latency_ms INTEGER,
        engine TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: sessions
CREATE TABLE sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        token TEXT,
        device_info TEXT,
        ip_address TEXT,
        location TEXT,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      );

-- Table: events
CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        date TEXT,
        location TEXT,
        type TEXT,
        attendees_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: ai_drafts
CREATE TABLE ai_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        contact_id INTEGER,
        contact_name TEXT,
        subject TEXT,
        body TEXT,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      , contact_email TEXT, tone TEXT DEFAULT 'professional', version INTEGER DEFAULT 1, sent_at DATETIME);

-- Table: workspace_chats
CREATE TABLE workspace_chats (
        id TEXT PRIMARY KEY,
        workspace_id TEXT,
        user_name TEXT,
        message TEXT,
        color TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: digital_cards
CREATE TABLE digital_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        url_slug TEXT UNIQUE,
        views INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        theme_color TEXT DEFAULT 'indigo'
      , design_json TEXT, bio TEXT, headline TEXT);

-- Table: user_quotas
CREATE TABLE user_quotas (
        user_id INTEGER PRIMARY KEY,
        used_count INTEGER DEFAULT 0,
        limit_amount INTEGER DEFAULT 100
      , group_scans_used INTEGER DEFAULT 0);

-- Table: routing_rules
CREATE TABLE routing_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        condition_field TEXT,
        condition_op TEXT,
        condition_val TEXT,
        action TEXT,
        target TEXT,
        priority TEXT DEFAULT 'medium',
        is_active INTEGER DEFAULT 1
      );

-- Table: crm_mappings
CREATE TABLE crm_mappings (
        user_id INTEGER PRIMARY KEY,
        provider TEXT,
        mapping_json TEXT
      );

-- Table: onboarding_prefs
CREATE TABLE onboarding_prefs (
        user_id INTEGER PRIMARY KEY,
        preferences_json TEXT
      );

-- Table: email_campaigns
CREATE TABLE email_campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        subject TEXT,
        body TEXT,
        target_industry TEXT,
        target_seniority TEXT,
        sent_count INTEGER DEFAULT 0,
        open_rate INTEGER DEFAULT 0,
        click_rate INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      , delivered_count INTEGER DEFAULT 0, failed_count INTEGER DEFAULT 0, send_mode TEXT DEFAULT 'simulated', preview_text TEXT, from_name TEXT, from_email TEXT, reply_to TEXT, html_body TEXT, text_body TEXT, template_id INTEGER, list_ids TEXT, status TEXT DEFAULT 'draft', scheduled_at DATETIME, sent_at DATETIME, total_recipients INTEGER DEFAULT 0, workspace_id INTEGER);

-- Table: contact_relationships
CREATE TABLE contact_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_contact_id INTEGER,
        to_contact_id INTEGER,
        type TEXT, -- 'reports_to', 'colleague', 'introduced_by'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(from_contact_id, to_contact_id, type)
      );

-- Table: platform_incidents
CREATE TABLE platform_incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        severity TEXT DEFAULT 'medium',
        service TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        impact TEXT,
        acknowledged_by TEXT,
        acknowledged_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: integration_sync_jobs
CREATE TABLE integration_sync_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        workspace_id INTEGER,
        provider TEXT NOT NULL,
        contact_count INTEGER DEFAULT 0,
        payload_json TEXT,
        status TEXT DEFAULT 'queued', -- queued, processing, succeeded, failed, retry_queued
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        last_error TEXT,
        last_attempt_at DATETIME,
        next_retry_at DATETIME,
        succeeded_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: data_quality_dedupe_queue
CREATE TABLE data_quality_dedupe_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        fingerprint TEXT NOT NULL,
        contact_ids_json TEXT NOT NULL,
        primary_contact_id INTEGER,
        reason TEXT,
        confidence INTEGER DEFAULT 80,
        status TEXT DEFAULT 'pending', -- pending, merged, dismissed
        merged_contact_id INTEGER,
        resolved_by INTEGER,
        resolution_note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(workspace_id, fingerprint)
      );

-- Table: audit_trail
CREATE TABLE audit_trail (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_user_id INTEGER,
        actor_email TEXT,
        actor_role TEXT,
        action TEXT NOT NULL,
        resource TEXT,
        status TEXT DEFAULT 'SUCCESS',
        ip_address TEXT,
        user_agent TEXT,
        details_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: campaign_recipients
CREATE TABLE campaign_recipients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        contact_id INTEGER,
        email TEXT,
        status TEXT DEFAULT 'queued',
        provider_message_id TEXT,
        error_message TEXT,
        sent_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: workspace_policies
CREATE TABLE workspace_policies (
        workspace_id INTEGER PRIMARY KEY,
        retention_days INTEGER DEFAULT 90,
        pii_redaction_enabled INTEGER DEFAULT 1,
        strict_audit_storage_enabled INTEGER DEFAULT 1,
        updated_by INTEGER,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: billing_payment_methods
CREATE TABLE billing_payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        brand TEXT DEFAULT 'card',
        last4 TEXT NOT NULL,
        exp_month INTEGER NOT NULL,
        exp_year INTEGER NOT NULL,
        holder_name TEXT,
        is_primary INTEGER DEFAULT 0,
        is_backup INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: billing_invoices
CREATE TABLE billing_invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        invoice_number TEXT UNIQUE,
        amount_cents INTEGER DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'paid',
        issued_at DATETIME,
        receipt_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

-- Table: saved_cards
CREATE TABLE saved_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        card_data TEXT NOT NULL,
        design_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

-- Table: email_lists
CREATE TABLE email_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'static',
        segment_rules TEXT,
        contact_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

-- Table: email_list_contacts
CREATE TABLE email_list_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER NOT NULL,
        contact_id INTEGER,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        company TEXT,
        subscribed INTEGER DEFAULT 1,
        unsubscribed_at DATETIME,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(list_id) REFERENCES email_lists(id) ON DELETE CASCADE
      );

-- Table: email_templates
CREATE TABLE email_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        html_body TEXT NOT NULL,
        text_body TEXT,
        category TEXT DEFAULT 'general',
        thumbnail TEXT,
        is_shared INTEGER DEFAULT 0,
        variables TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

-- Table: email_sends
CREATE TABLE email_sends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT,
        status TEXT DEFAULT 'pending',
        sent_at DATETIME,
        opened_at DATETIME,
        open_count INTEGER DEFAULT 0,
        clicked_at DATETIME,
        click_count INTEGER DEFAULT 0,
        bounced_at DATETIME,
        bounce_reason TEXT,
        unsubscribed_at DATETIME,
        tracking_id TEXT UNIQUE,
        FOREIGN KEY(campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE
      );

-- Table: email_clicks
CREATE TABLE email_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        send_id INTEGER NOT NULL,
        campaign_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(send_id) REFERENCES email_sends(id) ON DELETE CASCADE
      );

-- Table: email_automations
CREATE TABLE email_automations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        trigger_type TEXT NOT NULL,
        trigger_config TEXT,
        status TEXT DEFAULT 'inactive',
        steps TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

-- Table: calendars
CREATE TABLE calendars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        workspace_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#7b2fff',
        is_primary INTEGER DEFAULT 0,
        is_shared INTEGER DEFAULT 0,
        shared_with TEXT,
        timezone TEXT DEFAULT 'UTC',
        is_visible INTEGER DEFAULT 1,
        type TEXT DEFAULT 'personal',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

-- Table: calendar_events
CREATE TABLE calendar_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        calendar_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        all_day INTEGER DEFAULT 0,
        color TEXT,
        status TEXT DEFAULT 'confirmed',
        visibility TEXT DEFAULT 'default',
        recurrence_rule TEXT,
        recurrence_id TEXT,
        original_start DATETIME,
        is_recurring_exception INTEGER DEFAULT 0,
        parent_event_id INTEGER,
        conference_link TEXT,
        conference_type TEXT,
        timezone TEXT DEFAULT 'UTC',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(calendar_id) REFERENCES calendars(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

-- Table: event_attendees
CREATE TABLE event_attendees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        name TEXT,
        status TEXT DEFAULT 'pending',
        is_organizer INTEGER DEFAULT 0,
        response_token TEXT UNIQUE,
        responded_at DATETIME,
        notified_at DATETIME,
        FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
      );

-- Table: event_reminders
CREATE TABLE event_reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        method TEXT DEFAULT 'email',
        minutes_before INTEGER NOT NULL,
        sent_at DATETIME,
        FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
      );

-- Table: calendar_shares
CREATE TABLE calendar_shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        calendar_id INTEGER NOT NULL,
        shared_with_email TEXT NOT NULL,
        shared_with_user_id INTEGER,
        permission TEXT DEFAULT 'view',
        accepted INTEGER DEFAULT 0,
        share_token TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(calendar_id) REFERENCES calendars(id) ON DELETE CASCADE
      );

-- Table: event_contact_links
CREATE TABLE event_contact_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        contact_id INTEGER NOT NULL,
        link_type TEXT DEFAULT 'attendee',
        FOREIGN KEY(event_id) REFERENCES calendar_events(id) ON DELETE CASCADE
      );

-- Table: availability_slots
CREATE TABLE availability_slots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_available INTEGER DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

-- Table: booking_links
CREATE TABLE booking_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        duration_minutes INTEGER DEFAULT 30,
        buffer_minutes INTEGER DEFAULT 0,
        max_bookings_per_day INTEGER DEFAULT 8,
        color TEXT DEFAULT '#7b2fff',
        questions TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

-- Table: crm_sync_log
CREATE TABLE crm_sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace_id INTEGER NOT NULL,
        provider TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
