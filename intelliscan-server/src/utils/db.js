const path = require('path');
const dns = require('dns');
require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

// 🛰️ HYBRID CORE: Detect environment
const isVercel = process.env.VERCEL === '1' || !!process.env.DATABASE_URL;
let db;
let pgPool;

if (isVercel) {
  console.log('🚀 [DB] Cloud Engine Engaged (PostgreSQL).');
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const SQLITE_PATH = path.resolve(__dirname, '../../../database.sqlite');
    db = new sqlite3.Database(SQLITE_PATH, (err) => {
      if (err) console.error('❌ [DB] Local failure:', err.message);
      else console.log('📁 [DB] Local Persistence Engaged (SQLite).');
    });
  } catch (e) {
    console.warn('⚠️ [DB] SQLite not available, falling back to mock mode.');
  }
}

// ── Resilient Async Helpers ──────────────────────────

function sanitizeParams(params) {
  return params.map(p => p === undefined ? null : p);
}

async function dbGetAsync(sql, params = []) {
  const cleanParams = sanitizeParams(params);
  if (isVercel) {
    const result = await pgPool.query(sql.replace(/\?/g, ($, i) => `$${i + 1}`), cleanParams);
    return result.rows[0];
  }
  return new Promise((resolve, reject) => {
    db.get(sql, cleanParams, (err, row) => err ? reject(err) : resolve(row));
  });
}

async function dbAllAsync(sql, params = []) {
  const cleanParams = sanitizeParams(params);
  if (isVercel) {
    const result = await pgPool.query(sql.replace(/\?/g, ($, i) => `$${i + 1}`), cleanParams);
    return result.rows;
  }
  return new Promise((resolve, reject) => {
    db.all(sql, cleanParams, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

async function dbRunAsync(sql, params = []) {
  const cleanParams = sanitizeParams(params);
  if (isVercel) {
    const result = await pgPool.query(sql.replace(/\?/g, ($, i) => `$${i + 1}`), cleanParams);
    return { lastID: result.oid, changes: result.rowCount };
  }
  return new Promise((resolve, reject) => {
    db.run(sql, cleanParams, function(err) {
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
  isPostgres: isVercel,
  sql: {
    now: isVercel ? "CURRENT_TIMESTAMP" : "datetime('now')",
    monthStart: isVercel ? "date_trunc('month', CURRENT_TIMESTAMP)" : "strftime('%Y-%m-01', 'now')"
  }
};
