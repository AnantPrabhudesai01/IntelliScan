import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function findRepoRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    const hasApp = isDirectory(path.join(dir, 'intelliscan-app'));
    const hasServer = isDirectory(path.join(dir, 'intelliscan-server'));
    if (hasApp && hasServer) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = findRepoRoot(SCRIPT_DIR);

const SOURCE_SCHEMA_MD = path.join(ROOT, 'DATA_DICTIONARY_INTELLISCAN_DB.md');
const OUT_PATH = path.join(ROOT, 'INTELLISCAN_DATA_DICTIONARY_DETAILED.md');

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function normalizeWhitespace(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function stripInlineSqlComment(line) {
  // Split only on `--` comment markers, but keep comment for documentation.
  const idx = line.indexOf('--');
  if (idx === -1) return { code: line, comment: '' };
  return {
    code: line.slice(0, idx).trimEnd(),
    comment: line.slice(idx + 2).trim()
  };
}

function findCreateStatements(schemaMd) {
  // Source format: `-- Table: table_name` then `CREATE TABLE ...;`
  const blocks = [];
  const re = /--\s*Table:\s*([a-zA-Z0-9_]+)\s*\r?\n([\s\S]*?)(?=\r?\n--\s*Table:|\r?\n```)/g;
  let m;
  while ((m = re.exec(schemaMd))) {
    const table = m[1];
    const body = m[2] || '';
    const createIdx = body.toUpperCase().indexOf('CREATE TABLE');
    if (createIdx === -1) continue;
    const stmt = body.slice(createIdx).trim();
    // ensure statement ends at first semicolon
    const semi = stmt.indexOf(';');
    const createStmt = semi !== -1 ? stmt.slice(0, semi + 1) : stmt;
    blocks.push({ table, createStmt });
  }
  return blocks;
}

function findMatchingParen(sql, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitTopLevelComma(inner) {
  const items = [];
  let depth = 0;
  let buf = '';
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '(') depth += 1;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      items.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) items.push(buf);
  return items.map((s) => s.trim()).filter(Boolean);
}

function parseCreateTable(createStmt) {
  const up = createStmt.toUpperCase();
  const open = up.indexOf('(');
  if (open === -1) return { columns: [], constraints: [] };
  const close = findMatchingParen(createStmt, open);
  if (close === -1) return { columns: [], constraints: [] };
  const inner = createStmt.slice(open + 1, close);
  const parts = splitTopLevelComma(inner);

  const columns = [];
  const constraints = [];

  for (const rawPart of parts) {
    const { code, comment } = stripInlineSqlComment(rawPart);
    const part = code.trim();
    if (!part) continue;

    const upper = part.toUpperCase();
    const isConstraint =
      upper.startsWith('FOREIGN KEY') ||
      upper.startsWith('UNIQUE') ||
      upper.startsWith('CHECK') ||
      upper.startsWith('PRIMARY KEY') ||
      upper.startsWith('CONSTRAINT');

    if (isConstraint) {
      constraints.push({ sql: normalizeWhitespace(part), comment });
      continue;
    }

    // Column format: name TYPE [constraints...]
    const tokens = part.split(/\s+/).filter(Boolean);
    const name = (tokens[0] || '').replace(/^[`"']|[`"']$/g, '');
    const type = tokens[1] || '';
    const tail = tokens.slice(2).join(' ');
    columns.push({
      name,
      type: type.toUpperCase(),
      raw: normalizeWhitespace(part),
      tail: normalizeWhitespace(tail),
      comment: comment || ''
    });
  }

  return { columns, constraints };
}

function constraintsLabel(col) {
  const tailUpper = String(col.tail || '').toUpperCase();
  const labels = [];
  if (col.raw.toUpperCase().includes('PRIMARY KEY')) labels.push('PK');
  if (tailUpper.includes('NOT NULL')) labels.push('NOT NULL');
  if (tailUpper.includes('UNIQUE')) labels.push('UNIQUE');

  const def = col.tail.match(/\bDEFAULT\b\s+(.+)$/i);
  if (def) labels.push(`DEFAULT ${normalizeWhitespace(def[1])}`);

  const ref = col.tail.match(/\bREFERENCES\b\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/i);
  if (ref) labels.push(`FK -> ${ref[1]}(${normalizeWhitespace(ref[2])})`);

  return labels.join(', ');
}

const TABLE_PURPOSE = {
  users: 'User accounts with role and subscription tier. Workspace membership is represented via workspace_id.',
  sessions: 'Active sessions for signed-in devices. Used for session listing and revocation.',
  user_quotas: 'Per-user usage counters and monthly cycle quota limits for scans and group scans.',
  contacts: 'Core CRM entity created from scans. Stores extracted fields, enrichment fields, deal/pipeline fields, and multilingual/native-script fields.',
  events: 'Events and campaigns to group scanned contacts (trade shows, conferences).',
  ai_drafts: 'AI-generated follow-up drafts linked to contacts.',
  email_campaigns: 'Email campaigns (subject/body) for outbound marketing.',
  email_sends: 'Per-recipient send records (opens, statuses).',
  email_clicks: 'Per-send click tracking events.',
  email_lists: 'Named contact lists used as campaign audiences.',
  email_list_contacts: 'Membership table linking contacts/emails to lists.',
  email_templates: 'Reusable email templates for campaigns and sequences.',
  email_sequences: 'Multi-step outreach sequences.',
  email_sequence_steps: 'Steps for a sequence (delays, content).',
  contact_sequences: 'Enrollment records linking contacts to sequences.',
  webhooks: 'Webhook endpoints for on_scan / on_deal_update notifications.',
  crm_mappings: 'Legacy/simple CRM mapping storage (older schema variant).',
  crm_sync_log: 'CRM sync activity log for exports and provider status.',
  routing_rules: 'Lead routing if/then rules applied to contacts.',
  deals: 'Pipeline stage/value metadata tied to contacts.',
  workspace_policies: 'Compliance policies per workspace scope (retention, PII redaction, audit strictness).',
  audit_trail: 'Immutable-ish audit trail for sensitive actions (exports, policy changes, billing).',
  integration_sync_jobs: 'Integration sync jobs (failed syncs, retries, provider health).',
  data_quality_dedupe_queue: 'Queue of dedupe candidates for workspace admin review (merge/dismiss).',
  platform_incidents: 'Super admin incident records (status, ack/resolve).',
  ai_models: 'AI model registry and deploy/training/paused status flags.',
  model_versions: 'Model version history and rollback support.',
  engine_config: 'Engine configuration parameters (limits, toggles, model selection).',
  calendars: 'Calendars owned by users/workspaces for scheduling.',
  calendar_events: 'Calendar events, including recurring rules and attendees.',
  availability_slots: 'Availability windows used for booking.',
  booking_links: 'Public booking links that map to availability.',
  calendar_shares: 'Sharing tokens for calendar access.',
  event_attendees: 'Attendees for events and meetings.',
  event_reminders: 'Reminder configuration records for events.',
  event_contact_links: 'Join table linking events and contacts.',
  workspace_chats: 'Workspace chat message storage (with socket.io).',
  onboarding_prefs: 'Onboarding preferences captured during first run.',
  analytics_logs: 'Analytics events and usage telemetry.',
  api_sandbox_calls: 'Sandbox/test API call logs from the API explorer tools.',
  email_automations: 'Automation rules for email marketing workflows.',
  campaign_recipients: 'Denormalized recipient lists for campaign sends.',
  digital_cards: 'Public-facing digital business cards and their analytics.',
  saved_cards: 'Saved card designs or OCR artifacts (implementation dependent).',
  contact_relationships: 'Relationship intelligence between contacts (mutuals, org mapping).'
};

const COLUMN_OVERRIDES = {
  users: {
    password: 'Password hash (bcrypt). Stored server-side only.'
  },
  contacts: {
    workspace_scope: 'Workspace scope identifier used for workspace-wide queries (derived from workspace_id or user scope).',
    crm_synced: '1 if the contact has been synced/exported to the configured CRM provider.',
    search_vector: 'Text blob used for semantic search / indexing (implementation-dependent).',
    name_native: 'Name preserved in original script when card is non-Latin.',
    company_native: 'Company preserved in original script when card is non-Latin.',
    title_native: 'Title preserved in original script when card is non-Latin.',
    detected_language: 'Primary detected language for the business card text.'
  },
  billing_orders: {
    razorpay_order_id: 'Order id returned by Razorpay Orders API.',
    razorpay_payment_id: 'Payment id returned by Razorpay Checkout.',
    razorpay_signature: 'Signature used for server-side verification.'
  }
};

function describeColumn(table, col) {
  const name = col.name;
  const comment = normalizeWhitespace(col.comment || '');

  if (COLUMN_OVERRIDES[table] && COLUMN_OVERRIDES[table][name]) {
    return COLUMN_OVERRIDES[table][name];
  }

  if (comment) return comment;

  const lower = name.toLowerCase();
  if (lower === 'id') return 'Primary key identifier.';
  if (lower === 'user_id') return 'Foreign key reference to users.id (actor/owner).';
  if (lower === 'workspace_id') return 'Workspace identifier (organization scope).';
  if (lower.endsWith('_at')) return 'Timestamp field.';
  if (lower === 'created_at') return 'Created timestamp.';
  if (lower === 'updated_at') return 'Updated timestamp.';
  if (lower === 'status') return 'Workflow status for this record.';
  if (lower === 'email') return 'Email address.';
  if (lower === 'name') return 'Human-readable name/title.';
  if (lower === 'role') return 'Role used for access control (RBAC).';
  if (lower === 'tier') return 'Subscription tier used for quotas and feature gating.';
  if (lower === 'token') return 'Opaque token used for authentication or sharing.';
  if (lower.includes('amount')) return 'Monetary amount (minor units depending on column).';
  if (lower.includes('currency')) return 'Currency code (e.g., INR).';
  if (lower.includes('url')) return 'URL or link string.';
  if (lower.includes('json')) return 'JSON-encoded payload.';
  return '';
}

function mdTable(rows) {
  if (!rows.length) return '';
  const widths = [];
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      const len = String(cell || '').length;
      widths[i] = Math.max(widths[i] || 0, len);
    });
  });
  const lines = [];
  rows.forEach((row, idx) => {
    const padded = row.map((cell, i) => {
      const s = String(cell || '');
      return s + ' '.repeat(Math.max(0, (widths[i] || 0) - s.length));
    });
    lines.push(`| ${padded.join(' | ')} |`);
    if (idx === 0) {
      lines.push(`| ${widths.map((w) => '-'.repeat(Math.max(3, w))).join(' | ')} |`);
    }
  });
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(SOURCE_SCHEMA_MD)) {
    throw new Error(`Missing schema source: ${SOURCE_SCHEMA_MD}`);
  }

  const schemaMd = readText(SOURCE_SCHEMA_MD);
  const blocks = findCreateStatements(schemaMd);

  const parsed = blocks.map((b) => {
    const details = parseCreateTable(b.createStmt);
    return { table: b.table, createStmt: b.createStmt, ...details };
  });

  parsed.sort((a, b) => a.table.localeCompare(b.table));

  const out = [];
  out.push('# IntelliScan Data Dictionary (Detailed)');
  out.push('');
  out.push('Generated: 2026-04-04');
  out.push(`Source: \`${path.basename(SOURCE_SCHEMA_MD)}\` (extracted from \`intelliscan-server/intelliscan.db\`)`);
  out.push('');
  out.push('This document provides a human-readable data dictionary derived from the real database schema.');
  out.push('For the authoritative DDL, use: `DATA_DICTIONARY_INTELLISCAN_DB.md`.');
  out.push('');
  out.push('---');
  out.push('');
  out.push('## 1) Conventions');
  out.push('');
  out.push('- PK: Primary key');
  out.push('- FK: Foreign key reference');
  out.push('- Defaults and enum-like comments are shown when available');
  out.push('- Many-to-many links are typically stored as join tables (e.g., list membership)');
  out.push('');
  out.push('---');
  out.push('');
  out.push('## 2) Table Index');
  out.push('');
  parsed.forEach((t) => {
    const purpose = TABLE_PURPOSE[t.table] || 'Table used by IntelliScan features (purpose not annotated).';
    out.push(`- \`${t.table}\`: ${purpose}`);
  });
  out.push('');
  out.push('---');
  out.push('');
  out.push('## 3) Tables (Detailed)');
  out.push('');

  parsed.forEach((t) => {
    const purpose = TABLE_PURPOSE[t.table] || 'Table used by IntelliScan features (purpose not annotated).';
    out.push(`### Table: \`${t.table}\``);
    out.push('');
    out.push(purpose);
    out.push('');

    const pkCols = t.columns.filter((c) => c.raw.toUpperCase().includes('PRIMARY KEY')).map((c) => c.name);
    if (pkCols.length) {
      out.push(`Primary key: \`${pkCols.join(', ')}\``);
      out.push('');
    }

    const fkCols = t.columns
      .map((c) => {
        const m = c.tail.match(/\bREFERENCES\b\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/i);
        if (!m) return null;
        return `${c.name} -> ${m[1]}(${normalizeWhitespace(m[2])})`;
      })
      .filter(Boolean);
    if (fkCols.length) {
      out.push('Foreign keys:');
      fkCols.forEach((fk) => out.push(`- \`${fk}\``));
      out.push('');
    }

    if (t.constraints.length) {
      out.push('Table constraints:');
      t.constraints.forEach((c) => out.push(`- \`${c.sql}\`${c.comment ? ` (${c.comment})` : ''}`));
      out.push('');
    }

    const rows = [['Column', 'Type', 'Constraints', 'Description']];
    t.columns.forEach((c) => {
      rows.push([
        `\`${c.name}\``,
        c.type || '',
        constraintsLabel(c),
        describeColumn(t.table, c)
      ]);
    });
    out.push(mdTable(rows));
    out.push('');
    out.push('---');
    out.push('');
  });

  fs.writeFileSync(OUT_PATH, out.join('\n'), 'utf8');
  console.log('[data-dict] Wrote:', OUT_PATH);
}

main();

