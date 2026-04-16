const { pgPool } = require('./src/utils/db');

async function migrate() {
    try {
        await pgPool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS location_context TEXT;');
        console.log('✅ Added location_context column successfully!');
        process.exit(0);
    } catch(err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

migrate();
