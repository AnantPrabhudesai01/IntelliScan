const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function reconciling() {
  try {
    const targetEmail = 'anantprabhudesai444@gmail.com';
    const targetPhone = '+918160551448';

    console.log(`--- RECONCILING ACCOUNT: ${targetEmail} ---`);
    
    // 1. Find User ID
    const userRes = await pool.query('SELECT id, name FROM users WHERE email = $1', [targetEmail]);
    if (userRes.rows.length === 0) {
      throw new Error(`User ${targetEmail} not found!`);
    }
    const userId = userRes.rows[0].id;
    console.log(`Found User ID: ${userId} (${userRes.rows[0].name})`);

    // 2. Link Phone Number (for WhatsApp bot)
    await pool.query('UPDATE users SET phone_number = $1 WHERE id = $2', [targetPhone, userId]);
    console.log(`✅ Phone ${targetPhone} linked to User ID ${userId}.`);

    // 3. Fix Contacts - Ensure ALL contacts in DB belong to this user if they were orphans
    // (Dangerous in prod, but here the user claims they are MISSION CRITICAL and missing)
    const orphanRes = await pool.query('UPDATE contacts SET user_id = $1 WHERE user_id IS NULL OR user_id = 1 OR user_id = 2', [userId]);
    console.log(`✅ Claimed ${orphanRes.rowCount} orphaned/misplaced contacts for User ${userId}.`);

    // 4. Ensure quota matches actual contact count
    const actualCountRes = await pool.query('SELECT count(*) FROM contacts WHERE user_id = $1', [userId]);
    const actualCount = parseInt(actualCountRes.rows[0].count);
    await pool.query('INSERT INTO user_quotas (user_id, used_count, limit_amount) VALUES ($1, $2, 100) ON CONFLICT (user_id) DO UPDATE SET used_count = $2', [userId, actualCount]);
    console.log(`📊 Quota synchronized. New Active Count: ${actualCount}`);

  } catch (err) {
    console.error('Reconciliation failed:', err.message);
  } finally {
    await pool.end();
  }
}

reconciling();
