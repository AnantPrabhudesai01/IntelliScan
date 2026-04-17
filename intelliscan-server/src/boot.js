const fs = require('fs');
const path = require('path');
const { db, pgPool, dbGetAsync, dbAllAsync, dbRunAsync, isPostgres } = require('./utils/db');
const { seedDefaultAdmin } = require('./utils/adminSeeder');

/**
 * Global Startup Sequence
 * 
 * We use this bootstrapper to handle environment sanity checks, 
 * automated schema migrations ("self-healing"), and system seeding.
 */
async function bootstrap() {
  console.log('[Boot] Initializing system sequence...');

  try {
    // ══════════════════════════════════════════════════════════════════
    // 2. Database Integrity Check
    // ══════════════════════════════════════════════════════════════════
    console.log('[Boot] Verifying platform schema integrity...');

    // 2.1 Essential Platform Tables
    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS users (
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
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        name TEXT NOT NULL,
        owner_id INTEGER REFERENCES users(id),
        logo_url TEXT,
        settings_json ${isPostgres ? 'JSONB' : 'TEXT'} DEFAULT '{}',
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS contacts (
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
        is_deleted BOOLEAN DEFAULT ${isPostgres ? 'FALSE' : '0'},
        deleted_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS deals (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        stage TEXT DEFAULT 'Prospect',
        value NUMERIC DEFAULT 0,
        expected_close ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS calendars (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        color TEXT DEFAULT '#7b2fff',
        is_primary BOOLEAN DEFAULT ${isPostgres ? 'FALSE' : '0'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        calendar_id INTEGER NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        start_datetime ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'} NOT NULL,
        end_datetime ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'} NOT NULL,
        location TEXT,
        status TEXT DEFAULT 'confirmed'
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS event_reminders (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        event_id INTEGER NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        method TEXT DEFAULT 'email',
        minutes_before INTEGER NOT NULL,
        sent_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS email_sequences (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS email_sequence_steps (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        sequence_id INTEGER NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL,
        subject TEXT NOT NULL,
        html_body TEXT NOT NULL,
        ai_intent TEXT,
        ai_model TEXT DEFAULT 'gemini',
        delay_days INTEGER DEFAULT 0
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS contact_sequences (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        sequence_id INTEGER NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'active',
        current_step_index INTEGER DEFAULT 0,
        next_send_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        last_error TEXT
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS audit_trail (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        actor_user_id INTEGER,
        actor_email TEXT,
        action TEXT NOT NULL,
        resource TEXT,
        status TEXT DEFAULT 'SUCCESS',
        ip_address TEXT,
        details_json ${isPostgres ? 'JSONB' : 'TEXT'} DEFAULT '{}',
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS analytics_logs (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_email TEXT,
        action TEXT,
        path TEXT,
        duration_ms INTEGER,
        timestamp ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER REFERENCES users(id),
        name TEXT,
        date ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        location TEXT,
        type TEXT,
        status TEXT DEFAULT 'active'
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS user_cards (
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
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS user_quotas (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER UNIQUE REFERENCES users(id),
        used_count INTEGER DEFAULT 0,
        limit_amount INTEGER DEFAULT 10,
        group_scans_used INTEGER DEFAULT 0,
        group_limit_amount INTEGER DEFAULT 1,
        last_reset_date ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS ai_models (
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
      )
    `);

    // Seed default models if none exist
    const defaultModels = [
      ['Nvidia Nemotron 340B (Primary)', 'Flagship Intelligence', 'nvidia/nemotron-4-340b-instruct', 'deployed', 99.1, 750, 0, 0],
      ['Gemini 3 Flash (Secondary)', 'Outreach / Vision', 'google/gemini-2.0-flash-001', 'deployed', 98.4, 450, 0, 12450],
      ['OpenAI GPT-4o Mini', 'Logic / Speed', 'openai/gpt-4o-mini', 'deployed', 96.2, 320, 0, 8900],
      ['Claude 3.5 Sonnet', 'High Reasoning', 'anthropic/claude-3.5-sonnet', 'deployed', 98.8, 650, 0, 500],
      ['Llama 3 70B (Base)', 'Signal Aggregator', 'meta-llama/llama-3-70b-instruct', 'training', 92.1, 1200, 48.2, 450]
    ];

    for (const m of defaultModels) {
      const exists = await dbGetAsync('SELECT id FROM ai_models WHERE api_model_id = ?', [m[2]]);
      if (!exists) {
        await dbRunAsync(
          'INSERT INTO ai_models (name, type, api_model_id, status, accuracy, latency_ms, vram_gb, calls_30d) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          m
        );
        console.log(`🤖 System: Seeded AI Model: ${m[0]}`);
      }
    }

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER REFERENCES users(id),
        workspace_id INTEGER REFERENCES workspaces(id),
        url TEXT NOT NULL,
        event_type TEXT DEFAULT 'on_scan',
        secret_key TEXT,
        is_active INTEGER DEFAULT 1,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        webhook_id INTEGER REFERENCES webhooks(id),
        status_code INTEGER,
        response_body TEXT,
        latency_ms INTEGER,
        timestamp ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    // ── Missing CRM & Billing Tables (fixes workspace_id error) ──
    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS crm_mappings (
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
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS crm_sync_log (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        workspace_id INTEGER,
        provider TEXT,
        status TEXT DEFAULT 'info',
        message TEXT,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS billing_orders (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        plan_id TEXT NOT NULL,
        amount INTEGER DEFAULT 0,
        currency TEXT DEFAULT 'INR',
        razorpay_order_id TEXT,
        razorpay_payment_id TEXT,
        status TEXT DEFAULT 'created',
        auto_pay INTEGER DEFAULT 0,
        period_start ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        period_end ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        reminder_sent INTEGER DEFAULT 0,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    // 2.2 Performance Indexes
    await dbRunAsync('CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id)');
    await dbRunAsync('CREATE INDEX IF NOT EXISTS idx_contacts_is_deleted ON contacts(is_deleted)');
    await dbRunAsync('CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_trail(created_at)');
    await dbRunAsync('CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)');
    
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
      { table: 'email_sequence_steps', column: 'ai_model', type: "TEXT DEFAULT 'gemini'" }
    ];

    for (const patch of patches) {
      const checkQuery = isPostgres 
        ? `SELECT column_name FROM information_schema.columns WHERE table_name = '${patch.table}' AND column_name = '${patch.column}'`
        : `PRAGMA table_info(${patch.table})`;

      let needsPatch = false;
      try {
        if (isPostgres) {
          const res = await pgPool.query(checkQuery);
          needsPatch = res.rowCount === 0;
        } else {
          const columns = await dbAllAsync(checkQuery);
          needsPatch = !columns.some(c => c.name === patch.column);
        }

        if (needsPatch) {
          console.log(`[Boot] Patching schema: adding missing "${patch.column}" column to ${patch.table} table.`);
          await dbRunAsync(`ALTER TABLE ${patch.table} ADD COLUMN ${patch.column} ${patch.type}`);
        }
      } catch (patchErr) {
        console.warn(`[Boot] Patch check failed for ${patch.table}.${patch.column} (Table might not exist yet):`, patchErr.message);
      }
    }

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS email_lists (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS email_list_contacts (
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
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        subject TEXT,
        html_body TEXT NOT NULL,
        preview_text TEXT,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS email_campaigns (
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
        list_ids TEXT, -- Store as JSON array string for list IDs
        status TEXT DEFAULT 'draft',
        sent_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS email_sends (
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
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS email_clicks (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        send_id INTEGER NOT NULL REFERENCES email_sends(id) ON DELETE CASCADE,
        campaign_id INTEGER NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        timestamp ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS workspace_integrations (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        app_id TEXT NOT NULL,
        config_json TEXT,
        is_active BOOLEAN DEFAULT false,
        last_sync_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'},
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        UNIQUE(user_id, app_id)
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS whatsapp_discoveries (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        discovery_code TEXT UNIQUE NOT NULL,
        phone_number TEXT NOT NULL,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);
    
    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS coach_insights_cache (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        insights_json TEXT NOT NULL,
        contact_count_at_cache INTEGER DEFAULT 0,
        updated_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);
    
    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        device_info TEXT,
        ip_address TEXT,
        location TEXT,
        is_active INTEGER DEFAULT 1,
        last_active ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        code TEXT NOT NULL,
        meta_data ${isPostgres ? 'JSONB' : 'TEXT'},
        expires_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'} NOT NULL,
        created_at ${isPostgres ? 'TIMESTAMPTZ DEFAULT NOW()' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'},
        UNIQUE(user_id, type)
      )
    `);

    // ══════════════════════════════════════════════════════════════════
    // 3. System Seeding
    // ══════════════════════════════════════════════════════════════════
    await seedDefaultAdmin();
    console.log('[Boot] System seeding complete.');

    console.log('[Boot] Sequence finished successfully.');
  } catch (err) {
    console.error('[Boot] Critical Failure during startup:', err);
    throw err;
  }
}

module.exports = { bootstrap };
