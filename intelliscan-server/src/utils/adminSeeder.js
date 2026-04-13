const bcrypt = require('bcryptjs');
const { dbGetAsync, dbRunAsync } = require('./db');
const { ensureQuotaRow } = require('./quota');

/**
 * Ensures a default Super Admin account exists in the database.
 * @param {string} email - Default admin email
 * @param {string} name - Default admin name
 * @param {string} password - Default admin password
 */
async function seedDefaultAdmin(email = 'admin@intelliscan.ai', name = 'Super Admin', password = 'adminPassword123') {
  try {
    const existingUser = await dbGetAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      console.log('⏩ Super Admin user already exists. Skipping seeding.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await dbRunAsync(
      "INSERT INTO users (name, email, password, role, tier) VALUES (?, ?, ?, 'super_admin', 'enterprise')",
      [name, email, hashedPassword]
    );

    const userId = result.lastID;
    await ensureQuotaRow(userId, 'enterprise');

    console.log(`🚀 Default Super Admin created!`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: super_admin | Tier: enterprise`);
  } catch (err) {
    console.warn('⚠️  Admin Seeding Warning:', err.message);
  }
}

module.exports = { seedDefaultAdmin };
