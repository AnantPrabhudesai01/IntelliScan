const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dns = require('dns');
require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

const SQLITE_PATH = path.resolve(__dirname, '../../../database.sqlite');

// 🛡️ ULTRA-STABLE LOCAL ENGINE
const db = new sqlite3.Database(SQLITE_PATH, (err) => {
  if (err) console.error('❌ [DB] Critical failure:', err.message);
  else console.log('📁 [DB] Local Persistence Engaged (Classic Mode).');
});

// ── Async Helpers ──────────────────────────
async function dbGetAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  });
}

async function dbAllAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

async function dbRunAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  db,
  dbGetAsync,
  dbAllAsync,
  dbRunAsync,
  isPostgres: false,
  sql: {
    now: "datetime('now')",
    monthStart: "strftime('%Y-%m-01', 'now')"
  }
};
