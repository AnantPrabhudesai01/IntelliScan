-- IntelliScan Supabase (PostgreSQL) Schema Migration
-- Run this in your Supabase SQL Editor

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    workspace_id INTEGER,
    tier TEXT DEFAULT 'personal',
    avatar_url TEXT,
    phone_number TEXT,
    bio TEXT,
    google_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    logo_url TEXT,
    settings_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    job_title TEXT,
    scan_date TIMESTAMPTZ DEFAULT NOW(),
    image_url TEXT,
    notes TEXT,
    tags TEXT,
    event_id INTEGER,
    inferred_industry TEXT,
    inferred_seniority TEXT,
    confidence INTEGER DEFAULT 95,
    engine_used TEXT,
    workspace_id INTEGER REFERENCES workspaces(id),
    workspace_scope INTEGER DEFAULT 0,
    crm_synced INTEGER DEFAULT 0,
    crm_synced_at TIMESTAMPTZ,
    deal_score INTEGER DEFAULT 0,
    deal_status TEXT DEFAULT 'None',
    linkedin_url TEXT,
    linkedin_photo TEXT,
    linkedin_bio TEXT,
    ai_enrichment_news TEXT,
    search_vector TEXT
);

-- 4. Deals table
CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    workspace_id INTEGER REFERENCES workspaces(id),
    stage TEXT DEFAULT 'Prospect',
    value NUMERIC DEFAULT 0,
    expected_close TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI Models table
CREATE TABLE IF NOT EXISTS ai_models (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'deployed',
    accuracy REAL,
    latency_ms INTEGER,
    calls_30d INTEGER DEFAULT 0,
    vram_gb REAL,
    config_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Analytics logs
CREATE TABLE IF NOT EXISTS analytics_logs (
    id SERIAL PRIMARY KEY,
    user_role TEXT DEFAULT 'anonymous',
    user_email TEXT,
    action TEXT,
    path TEXT,
    duration_ms INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Engine configuration
CREATE TABLE IF NOT EXISTS engine_config (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    workspace_id INTEGER REFERENCES workspaces(id),
    url TEXT NOT NULL,
    event_type TEXT DEFAULT 'on_scan',
    secret_key TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token TEXT,
    device_info TEXT,
    ip_address TEXT,
    location TEXT,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 10. Digital Cards
CREATE TABLE IF NOT EXISTS digital_cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    url_slug TEXT UNIQUE,
    views INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    theme_color TEXT DEFAULT 'indigo',
    design_json JSONB DEFAULT '{}',
    bio TEXT,
    headline TEXT
);

-- 11. User Quotas
CREATE TABLE IF NOT EXISTS user_quotas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    used_count INTEGER DEFAULT 0,
    limit_amount INTEGER DEFAULT 100,
    group_scans_used INTEGER DEFAULT 0,
    group_limit_amount INTEGER DEFAULT 1,
    last_reset_date TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Marketplace Apps
CREATE TABLE IF NOT EXISTS marketplace_apps (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    icon_type TEXT,
    color TEXT,
    is_installed BOOLEAN DEFAULT FALSE,
    config_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Platform Feedback
CREATE TABLE IF NOT EXISTS platform_feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_email TEXT,
    type TEXT,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    workspace_id INTEGER REFERENCES workspaces(id),
    template_id INTEGER,
    name TEXT,
    subject TEXT,
    body TEXT,
    html_body TEXT,
    text_body TEXT,
    preview_text TEXT,
    target_industry TEXT,
    target_seniority TEXT,
    from_name TEXT,
    from_email TEXT,
    reply_to TEXT,
    list_ids TEXT,
    status TEXT DEFAULT 'draft',
    send_mode TEXT DEFAULT 'simulated',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    open_rate INTEGER DEFAULT 0,
    click_rate INTEGER DEFAULT 0,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Audit Trail
CREATE TABLE IF NOT EXISTS audit_trail (
    id SERIAL PRIMARY KEY,
    actor_user_id INTEGER,
    actor_email TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    resource TEXT,
    status TEXT DEFAULT 'SUCCESS',
    ip_address TEXT,
    user_agent TEXT,
    details_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Workspace Policies
CREATE TABLE IF NOT EXISTS workspace_policies (
    workspace_id INTEGER PRIMARY KEY REFERENCES workspaces(id),
    retention_days INTEGER DEFAULT 90,
    pii_redaction_enabled BOOLEAN DEFAULT TRUE,
    strict_audit_storage_enabled BOOLEAN DEFAULT TRUE,
    updated_by INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Billing Payment Methods
CREATE TABLE IF NOT EXISTS billing_payment_methods (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id),
    brand TEXT DEFAULT 'card',
    last4 TEXT NOT NULL,
    exp_month INTEGER NOT NULL,
    exp_year INTEGER NOT NULL,
    holder_name TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Billing Invoices
CREATE TABLE IF NOT EXISTS billing_invoices (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id),
    invoice_number TEXT UNIQUE,
    amount_cents INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'paid',
    issued_at TIMESTAMPTZ,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Email Lists
CREATE TABLE IF NOT EXISTS email_lists (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER REFERENCES workspaces(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'static',
    segment_rules JSONB,
    contact_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    category TEXT DEFAULT 'general',
    is_shared BOOLEAN DEFAULT FALSE,
    variables JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Calendars & Events
CREATE TABLE IF NOT EXISTS calendars (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    workspace_id INTEGER REFERENCES workspaces(id),
    name TEXT NOT NULL,
    color TEXT DEFAULT '#7b2fff',
    is_primary BOOLEAN DEFAULT FALSE,
    type TEXT DEFAULT 'personal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    calendar_id INTEGER NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_reminders (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    method TEXT DEFAULT 'email',
    minutes_before INTEGER NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Sequences & Marketing Automation
CREATE TABLE IF NOT EXISTS email_sequences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_sequence_steps (
    id SERIAL PRIMARY KEY,
    sequence_id INTEGER NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    delay_days INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contact_sequences (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    sequence_id INTEGER NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    current_step_index INTEGER DEFAULT 0,
    next_send_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Notifications & Feedback
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Booking & Availability
CREATE TABLE IF NOT EXISTS availability_slots (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_links (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
