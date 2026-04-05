import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '../..');
const appRoot = path.resolve(repoRoot, 'intelliscan-app');
const serverRoot = path.resolve(repoRoot, 'intelliscan-server');

const APP_ROUTES_FILE = path.resolve(appRoot, 'src', 'App.jsx');
const GENERATED_ROUTES_FILE = path.resolve(appRoot, 'src', 'pages', 'generated', 'routes.json');
const SERVER_INDEX_FILE = path.resolve(serverRoot, 'index.js');
const SERVER_WORKSPACE_ROUTES_FILE = path.resolve(serverRoot, 'src', 'routes', 'workspaceRoutes.js');

function nowIso() {
  return new Date().toISOString();
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function normalizeFrontendPath(p) {
  if (!p) return null;
  let s = String(p).trim();
  if (!s) return null;
  // Strip any origin if present.
  s = s.replace(/^https?:\/\/[^/]+/i, '');
  // Remove query string + fragment.
  s = s.split('?')[0].split('#')[0];
  if (!s.startsWith('/')) s = `/${s}`;

  // Convert template literals into a rough route pattern.
  // `/api/foo/${id}/bar` -> `/api/foo/:param/bar`
  const parts = s.split('/').map((seg) => {
    if (!seg) return seg;
    if (seg.includes('${')) return ':param';
    return seg;
  });

  return parts.join('/').replace(/\/+/g, '/');
}

function backendPathToRegex(backendPath) {
  const normalized = normalizeFrontendPath(backendPath);
  if (!normalized) return null;
  const escaped = normalized
    .split('/')
    .map((seg) => {
      if (seg.startsWith(':')) return '[^/]+';
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp(`^${escaped}$`);
}

function extractApiCallsFromSource(src) {
  const calls = [];

  // axios.get('/api/foo'), axios.post(`/api/foo/${id}`)
  const axiosRe = /\baxios\.(get|post|put|patch|delete)\(\s*([`'"])([\s\S]*?)\2/gm;
  for (const m of src.matchAll(axiosRe)) {
    const method = String(m[1] || '').toUpperCase();
    const raw = m[3];
    if (raw && raw.includes('/api/')) calls.push({ method, raw });
  }

  // fetch('/api/foo'), fetch(`/api/foo/${id}`, { method: 'POST' })
  const fetchRe = /\bfetch\(\s*([`'"])([\s\S]*?)\1\s*(?:,\s*{[\s\S]*?})?\s*\)/gm;
  for (const m of src.matchAll(fetchRe)) {
    const raw = m[2];
    if (raw && raw.includes('/api/')) calls.push({ method: 'FETCH', raw });
  }

  // Lightweight scan for strings containing /api/ (covers some helper wrappers).
  const literalRe = /([`'"])([^`'"]*\/api\/[^`'"]*)\1/gm;
  for (const m of src.matchAll(literalRe)) {
    const raw = m[2];
    if (raw) calls.push({ method: 'LITERAL', raw });
  }

  // Normalize + de-dupe.
  const normalized = calls
    .map((c) => ({ ...c, path: normalizeFrontendPath(c.raw) }))
    .filter((c) => c.path && c.path.startsWith('/api/'));

  const key = (c) => `${c.method}:${c.path}`;
  const seen = new Set();
  const out = [];
  for (const c of normalized) {
    const k = key(c);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

async function listAllFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.resolve(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist') continue;
      out.push(...(await listAllFiles(p)));
    } else {
      out.push(p);
    }
  }
  return out;
}

async function readIfExists(p) {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return null;
  }
}

function parseAppImports(appSrc) {
  // import Foo from './pages/Foo';
  const map = new Map();
  const re = /^\s*import\s+([A-Za-z0-9_]+)\s+from\s+['"](.+?)['"]\s*;?\s*$/gm;
  for (const m of appSrc.matchAll(re)) {
    const name = m[1];
    const rel = m[2];
    if (!name || !rel) continue;
    if (!rel.startsWith('.')) continue;
    map.set(name, rel);
  }
  return map;
}

function parseExplicitRoutesFromApp(appSrc, importMap) {
  const routes = [];
  const lines = appSrc.split(/\r?\n/);
  for (const line of lines) {
    if (!line.includes('<Route')) continue;
    if (!line.includes('path=')) continue;

    const pathMatch = line.match(/\bpath\s*=\s*["']([^"']+)["']/);
    if (!pathMatch) continue;
    const routePathRaw = pathMatch[1];

    const componentCandidates = Array.from(line.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)).map((m) => m[1]);
    const component = [...componentCandidates].reverse().find((c) => importMap.has(c)) || null;

    let file = null;
    if (component && importMap.has(component)) {
      const rel = importMap.get(component);
      // Resolve from App.jsx location (src/)
      file = path.resolve(path.dirname(APP_ROUTES_FILE), rel) + (rel.endsWith('.jsx') ? '' : '');
      if (!file.endsWith('.jsx') && !file.endsWith('.js')) file = `${file}.jsx`;
    }

    routes.push({
      kind: 'explicit',
      routePath: normalizeFrontendPath(routePathRaw),
      component,
      file
    });
  }
  return routes.filter((r) => r.routePath);
}

async function parseGeneratedRoutes() {
  const src = await fs.readFile(GENERATED_ROUTES_FILE, 'utf8');
  const json = JSON.parse(src);
  const routes = [];
  for (const r of json || []) {
    const routePath = normalizeFrontendPath(r.path);
    const name = r.name;
    const file = name ? path.resolve(appRoot, 'src', 'pages', 'generated', `${name}.jsx`) : null;
    routes.push({
      kind: 'generated',
      routePath,
      component: name || null,
      file
    });
  }
  return routes;
}

async function parseBackendRoutes() {
  const files = [SERVER_INDEX_FILE, SERVER_WORKSPACE_ROUTES_FILE].filter(Boolean);
  const routes = [];
  const re = /\b(app|router)\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/gm;
  for (const f of files) {
    const src = await readIfExists(f);
    if (!src) continue;
    for (const m of src.matchAll(re)) {
      const method = String(m[2] || '').toUpperCase();
      const p = normalizeFrontendPath(m[3]);
      if (!p || !p.startsWith('/api/')) continue;
      routes.push({ method, path: p, file: f });
    }
  }

  // De-dupe by method+path.
  const seen = new Set();
  const out = [];
  for (const r of routes) {
    const k = `${r.method}:${r.path}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

function matchBackendPath(frontPath, backendRoutes) {
  if (!frontPath) return null;
  for (const br of backendRoutes) {
    const rx = backendPathToRegex(br.path);
    if (rx && rx.test(frontPath)) return br;
  }
  return null;
}

async function main() {
  const appSrc = await fs.readFile(APP_ROUTES_FILE, 'utf8');
  const importMap = parseAppImports(appSrc);
  const explicitRoutes = parseExplicitRoutesFromApp(appSrc, importMap);
  const generatedRoutes = await parseGeneratedRoutes();
  const allRoutes = [...explicitRoutes, ...generatedRoutes];

  const backendRoutes = await parseBackendRoutes();

  // Extract API calls per page component file.
  const pageRows = [];
  let unreadablePages = 0;
  for (const r of allRoutes) {
    if (!r.file) {
      pageRows.push({ ...r, apiCalls: [], missing: [], localStorageToken: false, unreadable: true });
      unreadablePages += 1;
      continue;
    }
    const src = await readIfExists(r.file);
    if (!src) {
      pageRows.push({ ...r, apiCalls: [], missing: [], localStorageToken: false, unreadable: true });
      unreadablePages += 1;
      continue;
    }

    const apiCalls = extractApiCallsFromSource(src);
    const missing = apiCalls
      .filter((c) => !matchBackendPath(c.path, backendRoutes))
      .map((c) => `${c.path} (${c.method})`);

    const localStorageToken = /\blocalStorage\.getItem\(\s*['"]token['"]\s*\)/.test(src);

    pageRows.push({
      ...r,
      apiCalls,
      missing: uniq(missing),
      localStorageToken,
      unreadable: false
    });
  }

  // Backend routes that appear unused (best-effort based on string match).
  const allFrontPaths = new Set(pageRows.flatMap((p) => p.apiCalls.map((c) => c.path)));
  const unusedBackend = backendRoutes.filter((br) => {
    // Use regex matching to check if any front path matches this backend route.
    const rx = backendPathToRegex(br.path);
    if (!rx) return false;
    for (const fp of allFrontPaths) {
      if (rx.test(fp)) return false;
    }
    return true;
  });

  const pagesWithMissing = pageRows.filter((p) => p.missing.length > 0);
  const pagesWithLocalStorageToken = pageRows.filter((p) => p.localStorageToken);

  const md = [];
  md.push(`# IntelliScan Page Health Report`);
  md.push('');
  md.push(`Generated: \`${nowIso()}\``);
  md.push('');
  md.push(`## Summary`);
  md.push('');
  md.push(`- Total routes (explicit + generated): **${allRoutes.length}**`);
  md.push(`- Explicit routes in \`App.jsx\`: **${explicitRoutes.length}**`);
  md.push(`- Generated routes in \`routes.json\`: **${generatedRoutes.length}**`);
  md.push(`- Pages missing / unreadable file mapping: **${unreadablePages}**`);
  md.push(`- Backend API routes detected (best-effort): **${backendRoutes.length}**`);
  md.push(`- Pages with missing backend endpoints: **${pagesWithMissing.length}**`);
  md.push(`- Pages still using \`localStorage.getItem('token')\` directly: **${pagesWithLocalStorageToken.length}**`);
  md.push('');

  md.push(`## Pages With Missing Backend Endpoints`);
  md.push('');
  if (pagesWithMissing.length === 0) {
    md.push(`- None detected (based on string matching).`);
  } else {
    for (const p of pagesWithMissing.sort((a, b) => String(a.routePath).localeCompare(String(b.routePath)))) {
      md.push(`- \`${p.routePath}\` -> \`${p.component || 'UnknownComponent'}\``);
      md.push(`  - file: \`${p.file ? path.relative(repoRoot, p.file) : 'N/A'}\``);
      md.push(`  - missing endpoints: ${p.missing.map((m) => `\`${m}\``).join(', ')}`);
    }
  }
  md.push('');

  md.push(`## Pages Still Using localStorage Token Directly`);
  md.push('');
  if (pagesWithLocalStorageToken.length === 0) {
    md.push(`- None detected.`);
  } else {
    for (const p of pagesWithLocalStorageToken.sort((a, b) => String(a.routePath).localeCompare(String(b.routePath)))) {
      md.push(`- \`${p.routePath}\` -> \`${p.component || 'UnknownComponent'}\` (\`${path.relative(repoRoot, p.file)}\`)`);
    }
  }
  md.push('');

  md.push(`## Backend Routes Possibly Unused By Frontend`);
  md.push('');
  md.push(`(Best-effort: compares frontend string endpoints to backend route patterns.)`);
  md.push('');
  if (unusedBackend.length === 0) {
    md.push(`- None detected.`);
  } else {
    for (const r of unusedBackend.sort((a, b) => a.path.localeCompare(b.path))) {
      md.push(`- \`${r.method}\` \`${r.path}\``);
    }
  }
  md.push('');

  const outPath = path.resolve(repoRoot, 'PAGE_HEALTH_REPORT.md');
  await fs.writeFile(outPath, md.join('\n'), 'utf8');

  // Also print a small console summary for CI-friendly output.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    generated_at: nowIso(),
    routes_total: allRoutes.length,
    explicit_routes: explicitRoutes.length,
    generated_routes: generatedRoutes.length,
    backend_routes: backendRoutes.length,
    pages_with_missing_endpoints: pagesWithMissing.length,
    pages_with_localstorage_token: pagesWithLocalStorageToken.length,
    output: path.relative(repoRoot, outPath)
  }, null, 2));
}

await main();

