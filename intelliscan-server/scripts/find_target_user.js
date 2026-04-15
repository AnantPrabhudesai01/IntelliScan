const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function findUser() {
  try {
    const quotaRes = await pool.query('SELECT user_id, used_count FROM user_quotas WHERE used_count > 0');
    console.log('Quotas > 0:', quotaRes.rows);

    const match = quotaRes.rows.find(r => Number(r.used_count) === 23);
    if (match) {
      console.log(`FOUND TARGET USER ID: ${match.user_id}`);
      const userRes = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [match.user_id]);
      console.log('User Details:', userRes.rows[0]);

      const contactCount = await pool.query('SELECT count(*) FROM contacts WHERE user_id = $1', [match.user_id]);
      console.log(`Contacts found for this ID: ${contactCount.rows[0].count}`);

      const activeCount = await pool.query('SELECT count(*) FROM contacts WHERE user_id = $1 AND is_deleted = FALSE', [match.user_id]);
      console.log(`Active Contacts found for this ID: ${activeCount.rows[0].count}`);
    } else {
      console.log('No user has exactly 23 scans.');
    }

  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    await pool.end();
  }
}

findUser();
