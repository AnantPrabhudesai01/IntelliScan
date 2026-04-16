const { pgPool } = require('./src/utils/db');

async function migrate() {
    try {
        await pgPool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS name_native TEXT;');
        await pgPool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_native TEXT;');
        await pgPool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS title_native TEXT;');
        console.log('✅ Added native fields successfully!');
        process.exit(0);
    } catch(err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

migrate();
