/* eslint-disable no-console */
// Runs Tesseract OCR in an isolated process so failures can't crash the API server.
// Input: JSON on stdin: { base64: string, lang?: string, langPath?: string }
// Output: JSON on stdout: { ok: true, text: string } OR { ok: false, error: string }

'use strict';

const path = require('path');
const Tesseract = require('tesseract.js');

function writeResult(obj) {
  try {
    process.stdout.write(JSON.stringify(obj));
  } catch (_) {
    // If stdout is not writable, there's nothing else we can do.
  }
}

function errorToMessage(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  return err.message || String(err);
}

process.on('uncaughtException', (err) => {
  writeResult({ ok: false, error: errorToMessage(err) });
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  writeResult({ ok: false, error: errorToMessage(reason) });
  process.exit(0);
});

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', async () => {
  let payload = null;
  try {
    payload = JSON.parse(raw || '{}');
  } catch (err) {
    writeResult({ ok: false, error: `Invalid JSON input: ${errorToMessage(err)}` });
    process.exit(0);
    return;
  }

  const base64 = String(payload.base64 || '').trim();
  const lang = String(payload.lang || 'eng').trim() || 'eng';

  // Allow pointing at local traineddata directory (offline mode).
  // Default to repo root (intelliscan-server/) where eng.traineddata exists in this project.
  const langPath = String(payload.langPath || '').trim() ||
    path.resolve(__dirname, '../../');

  if (!base64) {
    writeResult({ ok: false, error: 'Missing base64 image input' });
    process.exit(0);
    return;
  }

  try {
    const buffer = Buffer.from(base64, 'base64');
    const result = await Tesseract.recognize(buffer, lang, { langPath });
    const text = result?.data?.text ? String(result.data.text) : '';
    writeResult({ ok: true, text });
  } catch (err) {
    writeResult({ ok: false, error: errorToMessage(err) });
  } finally {
    process.exit(0);
  }
});

process.stdin.resume();

