const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./database.sqlite');

async function fix() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Update explicitly if it exists, insert if it doesn't
  db.run(`
    INSERT INTO users (name, email, password, role, tier) 
    VALUES ('Super Admin', 'superadmin@intelliscan.io', ?, 'super_admin', 'enterprise')
    ON CONFLICT(email) DO UPDATE SET password=excluded.password
  `, [hashedPassword], function(err) {
    if (err) {
      console.error('Error fixing db:', err);
    } else {
      console.log('Fixed SuperAdmin password to admin123. Changes:', this.changes);
    }
    
    // Check if it's there
    db.get('SELECT * FROM users WHERE email = ?', ['superadmin@intelliscan.io'], (err, row) => {
      console.log('Row in DB:', row);
    });
  });
}
fix();
