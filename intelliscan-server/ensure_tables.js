const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  console.log('--- Ensuring AI Future Tables exist ---');

  db.run(`CREATE TABLE IF NOT EXISTS email_sequences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating email_sequences:', err.message);
    else console.log('email_sequences table ready');
  });

  db.run(`CREATE TABLE IF NOT EXISTS email_sequence_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sequence_id INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    delay_days INTEGER DEFAULT 0
  )`, (err) => {
    if (err) console.error('Error creating email_sequence_steps:', err.message);
    else console.log('email_sequence_steps table ready');
  });

  db.run(`CREATE TABLE IF NOT EXISTS contact_sequences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    sequence_id INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    current_step_index INTEGER DEFAULT 0,
    next_send_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating contact_sequences:', err.message);
    else console.log('contact_sequences table ready');
  });

  // Also ensure columns exist in contacts (safe approach with try-catch or silent fail in DB)
  const columns = [
    'ai_enrichment_news',
    'inferred_industry',
    'inferred_seniority',
    'search_vector'
  ];

  columns.forEach(col => {
    db.run(`ALTER TABLE contacts ADD COLUMN ${col} TEXT`, (err) => {
      if (err) {
        if (err.message.includes('duplicate column name')) {
          console.log(`Column ${col} already exists.`);
        } else {
          console.error(`Error adding column ${col}:`, err.message);
        }
      } else {
        console.log(`Column ${col} added to contacts.`);
      }
    });
  });

  console.log('--- DB Fix Complete ---');
});

db.close();
