const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve('intelliscan.db'));

db.all("SELECT name, sql FROM sqlite_master WHERE type='table';", (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  rows.forEach(row => {
    console.log(`-- Table: ${row.name}\n${row.sql};\n`);
  });
  db.close();
});
