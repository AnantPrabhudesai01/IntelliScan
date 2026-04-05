const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

async function seed() {
  const users = [
    { name: 'Super Admin', email: 'superadmin@intelliscan.io', password: 'admin123', role: 'super_admin', tier: 'enterprise' },
    { name: 'Enterprise Admin', email: 'enterprise@intelliscan.io', password: 'admin123', role: 'business_admin', tier: 'enterprise' },
    { name: 'Personal Admin', email: 'personal@intelliscan.io', password: 'user123', role: 'user', tier: 'personal' }
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    db.run(
      "INSERT OR IGNORE INTO users (name, email, password, role, tier) VALUES (?, ?, ?, ?, ?)",
      [u.name, u.email, hashedPassword, u.role, u.tier],
      (err) => {
        if (err) console.error(`Error seeding ${u.email}:`, err.message);
        else console.log(`Seeded: ${u.email}`);
      }
    );
  }
}

seed();
