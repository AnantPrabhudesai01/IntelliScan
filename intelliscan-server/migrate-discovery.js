const { pgPool } = require('./src/utils/db');

async function migrate() {
    try {
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS whatsapp_discoveries (
                id SERIAL PRIMARY KEY,
                discovery_code TEXT UNIQUE NOT NULL,
                phone_number TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ Created whatsapp_discoveries table successfully!');
        process.exit(0);
    } catch(err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

migrate();
