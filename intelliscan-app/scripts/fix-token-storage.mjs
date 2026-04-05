import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '../..');
const appRoot = path.resolve(repoRoot, 'intelliscan-app');
const srcRoot = path.resolve(appRoot, 'src');
const authModuleAbs = path.resolve(srcRoot, 'utils', 'auth.js');

async function listFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.resolve(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist') continue;
      out.push(...(await listFiles(p)));
    } else if (ent.isFile()) {
      if (p.endsWith('.js') || p.endsWith('.jsx')) out.push(p);
    }
  }
  return out;
}

function computeImportPath(fromFileAbs) {
  const rel = path.relative(path.dirname(fromFileAbs), authModuleAbs).replace(/\\/g, '/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

function hasGetStoredTokenImport(src) {
  return /\bgetStoredToken\b/.test(src) && /from\s+['"][^'"]*utils\/auth['"]/.test(src);
}

function upsertGetStoredTokenImport(src, importPath) {
  const lines = src.split(/\r?\n/);

  // Try to patch an existing utils/auth import.
  const authImportIdx = lines.findIndex((l) => /from\s+['"][^'"]*utils\/auth['"]\s*;?\s*$/.test(l));
  if (authImportIdx !== -1) {
    const line = lines[authImportIdx];

    // import { a, b } from '../utils/auth';
    const m = line.match(/^\s*import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]\s*;?\s*$/);
    if (m) {
      const items = m[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (!items.includes('getStoredToken')) items.unshift('getStoredToken');
      lines[authImportIdx] = `import { ${items.join(', ')} } from '${m[2]}';`;
      return lines.join('\n');
    }

    // If it's a default import or mixed import, fall back to adding a new import line.
  }

  // Insert a new import line after the last import in the header.
  const newImport = `import { getStoredToken } from '${importPath}';`;
  let insertAt = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\s+/.test(lines[i])) insertAt = i + 1;
    else if (lines[i].trim() !== '') break;
  }
  lines.splice(insertAt, 0, newImport);
  return lines.join('\n');
}

function patchFile(src, importPath) {
  if (!src.includes("localStorage.getItem('token')")) return null;

  let out = src.replaceAll("localStorage.getItem('token')", 'getStoredToken()');

  // Ensure import exists if needed.
  if (!/\bgetStoredToken\b/.test(out) || !/from\s+['"][^'"]*utils\/auth['"]/.test(out)) {
    out = upsertGetStoredTokenImport(out, importPath);
  }

  return out === src ? null : out;
}

async function main() {
  const files = await listFiles(srcRoot);
  let changed = 0;
  for (const file of files) {
    const src = await fs.readFile(file, 'utf8');
    const importPath = computeImportPath(file);
    const patched = patchFile(src, importPath);
    if (!patched) continue;
    await fs.writeFile(file, patched, 'utf8');
    changed += 1;
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ changed_files: changed }, null, 2));
}

await main();

