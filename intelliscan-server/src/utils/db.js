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
  return params.map(p => {
    if (p === undefined || p === null) return null;
    if (typeof p === 'number' && !Number.isFinite(p)) return null;
    return p;
  });
}

// 🛰️ TRANSFORM: Convert '?' to '$1', '$2', etc. for PostgreSQL
function transformSql(sql) {
  if (!isVercel) return sql;
  let i = 1;
  return sql.replace(/\?/g, () => `$${i++}`);
}

function withReturningId(sql) {
  if (!isVercel) return sql;
  const raw = String(sql || '');
  const trimmed = raw.trim();
  if (!/^insert\s+/i.test(trimmed)) return sql;
  if (/\breturning\b/i.test(trimmed)) return sql;

  // Some tables (e.g. caches) may not have an `id` column.
  // Add exceptions here if needed.
  if (/\binsert\s+into\s+coach_insights_cache\b/i.test(trimmed)) return sql;

  const noSemi = trimmed.replace(/;\s*$/, '');
  return `${noSemi} RETURNING id`;
}

async function dbGetAsync(sql, params = []) {
  const cleanParams = sanitizeParams(params);
  if (isVercel) {
    const result = await pgPool.query(transformSql(sql), cleanParams);
    return result.rows[0];
  }
  return new Promise((resolve, reject) => {
    db.get(sql, cleanParams, (err, row) => err ? reject(err) : resolve(row));
  });
}

async function dbAllAsync(sql, params = []) {
  const cleanParams = sanitizeParams(params);
  if (isVercel) {
    const result = await pgPool.query(transformSql(sql), cleanParams);
    return result.rows;
  }
  return new Promise((resolve, reject) => {
    db.all(sql, cleanParams, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

async function dbRunAsync(sql, params = []) {
  const cleanParams = sanitizeParams(params);
  if (isVercel) {
    const result = await pgPool.query(transformSql(withReturningId(sql)), cleanParams);
    // Postgres only returns inserted IDs when the query includes a `RETURNING` clause.
    // Standardize on `{ lastID, changes }` to match sqlite's API.
    let lastID = null;
    const firstRow = result?.rows?.[0];
    if (firstRow && typeof firstRow === 'object') {
      if (Object.prototype.hasOwnProperty.call(firstRow, 'id')) {
        lastID = firstRow.id;
      } else if (Object.keys(firstRow).length === 1) {
        lastID = Object.values(firstRow)[0];
      }
    }
    return { lastID, changes: result.rowCount };
  }
  return new Promise((resolve, reject) => {
    db.run(sql, cleanParams, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// 🛡️ ALIAS: Some modules expect 'dbExecAsync' for non-returning queries
const dbExecAsync = dbRunAsync;

module.exports = {
  db,
  pgPool,
  dbGetAsync,
  dbAllAsync,
  dbRunAsync,
  dbExecAsync,
  isPostgres: isVercel,
  sql: {
    now: isVercel ? "CURRENT_TIMESTAMP" : "datetime('now')",
    monthStart: isVercel ? "date_trunc('month', CURRENT_TIMESTAMP)" : "strftime('%Y-%m-01', 'now')"
  }
};
