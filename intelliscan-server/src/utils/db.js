const { Pool } = require('pg');
let sqlite3 = null;
try {
  sqlite3 = require('sqlite3').verbose();
} catch (e) {
  console.log('ℹ️ [DB] SQLite not installed, operating in Cloud-Only mode.');
}
const dns = require('dns');
const path = require('path');
require('dotenv').config();

dns.setDefaultResultOrder('ipv4first');

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const SQLITE_PATH = path.resolve(__dirname, '../../../database.sqlite');

let pgPool = null;
let sqliteDb = null;
let isPostgres = false;

// 🛡️ INITIALIZATION: Try Cloud (Postgres) first, fallback to Local (SQLite) if available
if (DATABASE_URL && !DATABASE_URL.includes('localhost')) {
  try {
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }, 
      connectionTimeoutMillis: 10000,
    });
    isPostgres = true;
    console.log('✅ [DB] Cloud Persistence (PostgreSQL) Engaged.');
  } catch (err) {
    console.warn('⚠️ [DB] Cloud init failed:', err.message);
  }
}

if (!isPostgres && sqlite3) {
  sqliteDb = new sqlite3.Database(SQLITE_PATH, (err) => {
    if (err) console.error('❌ [DB] Local SQLite critical failure:', err.message);
    else console.log('📁 [DB] Local Persistence (SQLite) Engaged.');
  });
}

// ── SQL Translator (Lite -> PG) ────────────────────────────────
function translate(sql) {
  if (!isPostgres) return sql;
  let out = sql.trim();
  out = out.replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
  out = out.replace(/\bIFNULL\s*\(/gi, 'COALESCE(');
  let index = 1;
  out = out.replace(/\?/g, () => `$${index++}`);
  return out;
}

// ── Async Helpers (Unified Interface) ──────────────────────────
async function dbGetAsync(sql, params = []) {
  try {
    if (isPostgres && pgPool) {
      const res = await pgPool.query(translate(sql), params);
      return res.rows[0];
    }
    if (sqliteDb) {
      return new Promise((resolve, reject) => {
        sqliteDb.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
      });
    }
  } catch (err) {
    console.error('❌ [DB] dbGetAsync failed:', err.message);
  }
  return null;
}

async function dbAllAsync(sql, params = []) {
  try {
    if (isPostgres && pgPool) {
      const res = await pgPool.query(translate(sql), params);
      return res.rows || [];
    }
    if (sqliteDb) {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
      });
    }
  } catch (err) {
    console.error('❌ [DB] dbAllAsync failed:', err.message);
  }
  return [];
}

async function dbRunAsync(sql, params = []) {
  try {
    if (isPostgres && pgPool) {
      const res = await pgPool.query(translate(sql), params);
      return { lastID: res.rows[0]?.id || null, changes: res.rowCount };
    }
    if (sqliteDb) {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
  } catch (err) {
    console.error('❌ [DB] dbRunAsync failed:', err.message);
  }
  return { lastID: null, changes: 0 };
}

module.exports = {
  dbGetAsync,
  dbAllAsync,
  dbRunAsync,
  isPostgres,
  sql: {
    now: isPostgres ? 'CURRENT_TIMESTAMP' : "datetime('now')",
    monthStart: isPostgres ? "DATE_TRUNC('month', CURRENT_TIMESTAMP)" : "strftime('%Y-%m-01', 'now')"
  }
};
