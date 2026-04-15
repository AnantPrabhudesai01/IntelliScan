const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateSchema() {
  try {
    console.log('--- UPDATING DATABASE SCHEMA ---');
    await pool.query("ALTER TABLE contacts ADD COLUMN IF NOT EXISTS location_context TEXT");
    console.log('✅ Column location_context added to contacts table.');
  } catch (err) {
    console.error('❌ Update failed:', err.message);
  } finally {
    await pool.end();
  }
}

updateSchema();
