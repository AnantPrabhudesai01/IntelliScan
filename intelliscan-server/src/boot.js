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
    
    // Example: Auto-adding location column if missing (Pragmatic migration)
    const tableInfoQuery = isPostgres 
      ? "SELECT column_name FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'location'"
      : "PRAGMA table_info(cards)";

    let needsLocation = false;
    if (isPostgres) {
      const res = await pgPool.query(tableInfoQuery);
      needsLocation = res.rowCount === 0;
    } else {
      const columns = await dbAllAsync(tableInfoQuery);
      needsLocation = !columns.some(c => c.name === 'location');
    }

    if (needsLocation) {
      console.log('[Boot] Patching schema: adding missing "location" column to cards table.');
      await dbRunAsync('ALTER TABLE cards ADD COLUMN location TEXT');
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
