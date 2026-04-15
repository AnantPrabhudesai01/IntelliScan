const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function repair() {
  try {
    console.log('--- REPAIRING DATABASE ---');
    
    // 1. Force add columns
    await pool.query("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE");
    await pool.query("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ");
    
    // 2. Clear orphans
    const res = await pool.query("UPDATE contacts SET is_deleted = FALSE WHERE is_deleted IS NULL OR is_deleted = TRUE");
    console.log(`✅ Restored ${res.rowCount} contacts to ACTIVE status.`);

    // 3. Final Check
    const check = await pool.query("SELECT count(*) FROM contacts WHERE is_deleted = FALSE");
    console.log(`📊 TOTAL ACTIVE CONTACTS: ${check.rows[0].count}`);

  } catch (err) {
    console.error('❌ REPAIR FAILED:', err.message);
  } finally {
    await pool.end();
  }
}

repair();
