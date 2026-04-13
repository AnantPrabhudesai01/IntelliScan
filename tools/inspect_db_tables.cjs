const sqlite3 = require('sqlite3').verbose();

const dbPath = process.argv[2] || 'intelliscan-server/intelliscan.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open DB:', err.message);
    process.exit(1);
  }
});

db.all(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  [],
  (err, rows) => {
    if (err) {
      console.error('Query failed:', err.message);
      process.exit(1);
    }

    console.log(rows.map((r) => r.name).join('\n'));
    db.close();
  }
);

