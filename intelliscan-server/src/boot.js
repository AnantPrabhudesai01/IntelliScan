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
    // 1. Connectivity Check
    // ══════════════════════════════════════════════════════════════════
    if (isPostgres) {
      await pgPool.query('SELECT 1');
      console.log('[Boot] PostgreSQL connection verified.');
    } else {
      await dbGetAsync('SELECT 1');
      console.log('[Boot] SQLite connection verified.');
    }

    // ══════════════════════════════════════════════════════════════════
    // 2. Automated Schema Sync (Self-Healing)
    // ══════════════════════════════════════════════════════════════════
    console.log('[Boot] Checking database integrity...');

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
      CREATE TABLE IF NOT EXISTS ai_sequences (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active'
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS email_sequence_steps (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        sequence_id INTEGER NOT NULL REFERENCES ai_sequences(id) ON DELETE CASCADE,
        order_index INTEGER NOT NULL,
        subject TEXT NOT NULL,
        html_body TEXT NOT NULL,
        delay_days INTEGER DEFAULT 0
      )
    `);

    await dbRunAsync(`
      CREATE TABLE IF NOT EXISTS contact_sequences (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${isPostgres ? '' : 'AUTOINCREMENT'},
        contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
        sequence_id INTEGER NOT NULL REFERENCES ai_sequences(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'active',
        current_step_index INTEGER DEFAULT 0,
        next_send_at ${isPostgres ? 'TIMESTAMPTZ' : 'DATETIME'}
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
    const modelCount = await dbGetAsync('SELECT COUNT(*) as cnt FROM ai_models');
    if (modelCount.cnt === 0) {
      const defaultModels = [
        ['Gemini 2.5 Pro (Enterprise)', 'OCR / Vision', 'deployed', 98.4, 450, 0, 12450],
        ['OpenAI GPT-4o Mini', 'Extract / Logic', 'deployed', 96.2, 320, 0, 8900],
        ['Llama 3 70B (Local)', 'Signal Aggregator', 'training', 92.1, 1200, 48.2, 450],
        ['Claude 3.5 Sonnet', 'Outreach AI', 'paused', 97.8, 650, 0, 0]
      ];
      for (const m of defaultModels) {
        await dbRunAsync(
          'INSERT INTO ai_models (name, type, status, accuracy, latency_ms, vram_gb, calls_30d) VALUES (?, ?, ?, ?, ?, ?, ?)',
          m
        );
      }
      console.log('🤖 System: AI Models seeded successfully.');
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

    // 2.2 Performance Indexes
    await dbRunAsync('CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id)');
    await dbRunAsync('CREATE INDEX IF NOT EXISTS idx_contacts_is_deleted ON contacts(is_deleted)');
    await dbRunAsync('CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_trail(created_at)');
    await dbRunAsync('CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)');
    
    const patches = [
      { table: 'cards', column: 'location', type: 'TEXT' },
      { table: 'ai_drafts', column: 'version', type: 'INTEGER DEFAULT 1' },
      { table: 'ai_drafts', column: 'status', type: "TEXT DEFAULT 'draft'" },
      { table: 'contact_sequences', column: 'status', type: "TEXT DEFAULT 'active'" }
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
