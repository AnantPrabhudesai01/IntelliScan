const { pgPool } = require('./src/utils/db');

async function migrate() {
  try {
    console.log('Starting migration: Add sort_order to contacts');
    await pgPool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0');
    console.log('Migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
