const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path relative to this file's location in src/utils/
const dbPath = path.resolve(__dirname, '../../intelliscan.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[DB] Connection Error:', err.message);
  } else {
    console.log('[DB] Connected to SQLite database at:', dbPath);
  }
});

// Configure busy timeout for concurrent access
db.configure("busyTimeout", 10000);

/**
 * Promisified db.get
 */
function dbGetAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

/**
 * Promisified db.all
 */
function dbAllAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows || [])));
  });
}

/**
 * Promisified db.run
 */
function dbRunAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Promisified db.exec
 */
function dbExecAsync(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
}

module.exports = {
  db,
  dbGetAsync,
  dbAllAsync,
  dbRunAsync,
  dbExecAsync
};
