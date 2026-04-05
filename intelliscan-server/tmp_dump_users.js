const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../intelliscan.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT id, name, email, role, tier FROM users", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});
