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
  // Walk upwards until we find the IntelliScan mono-repo markers.
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    const hasApp = isDirectory(path.join(dir, 'intelliscan-app'));
    const hasServer = isDirectory(path.join(dir, 'intelliscan-server'));
    if (hasApp && hasServer) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir; // fallback
}

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = findRepoRoot(SCRIPT_DIR);
const OUT_PATH = path.join(ROOT, 'INTELLISCAN_SYSTEM_ARCHITECTURE_AND_DESIGN.md');

const EXCLUDE_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.sixth'
]);

const WRAPPER_COMPONENTS = new Set([
  'Route',
  'RoleGuard',
  'DashboardLayout',
  'AdminLayout',
  'RequireAuth',
  'Navigate'
]);

const FEATURE_DESCRIPTIONS = {
  dashboard_scan: 'Scan business cards (single + group + batch)',
  batch_upload: 'Batch upload queue for scanning multiple images',
  contacts: 'Contacts CRM (view/search/delete/export/enrich)',
  events: 'Events & campaigns (tag scans to events, filter contacts by event)',
  ai_drafts: 'AI follow-up drafts (generate, edit, send, queue)',
  ai_coach: 'AI networking coach insights',
  kiosk_mode: 'Kiosk/event capture mode',
  digital_card: 'Digital business card + card creator',
  workspace_contacts: 'Workspace-scoped contact access',
  workspace_members: 'Team members and invitations',
  workspace_scanner_links: 'Scanner links / public scan tokens (workspace tooling)',
  workspace_crm_mapping: 'CRM mapping + provider connect/disconnect + schema + export',
  workspace_routing_rules: 'Lead routing rules (if/then) + run rules',
  workspace_data_policies: 'Compliance policies (retention, masking toggles, audit storage)',
  workspace_data_quality: 'Data Quality Center (dedupe queue + merge/dismiss)',
  workspace_campaigns: 'Workspace AI campaign builder (audience preview + AI copy + send)',
  workspace_analytics: 'Analytics dashboards',
  workspace_org_chart: 'Org chart and relationship intelligence',
  workspace_billing: 'Billing & usage overview, payment methods, invoices',
  workspace_shared_rolodex: 'Shared rolodex + workspace chat room',
  api_integrations: 'API sandbox/integrations tooling',
  admin_platform: 'Super admin platform features (models, incidents, system health)'
};

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

function rel(p) {
  return toPosix(path.relative(ROOT, p));
}

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function safeReadText(p) {
  try {
    return readText(p);
  } catch {
    return '';
  }
}

function safeReadTextAutoEncoding(p) {
  try {
    const buf = fs.readFileSync(p);
    const sampleLen = Math.min(buf.length, 4096);
    let zeroCount = 0;
    for (let i = 0; i < sampleLen; i++) {
      if (buf[i] === 0) zeroCount += 1;
    }
// [MermaidChart: 4ef3b8f6-04a1-4e7f-8cd5-b6bec551bf4c]
    const zeroRatio = sampleLen ? zeroCount / sampleLen : 0;  
    // Heuristic: UTF-16LE text often contains many 0x00 bytes.
    if (zeroRatio > 0.2) return buf.toString('utf16le');
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

function walkFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (EXCLUDE_DIRS.has(ent.name)) continue;
      out.push(...walkFiles(path.join(dir, ent.name)));
      continue;
    }
    if (ent.isFile()) out.push(path.join(dir, ent.name));
  }
  return out;
}

function treeLines(dir, label = null) {
  const baseLabel = label || rel(dir) || '.';
  const lines = [baseLabel];

  function inner(currentDir, prefix) {
    const entries = fs
      .readdirSync(currentDir, { withFileTypes: true })
      .filter((e) => !(e.isDirectory() && EXCLUDE_DIRS.has(e.name)))
      .sort((a, b) => {
        // Dirs first, then files
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

    entries.forEach((ent, idx) => {
      const isLast = idx === entries.length - 1;
      const branch = isLast ? '└── ' : '├── ';
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');
      const full = path.join(currentDir, ent.name);

      lines.push(prefix + branch + ent.name);
      if (ent.isDirectory()) inner(full, nextPrefix);
    });
  }

  inner(dir, '');
  return lines;
}

function extractApiEndpointsFromSource(src) {
  const matches = src.match(/\/api\/[^\s"'`<>]+/g) || [];
  const cleaned = matches
    .map((m) => m.replace(/[),;}\]]+$/, ''))
    .map((m) => m.replace(/\$\{[^}]+\}/g, ':param').replace(/\/+$/, ''))
    .filter((m) => m.startsWith('/api/'));
  return Array.from(new Set(cleaned)).sort();
}

