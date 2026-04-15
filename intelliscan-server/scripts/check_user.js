const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkUser() {
  try {
    const phone = '+918160551448';
    console.log(`Searching for user with phone: ${phone}`);
    
    const res = await pool.query("SELECT id, name, email, phone_number, tier FROM users WHERE phone_number = $1 OR phone_number = '918160551448'", [phone]);
    
    if (res.rows.length === 0) {
      console.warn('❌ NO USER FOUND with this phone number.');
      const allUsers = await pool.query("SELECT name, email, phone_number FROM users LIMIT 5");
      console.log('Sample Users in DB:', allUsers.rows);
    } else {
      console.log('✅ USER FOUND:', res.rows[0]);
    }

  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    await pool.end();
  }
}

checkUser();
