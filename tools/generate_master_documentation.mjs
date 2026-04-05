import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const EXCLUDE_DIRS = new Set(['node_modules', 'dist', '.git']);

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function dirExists(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function resolveImport(baseDir, spec) {
  const direct = path.resolve(baseDir, spec);
  if (fileExists(direct)) return direct;
  const candidates = [direct + '.jsx', direct + '.js', direct + '.json', direct + '.css'];
  for (const c of candidates) {
    if (fileExists(c)) return c;
  }
  return null;
}

function extractAdminKeywords(appJsx) {
  const m = appJsx.match(/const adminKeywords\s*=\s*\[([\s\S]*?)\];/m);
  if (!m) {
    return [
      'super-admin',
      'workspaces-organizations',
      'ai-model-versioning',
      'audit-logs',
      'privacy-gdpr',
      'advanced-api',
      'api-integrations',
      'system-health',
      'advanced-security',
      'integration-health',
      'training-tuning'
    ];
  }
  const body = m[1];
  return Array.from(body.matchAll(/'([^']+)'/g)).map((x) => x[1]);
}

function parseImportMap(appJsx, appFilePath) {
  const baseDir = path.dirname(appFilePath);
  const map = new Map();
  for (const m of appJsx.matchAll(/^import\s+([A-Za-z0-9_]+)\s+from\s+'([^']+)';/gm)) {
    const name = m[1];
    const spec = m[2];
    const resolved = resolveImport(baseDir, spec);
    if (resolved) map.set(name, resolved);
  }
  return map;
}

function parseAllowedRoles(line) {
  const m = line.match(/allowedRoles=\{\[([^\]]+)\]\}/);
  if (!m) return null;
  const inner = m[1];
  const roles = Array.from(inner.matchAll(/'([^']+)'/g)).map((x) => x[1]);
  return roles.length ? roles : null;
}

function extractPageComponentNameFromRouteLine(line) {
  // Extract JSX tag names and choose the last non-wrapper tag.
  const wrappers = new Set([
    'Route',
    'RoleGuard',
    'DashboardLayout',
    'AdminLayout',
    'RequireAuth',
    'Navigate'
  ]);
  const tokens = Array.from(line.matchAll(/<([A-Za-z0-9_]+)\b/g)).map((x) => x[1]);
  const filtered = tokens.filter((t) => !wrappers.has(t));
  if (!filtered.length) return null;
  return filtered[filtered.length - 1];
}

function normalizeApiPath(p) {
  return p.replace(/\$\{[^}]+\}/g, ':param').replace(/\/+$/, '');
}

function extractApiEndpointsFromSource(src) {
  const matches = src.match(/\/api\/[^\s"'`<>]+/g) || [];
  const cleaned = matches
    .map((m) => m.replace(/[),;}\]]+$/, ''))
    .map(normalizeApiPath)
    .filter((m) => m.startsWith('/api/'));
  return Array.from(new Set(cleaned)).sort();
}

function classifyRoute(routePath, source) {
  if (source === 'generated') return 'Generated';
  if (routePath.startsWith('/admin/')) return 'Super Admin';
  if (routePath.startsWith('/workspace/')) return 'Workspace';
  if (routePath.startsWith('/dashboard/')) return 'Dashboard';
  return 'Public';
}

function classifyLayout(routePath, source, gate) {
  if (source === 'generated') {
    return gate === 'super_admin' ? 'AdminLayout' : 'DashboardLayout';
  }
  if (routePath.startsWith('/admin/')) return 'AdminLayout';
  if (routePath.startsWith('/workspace/')) return 'AdminLayout';
  if (routePath.startsWith('/dashboard/')) return 'DashboardLayout';
  return 'Public/None';
}

function gateLabelFromRoles(roles, line) {
  if (roles && roles.length) return roles.join(', ');
  if (line && line.includes('<RequireAuth')) return 'auth_required';
  return 'public';
}

function prettyTitleFromComponent(componentName, routePath) {
  if (!componentName) return routePath;
  const base = componentName.replace(/^Gen/, '');
  return base.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim();
}