function parseImportMap(appJsx, appFilePath) {
  const baseDir = path.dirname(appFilePath);
  const map = new Map();
  const importRe = /^import\s+([A-Za-z0-9_]+)\s+from\s+'([^']+)';/gm;
  for (const m of appJsx.matchAll(importRe)) {
    const name = m[1];
    const spec = m[2];
    const direct = path.resolve(baseDir, spec);
    const candidates = [direct, direct + '.jsx', direct + '.js', direct + '.json'];
    const resolved = candidates.find((c) => isFile(c)) || null;
    if (resolved) map.set(name, resolved);
  }
  return map;
}

function parseAllowedRolesFromLine(line) {
  const m = line.match(/allowedRoles=\{\[([^\]]+)\]\}/);
  if (!m) return [];
  return Array.from(m[1].matchAll(/'([^']+)'/g)).map((x) => x[1]);
}

function extractComponentFromRouteLine(line) {
  const tokens = Array.from(line.matchAll(/<([A-Za-z0-9_]+)\b/g)).map((x) => x[1]);
  const filtered = tokens.filter((t) => !WRAPPER_COMPONENTS.has(t));
  if (!filtered.length) return null;
  return filtered[filtered.length - 1];
}

function parseExplicitRoutes(appJsx, appFilePath, importMap) {
  const routes = [];
  const lines = appJsx.split(/\r?\n/);
  for (const line of lines) {
    if (!line.includes('<Route path="')) continue;
    const m = line.match(/<Route\s+path="([^"]+)"/);
    if (!m) continue;
    const routePath = m[1];
    const roles = parseAllowedRolesFromLine(line);
    const component = extractComponentFromRouteLine(line) || 'Unknown';
    const filePath = importMap.get(component) || null;
    routes.push({ routePath, roles, component, filePath });
  }
  return routes;
}

function extractBackendApiRoutes(serverIndexSrc) {
  const out = [];
  const re = /app\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(serverIndexSrc))) {
    const method = m[1].toUpperCase();
    const p = m[2];
    if (!p.startsWith('/api/')) continue;
    out.push({ method, path: p });
  }
  // Unique + stable sort
  const seen = new Set();
  const uniq = [];
  out.forEach((r) => {
    const key = `${r.method} ${r.path}`;
    if (seen.has(key)) return;
    seen.add(key);
    uniq.push(r);
  });
  uniq.sort((a, b) => (a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path)));
  return uniq;
}

function extractTierLimits(serverIndexSrc) {
  // Best-effort: parse resolveTierLimits return values.
  // If parsing fails, fall back to known defaults from the current codebase.
  const defaults = {
    personal: { single: 10, group: 1 },
    pro: { single: 100, group: 10 },
    enterprise: { single: 99999, group: 99999 }
  };

  try {
    const fnMatch = serverIndexSrc.match(/function\s+resolveTierLimits\s*\(\s*tier\s*\)\s*\{([\s\S]*?)\n\}/m);
    if (!fnMatch) return defaults;
    const body = fnMatch[1];

    function pickNum(re) {
      const mm = body.match(re);
      return mm ? Number(mm[1]) : null;
    }

    const entSingle = pickNum(/normalizedTier\s*===\s*'enterprise'[\s\S]*?single:\s*(\d+)/m);
    const entGroup = pickNum(/normalizedTier\s*===\s*'enterprise'[\s\S]*?group:\s*(\d+)/m);
    const proSingle = pickNum(/normalizedTier\s*===\s*'pro'[\s\S]*?single:\s*(\d+)/m);
    const proGroup = pickNum(/normalizedTier\s*===\s*'pro'[\s\S]*?group:\s*(\d+)/m);
    const result = {
      personal: { ...defaults.personal },
      pro: { ...defaults.pro },
      enterprise: { ...defaults.enterprise }
    };

    if (entSingle != null) result.enterprise.single = entSingle;
    if (entGroup != null) result.enterprise.group = entGroup;
    if (proSingle != null) result.pro.single = proSingle;
    if (proGroup != null) result.pro.group = proGroup;
    // Default/personal is the last return statement in the function body.
    const returns = Array.from(body.matchAll(/return\s*\{\s*single:\s*(\d+)\s*,\s*group:\s*(\d+)\s*\};/gm));
    if (returns.length) {
      const last = returns[returns.length - 1];
      result.personal.single = Number(last[1]);
      result.personal.group = Number(last[2]);
    }

    return result;
  } catch {
    return defaults;
  }
}

