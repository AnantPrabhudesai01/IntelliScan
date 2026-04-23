const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Force IPv4 — many ISPs can't route to Supabase's IPv6 addresses
dns.setDefaultResultOrder('ipv4first');

// ═══════════════════════════════════════════════════════════════
// IntelliScan Database Layer — PostgreSQL (Supabase) ONLY
// ═══════════════════════════════════════════════════════════════

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pgPool;
try {
  pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }, 
    connectionTimeoutMillis: 30000, // Increased to 30s for slow cold-starts
    query_timeout: 45000,           // 45s for heavy AI lookups
    statement_timeout: 45000,
    max: 15,                        // Cap connections to prevent Supabase exhaustion
    idleTimeoutMillis: 30000,       // Close idle connections faster
    keepAlive: true,
  });
  
  // Early check to prevent silent constructor failures from hanging later
  pgPool.query('SELECT 1').catch(err => {
    console.error('❌ Database Connection Test Failed:', err.message);
  });
  
  pgPool.on('error', (err) => {
    console.error('🔥 [DB] Unexpected Pool Error:', err.message);
  });
} catch (err) {
  console.error('🔥 [DB] Fatal Initialization Error:', err.message);
  // We create a mock pool that throws descriptive errors on query to keep the app alive for diagnostics
  pgPool = { 
    query: () => { throw new Error('Database pool failed to initialize. Check your DATABASE_URL.'); },
    on: () => {}
  };
}

// ── Legacy compatibility shim ──────────────────────────────────
// Some older code still uses db.get / db.run / db.all callback style.
// This shim routes those calls through the async Postgres helpers.
const db = {
  get: (sql, params, cb) => {
    const _p = typeof params === 'function' ? [] : params;
    const _cb = typeof params === 'function' ? params : cb;
    dbGetAsync(sql, _p).then(res => _cb && _cb(null, res)).catch(err => _cb && _cb(err));
  },
  all: (sql, params, cb) => {
    const _p = typeof params === 'function' ? [] : params;
    const _cb = typeof params === 'function' ? params : cb;
    dbAllAsync(sql, _p).then(res => _cb && _cb(null, res)).catch(err => _cb && _cb(err));
  },
  run: (sql, params, cb) => {
    const _p = typeof params === 'function' ? [] : params;
    const _cb = typeof params === 'function' ? params : cb;
    dbRunAsync(sql, _p).then(res => {
      if (_cb) _cb.call(res, null);
    }).catch(err => _cb && _cb(err));
  },
  serialize: (fn) => fn(),
  exec: (sql, cb) => dbExecAsync(sql).then(() => cb && cb(null)).catch(err => cb && cb(err)),
  configure: () => {},
  close: () => {}
};

// ── SQL translator ─────────────────────────────────────────────
// Converts SQLite-specific syntax to PostgreSQL equivalents
function translateSqliteToPostgres(sql) {
  let out = sql.trim();
  if (out.endsWith(';')) out = out.slice(0, -1);

  // DDL translations
  out = out.replace(/INTEGER\s+PRIMARY\s+KEY\s+AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
  out = out.replace(/\bAUTOINCREMENT\b/gi, '');
  // Make ADD COLUMN idempotent (PG supports IF NOT EXISTS since v9.6)
  out = out.replace(/ADD\s+COLUMN\s+(?!IF\s+NOT\s+EXISTS)/gi, 'ADD COLUMN IF NOT EXISTS ');
  // Function translations
  out = out.replace(/\bIFNULL\s*\(/gi, 'COALESCE(');
  out = out.replace(/\bDATETIME\b/gi, 'TIMESTAMPTZ');

  // Placeholder conversion: '?' → '$1, $2...'
  let index = 1;
  out = out.replace(/\?/g, () => `$${index++}`);

  return out;
}

// (Backwards-compatible alias)
const convertPlaceholders = translateSqliteToPostgres;

// ── Async helpers ──────────────────────────────────────────────

/** Single row query */
async function dbGetAsync(sql, params = []) {
  const res = await pgPool.query(convertPlaceholders(sql), params);
  return res.rows[0];
}

/** Multiple rows query */
async function dbAllAsync(sql, params = []) {
  const res = await pgPool.query(convertPlaceholders(sql), params);
  return res.rows || [];
}

/** Insert / Update / Delete */
async function dbRunAsync(sql, params = []) {
  let pgSql = convertPlaceholders(sql);
  const trimmedSql = pgSql.trim().toUpperCase();
  const isInsert = trimmedSql.startsWith('INSERT');
  const hasReturning = trimmedSql.includes(' RETURNING ');

  // Only append RETURNING id if it's an insert and doesn't already have one
  if (isInsert && !hasReturning) {
    pgSql += ' RETURNING id';
  }

  try {
    const res = await pgPool.query(pgSql, params);
    return {
      lastID: res.rows[0]?.id || null,
      changes: res.rowCount
    };
  } catch (err) {
    console.error('[DB] Query Error:', {
      message: err.message,
      sql: pgSql,
      paramCount: params.length
    });
    // Fallback for tables without an 'id' column if RETURNING id was auto-appended
    if (err.message.includes('column "id" does not exist')) {
      const retryRes = await pgPool.query(convertPlaceholders(sql), params);
      return { lastID: null, changes: retryRes.rowCount };
    }
    throw err;
  }
}

/** Raw SQL execution */
async function dbExecAsync(sql) {
  return pgPool.query(sql);
}

/** Check if a column exists in a table (Postgres specific) */
async function dbHasColumn(table, column) {
  try {
    const res = await pgPool.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    `, [table, column]);
    return res.rowCount > 0;
  } catch (err) {
    return false;
  }
}

module.exports = {
  db,
  pgPool,
  isPostgres: true, // Always true now
  dbGetAsync,
  dbAllAsync,
  dbRunAsync,
  dbExecAsync,
  dbHasColumn,
  // Dialect-aware SQL snippets (PostgreSQL only now)
  sql: {
    now: 'CURRENT_TIMESTAMP',
    monthStart: "DATE_TRUNC('month', CURRENT_TIMESTAMP)",
    insertIgnore: (table, columns, values) => {
      return `INSERT INTO ${table} (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING`;
    },
    nowPlusMinutes: (m) => `CURRENT_TIMESTAMP + interval '${m} minutes'`,
    reminderCondition: (startCol, minCol) =>
      `(${startCol} - (${minCol} * interval '1 minute')) <= CURRENT_TIMESTAMP`
  }
};

