const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../intelliscan.db');
const db = new sqlite3.Database(dbPath);

console.log('--- IntelliScan Profile & Auth Migration ---');

db.serialize(() => {
  // 1. Add new columns to users table
  // Note: SQLite doesn't support adding multiple columns in one ALTER TABLE, nor does it support IF NOT EXISTS for columns in older versions.
  // We'll do them one by one and catch errors if they already exist.
  
  db.run("ALTER TABLE users ADD COLUMN phone_number TEXT", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('[OK] phone_number column already exists');
      } else {
        console.error('[ERR] phone_number:', err.message);
      }
    } else {
      console.log('[NEW] phone_number column added');
    }
  });

  db.run("ALTER TABLE users ADD COLUMN avatar_url TEXT", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('[OK] avatar_url column already exists');
      } else {
        console.error('[ERR] avatar_url:', err.message);
      }
    } else {
      console.log('[NEW] avatar_url column added');
    }
  });

  db.run("ALTER TABLE users ADD COLUMN is_formal_confirmed INTEGER DEFAULT 0", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('[OK] is_formal_confirmed column already exists');
      } else {
        console.error('[ERR] is_formal_confirmed:', err.message);
      }
    } else {
      console.log('[NEW] is_formal_confirmed column added');
    }
  });

  // 2. Create otp_codes table
  db.run(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      type TEXT NOT NULL, -- 'login' or 'email_change'
      target_value TEXT, -- used to store the new email address being verified
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('[ERR] otp_codes table:', err.message);
    } else {
      console.log('[NEW] otp_codes table ready');
    }
  });

  // 3. Seed some phone numbers for existing test accounts
  db.run("UPDATE users SET phone_number = '9876543210' WHERE email = 'pro@intelliscan.io'");
  db.run("UPDATE users SET phone_number = '1234567890' WHERE email = 'free@intelliscan.io'");

  console.log('Migration sequence finished.');
});

db.close();
