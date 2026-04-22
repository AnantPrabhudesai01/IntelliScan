const fs = require('fs');
const path = require('path');
const { db, pgPool, dbGetAsync, dbAllAsync, dbRunAsync, dbExecAsync, isPostgres } = require('./utils/db');
const { seedDefaultAdmin } = require('./utils/adminSeeder');

/**
 * Global Startup Sequence
 * 
 * We use this bootstrapper to handle environment sanity checks, 
 * automated schema migrations ("self-healing"), and system seeding.
 */
let isBootstrappedInProcess = false;

async function bootstrap() {
  if (isBootstrappedInProcess) return;
  console.log('[Boot] Initializing system sequence...');

  const startTime = Date.now();
  try {
    // ══════════════════════════════════════════════════════════════════
    // 2. Database Integrity Check
    // ══════════════════════════════════════════════════════════════════
    console.log('[Boot] Verifying platform schema integrity...');

    // 2.1 Consolidated Platform Schema (Optimized for Vercel Cold-Starts)
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
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
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS workspaces (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        name TEXT NOT NULL,
        owner_id INTEGER REFERENCES users(id),
        logo_url TEXT,
        settings_json ${isPostgres ? 'JSONB' : 'TEXT'} DEFAULT '{}',
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS contacts (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER REFERENCES users(id),
        name TEXT,
        email TEXT,
        phone TEXT,
        company TEXT,
        job_title TEXT,
        scan_date ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        image_url TEXT,
        notes TEXT,
        tags TEXT,
        event_id INTEGER,
        inferred_industry TEXT,
        inferred_seniority TEXT,
        confidence INTEGER DEFAULT 95,
        engine_used TEXT,
        workspace_id INTEGER REFERENCES workspaces(id),
        workspace_scope INTEGER,
        is_deleted BOOLEAN DEFAULT ${isPostgres ? 'FALSE' : '0'},
        deleted_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        crm_synced INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        deal_status TEXT,
        name_native TEXT,
        company_native TEXT,
        title_native TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS deals (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        workspace_id INTEGER REFERENCES workspaces(id),
        stage TEXT DEFAULT 'Prospect',
        value NUMERIC DEFAULT 0,
        notes TEXT,
        expected_close ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        updated_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS calendars (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        color TEXT DEFAULT '#7b2fff',
        is_primary BOOLEAN DEFAULT ${isPostgres ? 'FALSE' : '0'},
        type TEXT DEFAULT 'personal'
      )`,
      `CREATE TABLE IF NOT EXISTS calendar_events (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        calendar_id INTEGER NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        start_datetime ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'} NOT NULL,
        end_datetime ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'} NOT NULL,
        location TEXT,
        status TEXT DEFAULT 'confirmed'
      )`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type TEXT,
        title TEXT,
        message TEXT,
        is_read INTEGER DEFAULT 0,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS ai_models (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        name TEXT,
        type TEXT,
        api_model_id TEXT,
        status TEXT DEFAULT 'training',
        accuracy REAL DEFAULT 0,
        latency_ms INTEGER DEFAULT 0,
        vram_gb REAL DEFAULT 0,
        calls_30d INTEGER DEFAULT 0,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        updated_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS workspace_policies (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        workspace_id INTEGER NOT NULL UNIQUE,
        retention_days INTEGER DEFAULT 90,
        pii_redaction_enabled INTEGER DEFAULT 1,
        strict_audit_storage_enabled INTEGER DEFAULT 1,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS ai_drafts (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        contact_id INTEGER,
        contact_name TEXT,
        contact_email TEXT,
        subject TEXT,
        body TEXT,
        tone TEXT,
        version INTEGER DEFAULT 1,
        status TEXT DEFAULT 'draft',
        sent_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS routing_rules (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        condition_field TEXT,
        condition_op TEXT,
        condition_val TEXT,
        action TEXT,
        target TEXT,
        priority INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS event_reminders (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        event_id INTEGER NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        method TEXT DEFAULT 'email',
        minutes_before INTEGER NOT NULL,
        sent_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'}
      )`,
      `CREATE TABLE IF NOT EXISTS email_sequences (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS email_sequence_steps (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        sequence_id INTEGER NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL,
        subject TEXT NOT NULL,
        html_body TEXT NOT NULL,
        ai_intent TEXT,
        ai_model TEXT DEFAULT 'gemini',
        delay_days INTEGER DEFAULT 0
      )`,
      `CREATE TABLE IF NOT EXISTS contact_sequences (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        sequence_id INTEGER NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'active',
        current_step_index INTEGER DEFAULT 0,
        next_send_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        last_error TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS audit_trail (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        actor_user_id INTEGER,
        actor_email TEXT,
        actor_role TEXT,
        action TEXT NOT NULL,
        resource TEXT,
        status TEXT DEFAULT 'SUCCESS',
        ip_address TEXT,
        user_agent TEXT,
        details_json ${isPostgres ? 'JSONB' : 'TEXT'} DEFAULT '{}',
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS analytics_logs (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_email TEXT,
        action TEXT,
        path TEXT,
        duration_ms INTEGER,
        timestamp ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS events (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER REFERENCES users(id),
        name TEXT,
        date ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        location TEXT,
        type TEXT,
        status TEXT DEFAULT 'active'
      )`,
      `CREATE TABLE IF NOT EXISTS user_cards (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER UNIQUE REFERENCES users(id),
        url_slug TEXT UNIQUE,
        headline TEXT,
        bio TEXT,
        views INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        design_json ${isPostgres ? 'JSONB' : 'TEXT'} DEFAULT '{}',
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        updated_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS user_quotas (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER UNIQUE REFERENCES users(id),
        used_count INTEGER DEFAULT 0,
        limit_amount INTEGER DEFAULT 10,
        group_scans_used INTEGER DEFAULT 0,
        group_limit_amount INTEGER DEFAULT 1,
        last_reset_date ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS webhooks (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER REFERENCES users(id),
        workspace_id INTEGER REFERENCES workspaces(id),
        url TEXT NOT NULL,
        event_type TEXT DEFAULT 'on_scan',
        secret_key TEXT,
        is_active INTEGER DEFAULT 1,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS scanner_links (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER REFERENCES users(id),
        workspace_id INTEGER,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        is_active INTEGER DEFAULT 1,
        scan_count INTEGER DEFAULT 0,
        settings_json ${isPostgres ? 'JSONB' : 'TEXT'} DEFAULT '{}',
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS webhook_logs (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        webhook_id INTEGER REFERENCES webhooks(id),
        status_code INTEGER,
        response_body TEXT,
        latency_ms INTEGER,
        timestamp ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS crm_mappings (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        workspace_id INTEGER NOT NULL,
        provider TEXT NOT NULL,
        field_mappings ${isPostgres ? 'JSONB' : 'TEXT'} DEFAULT '[]',
        custom_fields ${isPostgres ? 'JSONB' : 'TEXT'} DEFAULT '[]',
        is_connected INTEGER DEFAULT 0,
        auto_sync INTEGER DEFAULT 0,
        connected_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        last_sync ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        updated_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        UNIQUE(workspace_id, provider)
      )`,
      `CREATE TABLE IF NOT EXISTS crm_sync_log (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        workspace_id INTEGER,
        provider TEXT,
        status TEXT DEFAULT 'info',
        message TEXT,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS billing_orders (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        workspace_id INTEGER,
        plan_id TEXT NOT NULL,
        amount_paise INTEGER DEFAULT 0,
        currency TEXT DEFAULT 'INR',
        razorpay_order_id TEXT,
        razorpay_payment_id TEXT,
        razorpay_signature TEXT,
        status TEXT DEFAULT 'created',
        simulated INTEGER DEFAULT 0,
        auto_pay INTEGER DEFAULT 0,
        period_start ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        period_end ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        reminder_sent INTEGER DEFAULT 0,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        updated_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS billing_invoices (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        workspace_id INTEGER,
        invoice_number TEXT UNIQUE,
        amount_cents INTEGER DEFAULT 0,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'pending',
        issued_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS workspace_chats (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        workspace_id TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        user_name TEXT,
        message TEXT,
        timestamp ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        device_info TEXT,
        ip_address TEXT,
        location TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        last_active ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS otp_codes (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        code TEXT NOT NULL,
        meta_data ${isPostgres ? 'JSONB' : 'TEXT'},
        expires_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'} NOT NULL,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        UNIQUE(user_id, type)
      )`,
      `CREATE TABLE IF NOT EXISTS data_quality_dedupe_queue (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        workspace_id INTEGER,
        fingerprint TEXT NOT NULL,
        contact_ids_json ${isPostgres ? 'JSONB' : 'TEXT'},
        primary_contact_id INTEGER,
        reason TEXT,
        confidence REAL,
        status TEXT DEFAULT 'pending',
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        updated_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        UNIQUE(workspace_id, fingerprint)
      )`,
      "CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_contacts_is_deleted ON contacts(is_deleted)",
      "CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_trail(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)"
    ];

    for (const sql of tables) {
      try {
        await dbExecAsync(sql);
      } catch (err) {
        console.warn('[Boot] Table provisioning warning (non-critical):', err.message);
      }
    }

    // Batch check existing models (non-critical — wrapped in try/catch)
    try {
      const existingModels = await dbAllAsync('SELECT api_model_id FROM ai_models');
      const existingIds = new Set((existingModels || []).map(m => m.api_model_id));

      const defaultModels = [
        ['Nvidia Nemotron 340B (Primary)', 'Flagship Intelligence', 'nvidia/nemotron-4-340b-instruct', 'deployed', 99.1, 750, 0, 0],
        ['Gemini 3 Flash (Secondary)', 'Outreach / Vision', 'google/gemini-2.0-flash-001', 'deployed', 98.4, 450, 0, 12450],
        ['OpenAI GPT-4o Mini', 'Logic / Speed', 'openai/gpt-4o-mini', 'deployed', 96.2, 320, 0, 8900],
        ['Claude 3.5 Sonnet', 'High Reasoning', 'anthropic/claude-3.5-sonnet', 'deployed', 98.8, 650, 0, 500],
        ['Llama 3 70B (Base)', 'Signal Aggregator', 'meta-llama/llama-3-70b-instruct', 'training', 92.1, 1200, 48.2, 450]
      ];
      
      for (const m of defaultModels) {
        if (!existingIds.has(m[2])) {
          try {
            await dbRunAsync(
              'INSERT INTO ai_models (name, type, api_model_id, status, accuracy, latency_ms, vram_gb, calls_30d) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              m
            );
            console.log(`🤖 System: Seeded AI Model: ${m[0]}`);
          } catch (seedErr) {
            console.warn(`[Boot] Model seed warning for ${m[0]}:`, seedErr.message);
          }
        }
      }
    } catch (modelErr) {
      console.warn('[Boot] AI model seeding skipped (non-critical):', modelErr.message);
    }

    
    const patches = [
      { table: 'cards', column: 'location', type: 'TEXT' },
      { table: 'crm_mappings', column: 'auto_sync', type: 'INTEGER DEFAULT 0' },
      { table: 'user_cards', column: 'contact_email', type: 'TEXT' },
      { table: 'user_cards', column: 'contact_phone', type: 'TEXT' },
      { table: 'user_cards', column: 'contact_linkedin', type: 'TEXT' },
      { table: 'user_cards', column: 'contact_whatsapp', type: 'TEXT' },
      { table: 'ai_drafts', column: 'version', type: 'INTEGER DEFAULT 1' },
      { table: 'ai_drafts', column: 'status', type: "TEXT DEFAULT 'draft'" },
      { table: 'contact_sequences', column: 'status', type: "TEXT DEFAULT 'active'" },
      { table: 'ai_models', column: 'api_model_id', type: 'TEXT' },
      { table: 'contacts', column: 'crm_synced', type: 'INTEGER DEFAULT 0' },
      { table: 'contacts', column: 'is_deleted', type: `BOOLEAN DEFAULT ${isPostgres ? 'FALSE' : '0'}` },
      { table: 'contacts', column: 'deleted_at', type: `${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'}` },
      { table: 'contacts', column: 'workspace_scope', type: 'INTEGER' },
      { table: 'contacts', column: 'sort_order', type: 'INTEGER DEFAULT 0' },
      { table: 'contacts', column: 'deal_status', type: 'TEXT' },
      { table: 'contacts', column: 'name_native', type: 'TEXT' },
      { table: 'contacts', column: 'company_native', type: 'TEXT' },
      { table: 'contacts', column: 'title_native', type: 'TEXT' },
      { table: 'audit_trail', column: 'actor_role', type: 'TEXT' },
      { table: 'audit_trail', column: 'user_agent', type: 'TEXT' },
      { table: 'deals', column: 'workspace_id', type: 'INTEGER' },
      { table: 'deals', column: 'notes', type: 'TEXT' },
      { table: 'deals', column: 'updated_at', type: `${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}` },
      { table: 'calendars', column: 'type', type: 'TEXT' },
      { table: 'user_quotas', column: 'group_limit_amount', type: 'INTEGER DEFAULT 1' },
      { table: 'user_quotas', column: 'group_scans_used', type: 'INTEGER DEFAULT 0' },
      { table: 'sessions', column: 'is_active', type: 'BOOLEAN DEFAULT TRUE' },
      { table: 'billing_orders', column: 'workspace_id', type: 'INTEGER' },
      { table: 'billing_orders', column: 'amount_paise', type: 'INTEGER DEFAULT 0' },
      { table: 'billing_orders', column: 'simulated', type: 'INTEGER DEFAULT 0' },
      { table: 'billing_orders', column: 'razorpay_signature', type: 'TEXT' },
      { table: 'billing_orders', column: 'updated_at', type: `${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}` }
    ];

    // 2.2 Bulk Column Metadata Fetch (Optimizes 30+ roundtrips into 1)
    const existingColumns = new Map(); // table -> Set(columns)
    try {
      const colRows = await dbAllAsync(`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
      `);
      for (const row of colRows) {
        if (!existingColumns.has(row.table_name)) existingColumns.set(row.table_name, new Set());
        existingColumns.get(row.table_name).add(row.column_name);
      }
    } catch (metaErr) {
      console.warn('[Boot] Failed to fetch bulk column metadata, falling back to sequential checks:', metaErr.message);
    }

    for (const patch of patches) {
      try {
        let columnExists = false;
        if (existingColumns.has(patch.table)) {
          columnExists = existingColumns.get(patch.table).has(patch.column);
        } else {
          // Fallback if metadata fetch failed or table is new
          const checkQuery = isPostgres 
            ? `SELECT column_name FROM information_schema.columns WHERE table_name = '${patch.table}' AND column_name = '${patch.column}'`
            : `PRAGMA table_info(${patch.table})`;
          
          if (isPostgres) {
            const res = await pgPool.query(checkQuery);
            columnExists = res.rowCount > 0;
          } else {
            const columns = await dbAllAsync(checkQuery);
            columnExists = columns.some(c => c.name === patch.column);
          }
        }

        if (!columnExists) {
          console.log(`[Boot] Patching schema: adding missing "${patch.column}" column to ${patch.table} table.`);
          await dbRunAsync(`ALTER TABLE ${patch.table} ADD COLUMN ${patch.column} ${patch.type}`);
        }
      } catch (patchErr) {
        console.warn(`[Boot] Patch check failed for ${patch.table}.${patch.column}:`, patchErr.message);
      }
    }

    const tables2 = [
      `CREATE TABLE IF NOT EXISTS email_lists (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS email_list_contacts (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        list_id INTEGER NOT NULL REFERENCES email_lists(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        company TEXT,
        subscribed INTEGER DEFAULT 1,
        unsubscribed_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        UNIQUE(list_id, email)
      )`,
      `CREATE TABLE IF NOT EXISTS email_templates (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        subject TEXT,
        html_body TEXT NOT NULL,
        preview_text TEXT,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS email_campaigns (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        preview_text TEXT,
        from_name TEXT,
        from_email TEXT,
        reply_to TEXT,
        html_body TEXT NOT NULL,
        text_body TEXT,
        template_id INTEGER REFERENCES email_templates(id),
        list_ids TEXT, 
        status TEXT DEFAULT 'draft',
        sent_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS email_sends (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        campaign_id INTEGER NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        first_name TEXT,
        tracking_id TEXT UNIQUE,
        status TEXT DEFAULT 'pending',
        sent_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        opened_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        clicked_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        unsubscribed_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        open_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        bounce_reason TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS email_clicks (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        send_id INTEGER NOT NULL REFERENCES email_sends(id) ON DELETE CASCADE,
        campaign_id INTEGER NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        timestamp ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS workspace_integrations (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        app_id TEXT NOT NULL,
        config_json TEXT,
        is_active BOOLEAN DEFAULT false,
        last_sync_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        UNIQUE(user_id, app_id)
      )`,
      `CREATE TABLE IF NOT EXISTS whatsapp_discoveries (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        discovery_code TEXT UNIQUE NOT NULL,
        phone_number TEXT NOT NULL,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`,
      `CREATE TABLE IF NOT EXISTS coach_insights_cache (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        insights_json TEXT NOT NULL,
        contact_count_at_cache INTEGER DEFAULT 0,
        updated_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )`
    ];

    for (const sql of tables2) {
      try {
        await dbExecAsync(sql);
      } catch (err) {
        console.warn('[Boot] Table provisioning warning (non-critical):', err.message);
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // 3. System Seeding
    // ══════════════════════════════════════════════════════════════════
    // 4. Data Integrity (Self-Healing)
    try { await dbExecAsync(`UPDATE contacts SET is_deleted = ${isPostgres ? 'FALSE' : '0'} WHERE is_deleted IS NULL`); } catch(e) { console.warn('[Boot] Self-heal is_deleted:', e.message); }
    try { await dbExecAsync(`UPDATE contacts SET crm_synced = 0 WHERE crm_synced IS NULL`); } catch(e) { console.warn('[Boot] Self-heal crm_synced:', e.message); }
    
    console.log('[Boot] System seeding complete.');

    console.log(`[Boot] Sequence finished successfully in ${Date.now() - startTime}ms.`);
    isBootstrappedInProcess = true;
  } catch (err) {
    console.error('[Boot] Critical Failure during startup:', err);
    throw err;
  }
}

module.exports = { bootstrap };