function parseExplicitRoutes(appJsx, appFilePath, importMap) {
  const routes = [];
  const lines = appJsx.split(/\r?\n/);
  for (const line of lines) {
    if (!line.includes('<Route path="')) continue;
    const m = line.match(/<Route\s+path="([^"]+)"/);
    if (!m) continue;
    const routePath = m[1];
    const roles = parseAllowedRoles(line);
    const gate = gateLabelFromRoles(roles, line);
    const component = extractPageComponentNameFromRouteLine(line) || 'Unknown';
    const filePath = importMap.get(component) || appFilePath;
    routes.push({
      routePath,
      source: 'explicit',
      section: classifyRoute(routePath, 'explicit'),
      layout: classifyLayout(routePath, 'explicit', gate),
      gate,
      roles: roles || [],
      component,
      filePath
    });
  }
  return routes;
}

function parseGeneratedRoutes(appJsx, routesJsonPath, appGeneratedPagesDir) {
  const adminKeywords = extractAdminKeywords(appJsx);
  const raw = JSON.parse(readText(routesJsonPath));
  return raw
    .filter((r) => r && r.path && r.path !== 'subscription-plan-comparison')
    .map((r) => {
      const routePath = r.path.startsWith('/') ? r.path : `/${r.path}`;
      const isSuperAdminPage = adminKeywords.some((kw) => r.path.includes(kw));
      const gate = isSuperAdminPage ? 'super_admin' : 'auth_required';
      const filePath = path.join(appGeneratedPagesDir, `${r.name}.jsx`);
      return {
        routePath,
        source: 'generated',
        section: classifyRoute(routePath, 'generated'),
        layout: classifyLayout(routePath, 'generated', gate),
        gate,
        roles: gate === 'super_admin' ? ['super_admin'] : [],
        component: r.name,
        filePath
      };
    });
}

function parseBackendRoutes(routesTxtPath) {
  if (!fileExists(routesTxtPath)) return [];
  const lines = readText(routesTxtPath).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    // app.get('/api/health', ...
    const m = line.match(/^app\.(get|post|put|delete)\('([^']+)'/i);
    if (!m) continue;
    out.push({ method: m[1].toUpperCase(), path: m[2] });
  }
  return out;
}

function groupBackendRoutes(routes) {
  const groups = new Map();
  const keyFor = (p) => {
    const parts = p.split('/').filter(Boolean);
    if (parts.length < 2) return p;
    if (parts[0] !== 'api') return `/${parts[0]}`;
    return `/api/${parts[1]}`;
  };
  for (const r of routes) {
    const key = keyFor(r.path);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  for (const [k, v] of groups) {
    v.sort((a, b) => (a.path + a.method).localeCompare(b.path + b.method));
    groups.set(k, v);
  }
  return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function walkFiles(dir, acc, relBase = dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    if (it.name.startsWith('.')) {
      // keep .env.example etc at root but skip hidden dirs like .git
      if (it.isDirectory() && EXCLUDE_DIRS.has(it.name)) continue;
    }
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      if (EXCLUDE_DIRS.has(it.name)) continue;
      walkFiles(full, acc, relBase);
    } else if (it.isFile()) {
      acc.push(path.relative(ROOT, full).replace(/\\/g, '/'));
    }
  }
}

function classifyFile(relPath) {
  if (relPath.endsWith('.md')) return { kind: 'Documentation', detail: 'Markdown documentation' };
  if (relPath.endsWith('.webm')) return { kind: 'Capture', detail: 'Recorded demo video' };
  if (relPath.endsWith('.png') || relPath.endsWith('.jpg') || relPath.endsWith('.jpeg')) return { kind: 'Capture', detail: 'Screenshot/image asset' };
  if (relPath.endsWith('.sqlite') || relPath.endsWith('.db')) return { kind: 'Database', detail: 'SQLite database file' };
  if (relPath.endsWith('.env') || relPath.endsWith('.env.example')) return { kind: 'Config', detail: 'Environment configuration' };
  if (relPath.includes('intelliscan-app/src/pages/generated/')) return { kind: 'Frontend Page (Generated)', detail: 'Auto-migrated UI route' };
  if (relPath.includes('intelliscan-app/src/pages/')) return { kind: 'Frontend Page', detail: 'React route page' };
  if (relPath.includes('intelliscan-app/src/components/')) return { kind: 'Frontend Component', detail: 'Reusable UI component' };
  if (relPath.includes('intelliscan-app/src/context/')) return { kind: 'Frontend Context', detail: 'React context provider/state' };
  if (relPath.includes('intelliscan-app/src/layouts/')) return { kind: 'Frontend Layout', detail: 'Layout wrapper' };
  if (relPath.includes('intelliscan-app/src/utils/')) return { kind: 'Frontend Utility', detail: 'Client-side helper' };
  if (relPath.includes('intelliscan-app/src/hooks/')) return { kind: 'Frontend Hook', detail: 'Custom React hook' };
  if (relPath.includes('intelliscan-app/src/')) return { kind: 'Frontend', detail: 'Client source file' };
  if (relPath.includes('intelliscan-server/src/')) return { kind: 'Backend Module', detail: 'Server module' };
  if (relPath.includes('intelliscan-server/tests/')) return { kind: 'Backend Test', detail: 'Jest + supertest test' };
  if (relPath.startsWith('intelliscan-server/')) return { kind: 'Backend', detail: 'Server file/script' };
  if (relPath.startsWith('ALL_DOCUMENT_OF_PROJECT/')) return { kind: 'Documentation (Internal)', detail: 'Internal planning/docs bundle' };
  if (relPath.startsWith('captures/')) return { kind: 'Capture', detail: 'Demo artifact (screenshots/videos)' };
  return { kind: 'Other', detail: 'Repo file' };
}