function extractFeatureFlags(serverIndexSrc) {
  // Best-effort parse of buildAccessProfile feature flags keys.
  const start = serverIndexSrc.indexOf('const featureFlags = {');
  if (start === -1) return [];
  const tail = serverIndexSrc.slice(start);
  const end = tail.indexOf('};');
  if (end === -1) return [];
  const objBody = tail.slice('const featureFlags = {'.length, end);
  const keys = Array.from(objBody.matchAll(/^\s*([a-zA-Z0-9_]+)\s*:/gm)).map((m) => m[1]);
  return Array.from(new Set(keys)).sort();
}

function extractDbTablesFromSchema(schemaText) {
  const matches = Array.from(schemaText.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi));
  const tables = matches
    .map((m) => String(m[1] || '').trim())
    .filter((t) => t && t.toLowerCase() !== 'sqlite_sequence')
    .map((t) => t.replace(/["'`]/g, ''));
  return Array.from(new Set(tables)).sort();
}

function buildPageApiMap(routes) {
  const map = new Map();
  for (const r of routes) {
    if (!r.filePath || !isFile(r.filePath)) continue;
    const src = safeReadText(r.filePath);
    const apis = extractApiEndpointsFromSource(src);
    map.set(r.routePath, { component: r.component, filePath: r.filePath, roles: r.roles, apis });
  }
  return map;
}

function mdTable(rows) {
  // rows: array of arrays (string)
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
  const appPath = path.join(ROOT, 'intelliscan-app', 'src', 'App.jsx');
  const serverIndexPath = path.join(ROOT, 'intelliscan-server', 'index.js');
  const genRoutesPath = path.join(ROOT, 'intelliscan-app', 'src', 'pages', 'generated', 'routes.json');

  const appSrc = safeReadText(appPath);
  const serverIndexSrc = safeReadText(serverIndexPath);

  const importMap = parseImportMap(appSrc, appPath);
  const explicitRoutes = parseExplicitRoutes(appSrc, appPath, importMap);
  const pageApiMap = buildPageApiMap(explicitRoutes);

  const backendRoutes = extractBackendApiRoutes(serverIndexSrc);
  const tierLimits = extractTierLimits(serverIndexSrc);
  const featureFlags = extractFeatureFlags(serverIndexSrc);
  const dbSchemaPath = path.join(ROOT, 'intelliscan-server', 'db_schema.txt');
  const dbSchemaText = isFile(dbSchemaPath) ? safeReadTextAutoEncoding(dbSchemaPath) : '';
  const dbTables = dbSchemaText ? extractDbTablesFromSchema(dbSchemaText) : [];

  const generatedRoutes = isFile(genRoutesPath) ? JSON.parse(readText(genRoutesPath)) : [];

  const lines = [];
  lines.push('# IntelliScan System Architecture & System Design (Frontend + Backend)');
  lines.push('');
  lines.push('Generated: 2026-04-04');
  lines.push(`Repo Root: \`${toPosix(ROOT)}\``);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 1) System Summary');
  lines.push('');
  lines.push('IntelliScan is a business-card intelligence platform that captures contacts from images (single, group, and batch), stores them in a workspace-scoped database, and powers downstream workflows like AI drafts, outbound campaigns, routing rules, CRM export, webhooks, and billing-based plan enforcement.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 2) High-Level Architecture');
  lines.push('');
  lines.push('```mermaid');
  lines.push('flowchart LR');
  lines.push('  U["User Browser"] --> FE["React App (Vite)"]');
  lines.push('  FE -->|"/api/* (Vite proxy)"| API["Express API (Node.js)"]');
  lines.push('  API --> DB["SQLite (intelliscan.db)"]');
  lines.push('  API --> GEM["Gemini API"]');
  lines.push('  API --> OAI["OpenAI API"]');
  lines.push('  API --> TES["Tesseract Worker (offline OCR)"]');
  lines.push('  API --> SMTP["SMTP (Nodemailer)"]');
  lines.push('  API --> RZP["Razorpay Orders + Signature Verify"]');
  lines.push('  API <-->|Realtime| SIO["Socket.IO"]');
  lines.push('  FE <-->|WebSocket| SIO');
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 3) Frontend System Design');
  lines.push('');
  lines.push('### 3.1 Frontend Entry + Providers');
  lines.push('');
  lines.push(`- Entry: \`${rel(path.join(ROOT, 'intelliscan-app', 'src', 'main.jsx'))}\``);
  lines.push(`- Routing: \`${rel(appPath)}\``);
  lines.push('- Providers: RoleProvider (auth bootstrap), ContactProvider (contacts), BatchQueueProvider (batch upload scanning).');
  lines.push('');
  lines.push('### 3.2 Auth Persistence (Stay Signed In)');
  lines.push('');
  lines.push('The frontend persists the session using localStorage and cookies. On app load it validates the stored token via `GET /api/auth/me` and only clears auth on explicit invalid responses (401/403). This prevents being logged out when changing routes or reopening the browser.');
  lines.push('');
  lines.push(`- Storage helpers: \`${rel(path.join(ROOT, 'intelliscan-app', 'src', 'utils', 'auth.js'))}\``);
  lines.push(`- Bootstrap logic: \`${rel(path.join(ROOT, 'intelliscan-app', 'src', 'context', 'RoleContext.jsx'))}\``);
  lines.push('');
  lines.push('### 3.3 Routing Areas');
  lines.push('');
  lines.push('- Public: landing, sign-in, sign-up, docs, public profile/booking.');
  lines.push('- Dashboard: `/dashboard/*` (personal users).');
  lines.push('- Workspace: `/workspace/*` (business/enterprise admin).');
  lines.push('- Super Admin: `/admin/*` (platform admin).');
  lines.push('- Generated prototype routes: loaded from `src/pages/generated/routes.json`.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 4) Backend System Design');
  lines.push('');
  lines.push('### 4.1 Backend Entry + Modules');
  lines.push('');
  lines.push(`- Server entry: \`${rel(serverIndexPath)}\``);
  lines.push(`- DB helper: \`${rel(path.join(ROOT, 'intelliscan-server', 'src', 'utils', 'db.js'))}\``);
  lines.push(`- Auth middleware: \`${rel(path.join(ROOT, 'intelliscan-server', 'src', 'middleware', 'auth.js'))}\``);
  lines.push(`- Audit log writer: \`${rel(path.join(ROOT, 'intelliscan-server', 'src', 'utils', 'logger.js'))}\``);
  lines.push(`- SMTP helper: \`${rel(path.join(ROOT, 'intelliscan-server', 'src', 'utils', 'smtp.js'))}\``);
  lines.push(`- OCR worker: \`${rel(path.join(ROOT, 'intelliscan-server', 'src', 'workers', 'tesseract_ocr_worker.js'))}\``);
  lines.push('');
  lines.push('### 4.2 Tier Limits (Quota Enforcement)');
  lines.push('');
  lines.push(mdTable([
    ['Tier', 'Single Scans / Cycle', 'Group Scans / Cycle'],
    ['personal', String(tierLimits.personal.single), String(tierLimits.personal.group)],
    ['pro', String(tierLimits.pro.single), String(tierLimits.pro.group)],
    ['enterprise', String(tierLimits.enterprise.single), String(tierLimits.enterprise.group)]
  ]));
  lines.push('');
  lines.push('### 4.3 Feature Flags (Server-Side)');
  lines.push('');
  lines.push('Backend builds an access profile and uses `requireFeature(feature_key)` middleware to allow or deny access. Current feature keys in code:');
  lines.push('');
  featureFlags.forEach((k) => lines.push(`- \`${k}\``));
  lines.push('');

  lines.push('### 4.4 Feature Catalog (Human-Friendly)');
  lines.push('');
  const featureRows = [['Feature Key', 'Meaning']];
  featureFlags.forEach((k) => {
    featureRows.push([`\`${k}\``, FEATURE_DESCRIPTIONS[k] || '(see feature key in backend access profile)']);
  });
  lines.push(mdTable(featureRows));
  lines.push('');

  lines.push('### 4.5 Data Model (Core Tables)');
  lines.push('');
  lines.push('SQLite tables detected in `intelliscan-server/db_schema.txt`. These tables back the pages and workflows described later.');
  lines.push('');
  if (dbTables.length) {
    lines.push('```text');
    dbTables.forEach((t) => lines.push(t));
    lines.push('```');
    lines.push('');
    lines.push('High-impact relationships (conceptual):');
    lines.push('');
    lines.push('```mermaid');
    lines.push('erDiagram');
    lines.push('  users ||--o{ contacts : "user_id"');
    lines.push('  users ||--|| user_quotas : "user_id"');
    lines.push('  contacts ||--o{ ai_drafts : "contact_id"');
    lines.push('  events ||--o{ contacts : "event_id"');
    lines.push('```');
    lines.push('');
    lines.push('Schema details are documented in `DATA_DICTIONARY_INTELLISCAN_DB.md`.');
  } else {
    lines.push('(DB schema file not found. Use `DATA_DICTIONARY_INTELLISCAN_DB.md` as the authoritative schema.)');
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 5) End-to-End Flows');
  lines.push('');
  lines.push('### 5.1 Scan -> Save -> Contacts (Core Interdependency)');
  lines.push('');
  lines.push('1. Scan pages call `/api/scan` (single) or `/api/scan-multi` (group).');
  lines.push('2. The backend runs the unified extraction pipeline (Gemini, then OpenAI, then optional offline OCR).');
  lines.push('3. The frontend saves results via `POST /api/contacts` using `ContactContext.addContact()`.');
  lines.push('4. Contacts are immediately visible in Contacts page and all downstream workspace tools.');
  lines.push('');
  lines.push('### 5.2 Batch Upload Queue');
  lines.push('');
  lines.push('Batch uploads are handled by a global queue context that runs scans in the background and auto-saves contacts as each scan completes.');
  lines.push('');
  lines.push('### 5.3 Billing Upgrade (Razorpay)');
  lines.push('');
  lines.push('1. Frontend creates an order via `POST /api/billing/create-order`.');
  lines.push('2. Razorpay checkout completes on the client.');
  lines.push('3. Frontend verifies via `POST /api/billing/verify-payment`.');
  lines.push('4. Backend upgrades `users.tier` and refreshes quotas.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 6) Page Catalog (Core Pages + APIs Used)');
  lines.push('');
  const coreRoutes = explicitRoutes
    .filter((r) => r.routePath.startsWith('/dashboard/') || r.routePath.startsWith('/workspace/') || r.routePath.startsWith('/admin/'))
    .filter((r) => r.filePath && !String(r.filePath).includes(`${path.sep}pages${path.sep}generated${path.sep}`));

  const tableRows = [['Route', 'Component', 'Roles', 'APIs (detected in page file)']];
  coreRoutes.forEach((r) => {
    const entry = pageApiMap.get(r.routePath);
    const apis = entry?.apis?.length ? entry.apis.join(', ') : '';
    tableRows.push([
      r.routePath,
      r.component,
      r.roles.length ? r.roles.join(', ') : 'auth_required',
      apis
    ]);
  });
  lines.push(mdTable(tableRows));
  lines.push('');
  lines.push('Generated prototype routes:');
  lines.push('');
  generatedRoutes.forEach((r) => {
    const p = r?.path ? String(r.path) : '';
    if (!p) return;
    lines.push(`- \`/${p}\` (${r.name})`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 7) Page Interdependencies (What Feeds What)');
  lines.push('');
  lines.push('Contacts are the central object. Scanning produces contacts; most other pages consume contacts for workflows like drafts, campaigns, routing, pipeline, CRM export, and org charts.');
  lines.push('');
  lines.push('```mermaid');
  lines.push('flowchart LR');
  lines.push('  Scan["Scan Page"] --> Contacts["Contacts Page"]');
  lines.push('  Batch["Batch Upload Queue"] --> Contacts');
  lines.push('  Events["Events Page"] --> Scan');
  lines.push('  Events --> Contacts');
  lines.push('  Contacts --> Drafts["Drafts"]');
  lines.push('  Contacts --> Coach["AI Coach"]');
  lines.push('  Contacts --> Campaigns["Workspace Campaigns"]');
  lines.push('  Contacts --> Pipeline["Pipeline"]');
  lines.push('  Contacts --> CRM["CRM Mapping/Export"]');
  lines.push('  Contacts --> DQ["Data Quality Center"]');
  lines.push('  Billing["Billing"] --> Scan');
  lines.push('```');
  lines.push('');

  lines.push('### 7.1 Interdependency Matrix (Key Pages)');
  lines.push('');
  lines.push(mdTable([
    ['Page', 'Produces', 'Consumes', 'Why It Depends'],
    ['/dashboard/scan (Scan)', 'Contacts', 'Events, Quota/Tier', 'Scan uses events for tagging; saved contacts power Contacts and all downstream tools.'],
    ['/dashboard/contacts (Contacts)', 'Drafts, Exports', 'Contacts', 'Contacts page is the main consumer of scanned contacts and triggers drafts/campaign exports.'],
    ['/dashboard/events (Events)', 'Events', 'Contacts', 'Events tag scans; viewing contacts by event filters the Contacts page.'],
    ['/dashboard/drafts (Drafts)', 'Draft status/sends', 'Contacts', 'Drafts are linked to contacts and used by AI Coach recommendations.'],
    ['/dashboard/coach (AI Coach)', 'Coaching insights', 'Contacts, Draft activity', 'Coach analyzes engagement and suggests actions based on contacts/drafts.'],
    ['/workspace/crm-mapping (CRM Mapping)', 'Mappings, Exports', 'Contacts', 'CRM export and schema mapping depend on the contacts dataset.'],
    ['/workspace/routing-rules (Lead Routing)', 'Routing rules', 'Contacts', 'Rules are executed against contacts to route/tag leads.'],
    ['/workspace/pipeline (Pipeline)', 'Deal updates', 'Contacts', 'Deal stages attach to contacts; pipeline is meaningless without contacts.'],
    ['/workspace/data-quality (Data Quality)', 'Merges/dismissals', 'Contacts', 'Dedupe queue is built from existing contacts.'],
    ['/workspace/data-policies (Policies)', 'Policy config', 'Workspace scope', 'Policies affect how data is retained/masked and how audit trails are stored.'],
    ['/workspace/campaigns (Workspace Campaigns)', 'Campaign sends', 'Contacts', 'Campaign audience is computed from contacts and their AI-inferred fields.'],
    ['/workspace/billing (Billing)', 'Orders, invoices', 'Tier/quota', 'Billing changes tier which changes quotas and feature access across the app.']
  ]));
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 8) Backend API Catalog (All `/api/*` Routes in Server)');
  lines.push('');
  lines.push('This list is parsed from the backend server entry (`intelliscan-server/index.js`).');
  lines.push('');
  lines.push('```text');
  backendRoutes.forEach((r) => lines.push(`${r.method} ${r.path}`));
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 9) Folder and File Architecture');
  lines.push('');
  lines.push('This section provides an ASCII tree of the important source folders and a repo-wide file inventory (excluding `node_modules/`, `dist/`, `.git/`, `.sixth/`).');
  lines.push('');
  const feSrc = path.join(ROOT, 'intelliscan-app', 'src');
  const beSrc = path.join(ROOT, 'intelliscan-server', 'src');
  const toolsDir = path.join(ROOT, 'tools');
  lines.push('### 9.1 Frontend Source Tree');
  lines.push('');
  lines.push('```text');
  treeLines(feSrc, 'intelliscan-app/src').forEach((l) => lines.push(l));
  lines.push('```');
  lines.push('');
  lines.push('### 9.2 Backend Source Tree');
  lines.push('');
  lines.push('```text');
  treeLines(beSrc, 'intelliscan-server/src').forEach((l) => lines.push(l));
  lines.push('```');
  lines.push('');
  lines.push('### 9.3 Tools');
  lines.push('');
  lines.push('```text');
  treeLines(toolsDir, 'tools').forEach((l) => lines.push(l));
  lines.push('```');
  lines.push('');
  lines.push('### 9.4 Repo File Inventory');
  lines.push('');
  lines.push('```text');
  const allFiles = walkFiles(ROOT).map(rel).sort();
  allFiles.forEach((p) => lines.push(p));
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 10) References (Authoritative)');
  lines.push('');
  lines.push(`- DB dictionary: \`DATA_DICTIONARY_INTELLISCAN_DB.md\``);
  lines.push(`- Master documentation: \`INTELLISCAN_MASTER_DOCUMENTATION.md\``);
  lines.push(`- MCA guideline-aligned report: \`MCA_SEM4_MAJOR_PROJECT_REPORT_INTELLISCAN.md\``);
  lines.push('');

  fs.writeFileSync(OUT_PATH, lines.join('\n'), 'utf8');
  console.log('[system-arch] Wrote:', OUT_PATH);
}

main();
