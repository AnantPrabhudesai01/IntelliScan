import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function decodePdfStringLiteral(s) {
  // Decode PDF string literal escape sequences inside (...) blocks.
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch !== '\\') {
      out += ch;
      continue;
    }
    const next = s[i + 1];
    if (next === undefined) break;

    // Standard escapes
    if (next === 'n') {
      out += '\n';
      i++;
      continue;
    }
    if (next === 'r') {
      out += '\r';
      i++;
      continue;
    }
    if (next === 't') {
      out += '\t';
      i++;
      continue;
    }
    if (next === 'b') {
      out += '\b';
      i++;
      continue;
    }
    if (next === 'f') {
      out += '\f';
      i++;
      continue;
    }
    if (next === '\\' || next === '(' || next === ')') {
      out += next;
      i++;
      continue;
    }

    // Octal escapes: \ddd (1-3 digits)
    if (next >= '0' && next <= '7') {
      let oct = next;
      let j = i + 2;
      for (; j < s.length && oct.length < 3; j++) {
        const c = s[j];
        if (c >= '0' && c <= '7') oct += c;
        else break;
      }
      out += String.fromCharCode(parseInt(oct, 8));
      i += oct.length;
      continue;
    }

    // Line continuation (backslash at EOL)
    if (next === '\n' || next === '\r') {
      i++;
      continue;
    }

    // Unknown escape: keep raw next char
    out += next;
    i++;
  }
  return out;
}

function extractStringsFromContent(contentLatin1) {
  // Extract text shown via text operators: (.. ) Tj, [..] TJ, and (..)'.
  const out = [];

  const skipWs = (s, i) => {
    while (i < s.length && /\s/.test(s[i])) i++;
    return i;
  };

  const parseParenString = (s, i) => {
    // i at '('
    let depth = 1;
    let j = i + 1;
    let raw = '';
    while (j < s.length) {
      const ch = s[j];
      if (ch === '\\') {
        const nxt = s[j + 1];
        if (nxt === undefined) break;
        raw += ch + nxt;
        j += 2;
        continue;
      }
      if (ch === '(') {
        depth++;
        raw += ch;
        j++;
        continue;
      }
      if (ch === ')') {
        depth--;
        if (depth === 0) break;
        raw += ch;
        j++;
        continue;
      }
      raw += ch;
      j++;
    }
    return { raw, end: j };
  };

  const parseBracketArray = (s, i) => {
    // i at '['; parse until matching ']' not inside string
    let j = i + 1;
    let raw = '';
    while (j < s.length) {
      const ch = s[j];
      if (ch === '(') {
        const ps = parseParenString(s, j);
        raw += '(' + ps.raw + ')';
        j = ps.end + 1;
        continue;
      }
      if (ch === ']') break;
      raw += ch;
      j++;
    }
    return { raw, end: j };
  };

  const extractStringsFromArrayRaw = (arrayRaw) => {
    const parts = [];
    let k = 0;
    while (k < arrayRaw.length) {
      if (arrayRaw[k] !== '(') {
        k++;
        continue;
      }
      const ps = parseParenString(arrayRaw, k);
      const dec = decodePdfStringLiteral(ps.raw);
      parts.push(dec);
      k = ps.end + 1;
    }
    return parts;
  };

  let i = 0;
  while (i < contentLatin1.length) {
    const ch = contentLatin1[i];
    if (ch === '(') {
      const ps = parseParenString(contentLatin1, i);
      const value = decodePdfStringLiteral(ps.raw);
      let j = skipWs(contentLatin1, ps.end + 1);
      if (contentLatin1.startsWith('Tj', j) || contentLatin1[j] === "'") {
        const trimmed = value.replace(/\s+/g, ' ').trim();
        if (trimmed) out.push(trimmed);
      }
      i = ps.end + 1;
      continue;
    }
    if (ch === '[') {
      const arr = parseBracketArray(contentLatin1, i);
      let j = skipWs(contentLatin1, arr.end + 1);
      if (contentLatin1.startsWith('TJ', j)) {
        const parts = extractStringsFromArrayRaw(arr.raw);
        const merged = parts.join('').replace(/\s+/g, ' ').trim();
        if (merged) out.push(merged);
      }
      i = arr.end + 1;
      continue;
    }
    i++;
  }

  // Heuristic: keep mostly printable lines
  return out.filter((line) => {
    const printable = line.split('').filter((c) => c >= ' ' && c <= '~').length;
    return line.length > 0 && printable / line.length >= 0.6;
  });
}

function extractFlateStreams(pdfLatin1) {
  const streams = [];
  const re = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let m;
  while ((m = re.exec(pdfLatin1)) !== null) {
    const startIdx = m.index;
    const rawStreamLatin1 = m[1];
    // Look back a little for the stream dictionary
    const dictWindowStart = Math.max(0, startIdx - 500);
    const dictWindow = pdfLatin1.slice(dictWindowStart, startIdx);
    const isFlate = /\/Filter\s*\/FlateDecode/.test(dictWindow) || /\/FlateDecode/.test(dictWindow);
    if (!isFlate) continue;
    // Skip image/font binary streams to avoid garbage output
    const isImage = /\/Subtype\s*\/Image/.test(dictWindow) || /\/Type\s*\/XObject/.test(dictWindow);
    const isFontFile = /\/FontFile/.test(dictWindow) || /\/FontFile2/.test(dictWindow) || /\/FontFile3/.test(dictWindow);
    if (isImage || isFontFile) continue;
    streams.push(rawStreamLatin1);
  }
  return streams;
}

function asciiStrings(buf, minLen = 6) {
  const out = [];
  let cur = [];
  const isPrintable = (b) => b >= 32 && b <= 126;
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (isPrintable(b)) {
      cur.push(String.fromCharCode(b));
    } else {
      if (cur.length >= minLen) out.push(cur.join(''));
      cur = [];
    }
  }
  if (cur.length >= minLen) out.push(cur.join(''));
  return out;
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node tools/extract_guidelines_pdf_text.mjs <path-to-pdf>');
    process.exit(1);
  }

  const abs = path.resolve(inputPath);
  const buf = fs.readFileSync(abs);
  const pdfLatin1 = buf.toString('latin1');

  const streams = extractFlateStreams(pdfLatin1);
  const extracted = [];

  for (const sLatin1 of streams) {
    const rawBuf = Buffer.from(sLatin1, 'latin1');
    try {
      const inflated = zlib.inflateSync(rawBuf);
      const inflatedLatin1 = inflated.toString('latin1');
      extracted.push(...extractStringsFromContent(inflatedLatin1));
    } catch {
      // ignore
    }
  }

  // De-dupe, keep order
  const seen = new Set();
  const uniq = [];
  for (const line of extracted) {
    const k = line.replace(/\s+/g, ' ').trim();
    if (!k) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(k);
  }

  const outTxt = [
    `PDF: ${abs}`,
    '',
    '=== EXTRACTED TEXT (heuristic) ===',
    ...uniq
  ].join('\n');

  const outPath = path.resolve('GUIDELINES_EXTRACT.txt');
  fs.writeFileSync(outPath, outTxt, 'utf8');
  console.log('[guidelines] wrote:', outPath);
}

main();