function mdEscape(text) {
  return String(text || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function buildPageCatalogMarkdown(routes, apiByFile) {
  const header = [
    '| Route | Section | Layout | Gate | Component | File | APIs Used |',
    '|---|---|---|---|---|---|---|'
  ];

  const rows = routes
    .slice()
    .sort((a, b) => a.routePath.localeCompare(b.routePath))
    .map((r) => {
      const relFile = r.filePath ? path.relative(ROOT, r.filePath).replace(/\\/g, '/') : '';
      const apis = (r.filePath && apiByFile.get(r.filePath)) ? apiByFile.get(r.filePath) : [];
      const apiCell = apis.length ? mdEscape(apis.join(', ')) : '';
      return `| ${mdEscape(r.routePath)} | ${mdEscape(r.section)} | ${mdEscape(r.layout)} | ${mdEscape(r.gate)} | ${mdEscape(r.component)} | ${mdEscape(relFile)} | ${apiCell} |`;
    });

  return header.concat(rows).join('\n');
}

function buildFileIndexMarkdown(files, titlesByMdFile, pageRouteByFile) {
  const header = [
    '| File | Kind | Description |',
    '|---|---|---|'
  ];

  const rows = files
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .map((rel) => {
      const cls = classifyFile(rel);
      let desc = cls.detail;
      if (rel.endsWith('.md') && titlesByMdFile.has(rel)) desc = titlesByMdFile.get(rel);
      if (pageRouteByFile.has(rel)) {
        const meta = pageRouteByFile.get(rel);
        desc = meta.title ? `Page: ${meta.title} (route: ${meta.route})` : `Page (route: ${meta.route})`;
      }
      if (SPECIAL_FILE_DESCRIPTIONS.has(rel)) desc = SPECIAL_FILE_DESCRIPTIONS.get(rel);
      return `| ${mdEscape(rel)} | ${mdEscape(cls.kind)} | ${mdEscape(desc)} |`;
    });

  return header.concat(rows).join('\n');
}

function extractMdTitle(relPath) {
  try {
    const abs = path.join(ROOT, relPath);
    const content = readText(abs);
    const firstHeading = content.split(/\r?\n/).find((l) => l.startsWith('#'));
    return firstHeading ? firstHeading.replace(/^#+\s*/, '').trim() : null;
  } catch {
    return null;
  }
}

const SPECIAL_FILE_DESCRIPTIONS = new Map([
  [
    'intelliscan-server/index.js',
    'Backend entry (Express). Contains DB init, auth, AI extraction pipelines, contacts/events/email/calendar/workspace/admin APIs, and Razorpay billing.'
  ],
  [
    'intelliscan-server/src/middleware/auth.js',
    'JWT authentication middleware + role gating helpers (user/business_admin/super_admin).'
  ],
  [
    'intelliscan-server/src/utils/db.js',
    'SQLite connection to `intelliscan-server/intelliscan.db` plus promisified helpers: dbGetAsync/dbAllAsync/dbRunAsync/dbExecAsync.'
  ],
  [
    'intelliscan-server/src/utils/smtp.js',
    'Nodemailer SMTP transport helper (real SMTP if configured, otherwise safe simulated mode for demos).'
  ],
  [
    'intelliscan-server/src/utils/logger.js',
    'Audit/event logging utilities writing into audit tables (security/compliance).'
  ],
  [
    'intelliscan-server/src/routes/workspaceRoutes.js',
    'Workspace-focused API routes (enterprise modules like policies, data quality, billing surfaces).'
  ],
  [
    'intelliscan-server/src/workers/tesseract_ocr_worker.js',
    'Isolated Tesseract OCR worker process (offline fallback OCR without crashing the main server).'
  ],
  [
    'intelliscan-app/src/main.jsx',
    'Frontend entry: boots React, wraps providers (Role/Contacts/BatchQueue), mounts the app.'
  ],
  [
    'intelliscan-app/src/App.jsx',
    'Frontend router: defines explicit routes, mounts generated routes, applies RoleGuard/RequireAuth, and hosts RootRoute redirect logic.'
  ],
  [
    'intelliscan-app/src/context/RoleContext.jsx',
    'Auth + access context: stores user and token, loads current access profile, exposes login/logout, and drives role-based UI gating.'
  ],
  [
    'intelliscan-app/src/utils/auth.js',
    'Token + user storage helpers (get/set/clear token, safe user parsing, home-route resolver).'
  ],
  [
    'intelliscan-app/src/pages/ScanPage.jsx',
    'Scan UI: single-card + group-photo flows, extraction preview, quota display, and save actions.'
  ],
  [
    'intelliscan-app/src/pages/ContactsPage.jsx',
    'Contacts CRM UI: search/filter, export, enrichment triggers, and stats panels.'
  ],
  [
    'intelliscan-app/src/pages/BillingPage.jsx',
    'Billing UI: usage overview, payment methods, invoices, and plan upgrade entry points.'
  ],
  [
    'intelliscan-app/src/pages/workspace/DataPoliciesPage.jsx',
    'Enterprise policies UI: retention days + redaction + strict audit storage toggles, persisted via workspace policies API.'
  ],
  [
    'intelliscan-app/src/pages/workspace/DataQualityCenterPage.jsx',
    'Data quality UI: dedupe queue, merge/dismiss actions, and quality workflows for bulk ingested contacts.'
  ]
]);

function buildDependencyMatrixMarkdown() {
  // Curated, accurate, and stable dependency map for the “major features”.
  const rows = [
    ['Authentication & Access', 'All protected pages', 'users, sessions, user_quotas, onboarding_prefs', '/api/auth/*, /api/access/*, /api/sessions/*'],
    ['Scan (Single)', 'Auth + quotas', 'contacts, user_quotas, events (optional tag)', 'POST /api/scan, GET /api/user/quota'],
    ['Scan (Group Photo)', 'Enterprise tier + group quota', 'contacts, user_quotas, event_contact_links (optional)', 'POST /api/scan-multi'],
    ['Contacts CRM', 'Stored contacts', 'contacts, contact_relationships, deals', 'GET/POST/PUT/DELETE /api/contacts*, /api/org-chart/*'],
    ['Events & Campaigns', 'Contacts tagging', 'events, event_contact_links', 'GET/POST/DELETE /api/events'],
    ['AI Drafts', 'Contacts', 'ai_drafts, contacts', 'GET/POST /api/drafts*, POST /api/drafts/generate, POST /api/drafts/:id/send'],
    ['Email Marketing', 'Contacts with emails', 'email_templates, email_lists, email_campaigns, email_sends, email_clicks', 'GET/POST /api/campaigns, /api/email/* tracking'],
    ['Calendar & Booking', 'Enterprise role/tier', 'calendars, calendar_events, booking_links, availability_slots, event_attendees', 'GET/POST /api/calendar/*, /api/book/:slug'],
    ['Data Quality (Dedupe/Merge)', 'Workspace contacts', 'data_quality_dedupe_queue, contacts', 'GET /api/workspace/data-quality/dedupe-queue, POST merge/dismiss'],
    ['Policies (Compliance)', 'Workspace admin actions', 'workspace_policies, audit_trail', 'GET/PUT /api/workspace/data-policies'],
    ['Integrations (Webhooks/CRM)', 'Workspace config', 'webhooks, crm_mappings, crm_sync_log, integration_sync_jobs', 'GET/POST /api/webhooks, /api/crm*, /api/admin/integrations/*'],
    ['Billing (Razorpay)', 'Authenticated user', 'billing_orders, users, user_quotas', 'POST /api/billing/razorpay/order, POST /api/billing/razorpay/verify'],
    ['Admin (Super Admin)', 'super_admin role', 'ai_models, platform_incidents, integration_sync_jobs, audit_trail', '/api/admin/*, /api/engine/*, /api/sandbox/*']
  ];

  const header = [
    '| Module | Depends On | Key Tables | Key APIs |',
    '|---|---|---|---|'
  ];
  const mdRows = rows.map((r) => `| ${mdEscape(r[0])} | ${mdEscape(r[1])} | ${mdEscape(r[2])} | ${mdEscape(r[3])} |`);
  return header.concat(mdRows).join('\n');
}

function main() {
  const appFilePath = path.join(ROOT, 'intelliscan-app', 'src', 'App.jsx');
  const routesJsonPath = path.join(ROOT, 'intelliscan-app', 'src', 'pages', 'generated', 'routes.json');
  const appGeneratedPagesDir = path.join(ROOT, 'intelliscan-app', 'src', 'pages', 'generated');
  const routesTxtPath = path.join(ROOT, 'routes.txt');

  const appJsx = readText(appFilePath);
  const importMap = parseImportMap(appJsx, appFilePath);

  const explicitRoutes = parseExplicitRoutes(appJsx, appFilePath, importMap);
  const generatedRoutes = parseGeneratedRoutes(appJsx, routesJsonPath, appGeneratedPagesDir);
  const allRoutes = explicitRoutes.concat(generatedRoutes);

  // Build API usage map for the pages we can read.
  const apiByFile = new Map();
  for (const r of allRoutes) {
    if (!r.filePath) continue;
    if (apiByFile.has(r.filePath)) continue;
    if (!fileExists(r.filePath)) {
      apiByFile.set(r.filePath, []);
      continue;
    }
    const src = readText(r.filePath);
    apiByFile.set(r.filePath, extractApiEndpointsFromSource(src));
  }

  // Page route lookup by file (for file index descriptions).
  const pageRouteByFile = new Map();
  for (const r of allRoutes) {
    if (!r.filePath) continue;
    const rel = path.relative(ROOT, r.filePath).replace(/\\/g, '/');
    if (!rel.startsWith('intelliscan-app/')) continue;
    pageRouteByFile.set(rel, { route: r.routePath, title: prettyTitleFromComponent(r.component, r.routePath) });
  }

  // Backend routes inventory (best-effort; parsed from routes.txt)
  const backendRoutes = parseBackendRoutes(routesTxtPath);
  const backendGroups = groupBackendRoutes(backendRoutes);
  const backendRoutesMd = backendGroups
    .map(([group, routes]) => {
      const lines = routes.map((r) => `- \`${r.method}\` \`${r.path}\``).join('\n');
      return `### ${group}\n\n${lines}\n`;
    })
    .join('\n');

  // File inventory (repo-wide, excluding node_modules/dist/.git)
  const files = [];
  walkFiles(ROOT, files);

  const titlesByMdFile = new Map();
  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const title = extractMdTitle(f);
    if (title) titlesByMdFile.set(f, title);
  }

  const now = new Date().toISOString();

  const doc = [
    '# IntelliScan Master Documentation (Deep Workflow, Pages, Files)',
    '',
    `Generated: \`${now}\``,
    '',
    'This document explains the IntelliScan project end-to-end:',
    '',
    '1. Full platform workflow (how the system works as one product).',
    '2. Module workflows (feature-by-feature).',
    '3. Page catalog (every route and the APIs it depends on).',
    '4. File index (frontend + backend + docs + assets).',
    '',
    'If you are preparing for an academic presentation, also use:',
    '',
    '- `APRIL_04_2026_PRESENTATION_PACK.md`',
    '- `intelliscan-server/College_Document/Presentation-1_intelliscan.md`',
    '- `intelliscan-server/College_Document/Presentation-2_intelliscan.md`',
    '',
    '---',
    '',
    '## 0) Where To Start (Fast)',
    '',
    'If you need the single best entry points for understanding the whole project:',
    '',
    '1. `PROJECT_STATUS.md` (what is actually working end-to-end).',
    '2. `APRIL_04_2026_PRESENTATION_PACK.md` (presentation links + demo script).',
    '3. `INTELLISCAN_MASTER_DOCUMENTATION.md` (this file: pages + files + dependencies).',
    '4. `DATA_DICTIONARY_INTELLISCAN_DB.md` (authoritative DB schema).',
    '',
    '---',
    '',
    '## 1) Repository Overview',
    '',
    'Top-level structure:',
    '',
    '- `intelliscan-app/`: React + Vite frontend (SPA).',
    '- `intelliscan-server/`: Express + SQLite backend (REST + Socket.IO).',
    '- `DATA_DICTIONARY_INTELLISCAN_DB.md`: authoritative SQLite schema dump (generated).',
    '- `ALL_DOCUMENT_OF_PROJECT/`: internal docs bundle (architecture, RBAC, diagrams, roadmap).',
    '',
    '---',
    '',
    '## 2) How To Run (Local Dev)',
    '',
    'Backend:',
    '',
    '```powershell',
    'cd intelliscan-server',
    'npm install',
    'npm run dev',
    '```',
    '',
    'Frontend:',
    '',
    '```powershell',
    'cd intelliscan-app',
    'npm install',
    'npm run dev',
    '```',
    '',
    'Key ports:',
    '',
    '- Frontend (Vite): `http://localhost:5173`',
    '- Backend (Express): `http://127.0.0.1:5000`',
    '',
    'Environment templates:',
    '',
    '- Server: `intelliscan-server/.env.example`',
    '- App: `intelliscan-app/.env.example`',
    '',
    '---',
    '',
    '## 3) Roles, Tiers, and Access Model',
    '',
    'Roles:',
    '',
    '- `user`: standard authenticated user.',
    '- `business_admin`: enterprise/workspace admin.',
    '- `super_admin`: platform operator/admin routes.',
    '',
    'Tiers:',
    '',
    '- `personal` (free)',
    '- `pro` (paid personal)',
    '- `enterprise` (workspace features)',
    '',
    'Access is enforced in two places:',
    '',
    '1. Frontend: Route guards (RoleGuard or RequireAuth).',
    '2. Backend: JWT auth middleware + role checks.',
    '',
    'See also: `ALL_DOCUMENT_OF_PROJECT/IntelliScan_RBAC_Matrix.md`',
    '',
    '---',
    '',
    '## 4) Global System Workflow (How Everything Connects)',
    '',
    'High-level lifecycle:',
    '',
    '1. Public visitor reaches landing/pricing/docs.',
    '2. User authenticates and receives JWT.',
    '3. User scans cards (single or group) to create contacts.',
    '4. Contacts become the shared dependency for events, drafts, coach, email marketing, and exports.',
    '5. Enterprise admins manage workspace modules: policies, data quality, integrations, billing, team management.',
    '6. Super admins manage platform modules: system health, model status, incidents, job queues.',
    '',
    'Global diagrams:',
    '',
    '- `IntelliScan_Global_ActivityDiagram.md`',
    '- `IntelliScan_Global_InteractionDiagram.md`',
    '',
    '---',
    '',
    '## 4.1 Core Interdependency Graph (Data + Modules)',
    '',
    'This graph shows the most important dependencies (contacts is the central object):',
    '',
    '```mermaid',
    'flowchart TD',
    '    AUTH[Auth + Access Profile] --> QUOTA[User Quotas]',
    '    AUTH --> SCAN[Scan Single]',
    '    AUTH --> GSCAN[Scan Group Photo]',
    '    SCAN --> CONTACTS[Contacts CRM]',
    '    GSCAN --> CONTACTS',
    '    CONTACTS --> EVENTS[Events Tagging]',
    '    CONTACTS --> DRAFTS[AI Drafts]',
    '    CONTACTS --> COACH[AI Coach]',
    '    CONTACTS --> EMAIL[Email Marketing]',
    '    CONTACTS --> EXPORT[CSV/vCard Export]',
    '    WORKSPACE[Workspace (Enterprise)] --> CONTACTS',
    '    WORKSPACE --> POLICIES[Policies]',
    '    WORKSPACE --> DQ[Data Quality]',
    '    WORKSPACE --> INTEG[Integrations]',
    '    BILL[Billing (Razorpay)] --> AUTH',
    '    ADMIN[Super Admin] --> INTEG',
    '    ADMIN --> MODELS[AI Models + Engine Config]',
    '```',
    '',
    '---',
    '',
    '## 5) Interdependency Matrix (Modules -> Tables -> APIs)',
    '',
    buildDependencyMatrixMarkdown(),
    '',
    '---',
    '',
    '## 6) Feature Workflows (Detailed)',
    '',
    'For each workflow below you can cross-check the full UML packs:',
    '',
    '- Use cases: `IntelliScan_UseCaseDiagrams.md`',
    '- Activities: `IntelliScan_ActivityDiagrams.md`',
    '- Interactions: `IntelliScan_InteractionDiagrams.md`',
    '- Classes: `IntelliScan_ClassDiagrams.md`',
    '',
    '### 6.1 Authentication and Session Workflow',
    '',
    '1. `POST /api/auth/register` creates a user record.',
    '2. `POST /api/auth/login` returns a JWT and stores a session row.',
    '3. Frontend stores token and uses it on all subsequent `/api/*` calls.',
    '4. `GET /api/access/me` is used to compute the active access profile.',
    '',
    'Key data:',
    '',
    '- `users`, `sessions`, `user_quotas`, `onboarding_prefs`',
    '',
    '### 6.2 Scan (Single Card) Workflow',
    '',
    '1. User uploads an image on Scan page.',
    '2. Frontend calls `POST /api/scan`.',
    '3. Backend validates auth and quota.',
    '4. Backend runs the AI extraction pipeline (Gemini -> OpenAI -> offline OCR fallback).',
    '5. User saves the extracted contact (persisted to `contacts`).',
    '',
    'Key data:',
    '',
    '- `contacts`, `user_quotas`, `events` (optional tagging)',
    '',
    '### 6.3 Scan (Group Photo / Multi-card) Workflow',
    '',
    '1. Enterprise user uploads group photo.',
    '2. Frontend calls `POST /api/scan-multi`.',
    '3. Backend validates enterprise tier + group scan quota.',
    '4. Backend extracts an array of contacts and inserts them.',
    '5. Group scan usage increments.',
    '',
    'Key data:',
    '',
    '- `contacts`, `user_quotas`, `event_contact_links`',
    '',
    '### 6.4 Contacts CRM Workflow',
    '',
    '1. Contacts page loads `GET /api/contacts`.',
    '2. User can search/filter, edit, enrich, export CSV/vCard.',
    '3. Relationship endpoints connect contacts into org charts.',
    '',
    'Key data:',
    '',
    '- `contacts`, `contact_relationships`, `deals`',
    '',
    '### 6.5 Events Workflow',
    '',
    '1. User creates an event `POST /api/events`.',
    '2. Contacts can be tagged to an event (via links table or contact fields depending on flow).',
    '3. Events page shows “leads scanned per event”.',
    '',
    'Key data:',
    '',
    '- `events`, `event_contact_links`, `contacts`',
    '',
    '### 6.6 AI Drafts Workflow',
    '',
    '1. User requests a draft: `POST /api/drafts/generate` with contact context.',
    '2. Backend generates text via AI text pipeline and stores an `ai_drafts` row.',
    '3. User can send: `POST /api/drafts/:id/send` (SMTP).',
    '',
    'Key data:',
    '',
    '- `ai_drafts`, `contacts`',
    '',
    '### 6.7 Email Marketing Workflow',
    '',
    '1. Build templates and lists.',
    '2. Create a campaign and send.',
    '3. Track opens/clicks with tracking endpoints.',
    '',
    'Key data:',
    '',
    '- `email_templates`, `email_lists`, `email_campaigns`, `email_sends`, `email_clicks`',
    '',
    '### 6.8 Calendar and Booking Workflow',
    '',
    '1. Enterprise admins configure calendars, availability, and booking links.',
    '2. Public users can open booking pages and schedule meetings.',
    '3. SMTP emails are sent for booking notifications and invites.',
    '',
    'Key data:',
    '',
    '- `calendars`, `calendar_events`, `availability_slots`, `booking_links`, `event_attendees`',
    '',
    '### 6.9 Compliance Policies Workflow',
    '',
    '1. Enterprise admin configures policies on the Policies page.',
    '2. Backend persists policies to `workspace_policies`.',
    '3. Policies affect retention and redaction behaviors (enforcement scope depends on feature implementation).',
    '',
    'Key data:',
    '',
    '- `workspace_policies`, `audit_trail`',
    '',
    '### 6.10 Data Quality (Dedupe/Merge) Workflow',
    '',
    '1. System creates dedupe suggestions in `data_quality_dedupe_queue`.',
    '2. Workspace admin reviews queue.',
    '3. Admin merges or dismisses items (writes back to contacts + queue status).',
    '',
    'Key data:',
    '',
    '- `data_quality_dedupe_queue`, `contacts`',
    '',
    '### 6.11 Integrations Workflow',
    '',
    '1. Workspace admin configures CRM mapping + webhooks.',
    '2. Sync jobs are tracked in `integration_sync_jobs`.',
    '3. Admin dashboards can review failed syncs and retry.',
    '',
    'Key data:',
    '',
    '- `webhooks`, `crm_mappings`, `crm_sync_log`, `integration_sync_jobs`',
    '',
    '### 6.12 Billing (Razorpay) Workflow',
    '',
    '1. Frontend requests a Razorpay order from backend.',
    '2. Razorpay checkout completes on client.',
    '3. Backend verifies signature and marks order as paid.',
    '4. Backend upgrades tier and quota limits.',
    '',
    'Key data:',
    '',
    '- `billing_orders`, `users`, `user_quotas`',
    '',
    '---',
    '',
    '## 6.13 Key Files Deep Dive (Frontend + Backend)',
    '',
    'Frontend:',
    '',
    '1. `intelliscan-app/src/main.jsx`: React bootstrap + providers.',
    '2. `intelliscan-app/src/App.jsx`: routing tree + role gating + generated routes.',
    '3. `intelliscan-app/src/context/RoleContext.jsx`: login/logout + access profile.',
    '4. `intelliscan-app/src/utils/auth.js`: token storage helpers.',
    '5. `intelliscan-app/src/pages/ScanPage.jsx`: scan flows + preview + quota UI.',
    '',
    'Backend:',
    '',
    '1. `intelliscan-server/index.js`: monolithic but complete API server (most features implemented here).',
    '2. `intelliscan-server/src/utils/db.js`: DB connection and helpers (intelliscan.db).',
    '3. `intelliscan-server/src/middleware/auth.js`: JWT + role enforcement.',
    '4. `intelliscan-server/src/utils/smtp.js`: SMTP delivery and simulation mode.',
    '5. `intelliscan-server/src/workers/tesseract_ocr_worker.js`: safe OCR fallback worker.',
    '',
    '---',
    '',
    '## 7) Backend API Catalog (Grouped)',
    '',
    'This is parsed best-effort from `routes.txt`.',
    '',
    backendRoutesMd || '(No backend routes parsed.)',
    '',
    '---',
    '',
    '## 7.1 Page Health (Missing Endpoints / Prototype Pages)',
    '',
    'Some pages (especially auto-migrated/generated routes) are UI-first prototypes and may not have complete backend wiring.',
    'For the current best-effort audit of missing endpoints and token usage, see:',
    '',
    '- `PAGE_HEALTH_REPORT.md`',
    '',
    '---',
    '',
    '## 8) Page Catalog (Every Route)',
    '',
    'This section is generated by parsing `intelliscan-app/src/App.jsx` (explicit routes) and `intelliscan-app/src/pages/generated/routes.json` (generated routes), and scanning each page file for `/api/*` usage.',
    '',
    buildPageCatalogMarkdown(allRoutes, apiByFile),
    '',
    '---',
    '',
    '## 9) File Index (Every File)',
    '',
    'This is a full inventory of repo files (excluding `node_modules/`, `dist/`, `.git/`).',
    '',
    buildFileIndexMarkdown(files, titlesByMdFile, pageRouteByFile),
    '',
    '---',
    '',
    '## 10) Database Dictionary (Authoritative)',
    '',
    'Use: `DATA_DICTIONARY_INTELLISCAN_DB.md` (generated directly from the local `intelliscan.db`).',
    '',
    'Regenerate:',
    '',
    '```powershell',
    'node intelliscan-server/dump_schema_intelliscan_db.cjs',
    '```',
    '',
    ''
  ].join('\n');

  const outPath = path.join(ROOT, 'INTELLISCAN_MASTER_DOCUMENTATION.md');
  fs.writeFileSync(outPath, doc, 'utf8');
  console.log('[master-doc] Wrote:', outPath);
}

main();
