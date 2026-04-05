const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'intelliscan.db');
const outPath = path.resolve(__dirname, '..', 'DATA_DICTIONARY_INTELLISCAN_DB.md');

const generatedAt = new Date().toISOString();

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[dump_schema] Failed to open DB:', dbPath, err.message);
    process.exitCode = 1;
    return;
  }
});

db.all(
  "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  (err, rows) => {
    if (err) {
      console.error('[dump_schema] Failed to query schema:', err.message);
      process.exitCode = 1;
      db.close();
      return;
    }

    const tables = (rows || []).filter((r) => r && r.name && r.sql);
    const tableList = tables.map((t) => `- \`${t.name}\``).join('\n');
    const ddl = tables
      .map((t) => `-- Table: ${t.name}\n${t.sql.trim()};\n`)
      .join('\n');

    const md = [
      '# IntelliScan Database Schema (intelliscan.db)',
      '',
      `Generated: \`${generatedAt}\``,
      '',
      'This file is generated directly from the local SQLite database used by the server (`intelliscan-server/intelliscan.db`).',
      '',
      '## Table List',
      '',
      tableList || '(No tables found.)',
      '',
      '## Full DDL (sqlite_master)',
      '',
      '```sql',
      ddl,
      '```',
      '',
      '## How To Regenerate',
      '',
      '```powershell',
      'node intelliscan-server/dump_schema_intelliscan_db.cjs',
      '```',
      ''
    ].join('\n');

    fs.writeFileSync(outPath, md, 'utf8');
    console.log('[dump_schema] Wrote:', outPath);
    db.close();
  }
);

