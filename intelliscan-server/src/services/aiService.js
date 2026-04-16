const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const { spawn } = require('child_process');
const path = require('path');
const { dbGetAsync, dbAllAsync } = require('../utils/db');
const { extractJsonObjectFromText } = require('../utils/aiUtils');

/**
 * Generates text using multiple AI providers with fallbacks.
 * Order: Gemini -> OpenAI -> Hugging Face (Llama 3)
 */
async function generateWithFallback(prompt) {
  // 1. Try Gemini
  let geminiKey = process.env.GEMINI_API_KEY;
  let geminiModelName = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview";
  try {
    const customConfig = await dbGetAsync('SELECT value FROM engine_config WHERE key = "gemini_api_key" OR key = "GEMINI_API_KEY" LIMIT 1');
    if (customConfig && customConfig.value) geminiKey = customConfig.value;
  } catch (e) { }

  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${geminiModelName}:generateContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      }
      throw new Error(result.error?.message || 'Gemini API Error');
    } catch (err) {
      console.warn('Gemini failed, trying OpenAI fallback:', err.message);
    }
  }

  // 2. Try OpenAI Fallback
  let openaiKey = process.env.OPENAI_API_KEY;
  let openaiModelName = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
  try {
    const oaiConfig = await dbGetAsync('SELECT value FROM engine_config WHERE key = "open_ai_api_key" OR key = "OPENAI_API_KEY" LIMIT 1');
    if (oaiConfig && oaiConfig.value) openaiKey = oaiConfig.value;
  } catch (e) { }

  if (openaiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: openaiModelName,
        messages: [{ role: "user", content: prompt }]
      });
      return completion.choices[0].message.content;
    } catch (err) {
      console.warn('OpenAI failed, trying Hugging Face fallback:', err.message);
    }
  }

  // 3. Try Hugging Face (100% Free / Open Source Fallback)
  let hfKey = process.env.HUGGINGFACE_API_KEY;
  if (hfKey) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions",
        {
          headers: {
            "Authorization": `Bearer ${hfKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000
          })
        }
      );
      const json = await response.json();
      return json.choices[0].message.content;
    } catch (err) {
      console.error('All AI providers failed:', err.message);
    }
  }

  throw new Error('All AI providers failed and no mock fallback available');
}

/**
 * Generates embeddings using Gemini API.
 */
async function generateEmbedding(text) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: { parts: [{ text }] }
      })
    });
    const json = await response.json();
    return json.embedding?.values || null;
  } catch (err) {
    console.error('Embedding Generation Error:', err.message);
    return null;
  }
}

/**
 * Call Gemini with automatic retry on 429 Resource Exhausted.
 */
async function callGeminiWithRetry(model, parts, maxRetries = 2) {
  let lastErr;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await model.generateContent(parts);
    } catch (err) {
      lastErr = err;
      const is429 = err?.status === 429 || 
                   (err?.message || '').toLowerCase().includes('too many requests') || 
                   (err?.message || '').toLowerCase().includes('resource_exhausted');
      if (is429 && i < maxRetries) {
        const retryAfterMs = (err?.errorDetails?.[0]?.retryDelay ? parseInt(err.errorDetails[0].retryDelay) * 1000 : 7000) + 500;
        console.log(`⏳ Gemini rate-limited (429). Retrying in ${retryAfterMs / 1000}s (attempt ${i+1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
}

/**
 * Run Tesseract OCR in a separate worker process to avoid blocking the main event loop.
 */
function runTesseractOcrInWorker({ base64Data, lang = 'eng', timeoutMs = 25000 }) {
  return new Promise((resolve) => {
    const workerPath = path.resolve(__dirname, '../workers/tesseract_ocr_worker.js');
    const child = spawn(process.execPath, [workerPath], {
      cwd: path.resolve(__dirname, '../../'),
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      try { child.kill(); } catch (_) { }
      resolve({ ok: false, error: `Tesseract OCR timed out after ${timeoutMs}ms` });
    }, timeoutMs);

    child.stdout.on('data', (buf) => { stdout += buf.toString('utf8'); });
    child.stderr.on('data', (buf) => { stderr += buf.toString('utf8'); });

    child.on('close', (code) => {
      clearTimeout(timer);
      const raw = String(stdout || '').trim();
      if (!raw) {
        const msg = stderr ? stderr.trim() : `Tesseract worker exited (code ${code})`;
        return resolve({ ok: false, error: msg });
      }

      try {
        const parsed = JSON.parse(raw);
        if (parsed?.ok) return resolve({ ok: true, text: String(parsed.text || '') });
        return resolve({ ok: false, error: String(parsed?.error || stderr || 'Tesseract OCR failed') });
      } catch (err) {
        return resolve({
          ok: false,
          error: stderr ? stderr.trim() : `Failed to parse Tesseract output: ${err.message}`
        });
      }
    });

    const payload = JSON.stringify({
      base64: base64Data,
      lang,
      langPath: path.resolve(__dirname, '../../') // traineddata lives in server root
    });

    try {
      child.stdin.end(payload);
    } catch (err) {
      clearTimeout(timer);
      resolve({ ok: false, error: err.message });
    }
  });
}

/**
 * Core extraction pipeline that tries multiple engines in order.
 */
async function unifiedExtractionPipeline({ imageBase64, mimeType, prompt, userId, tier, allowTesseract = true }) {
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const effectiveMime = mimeType || 'image/jpeg';

  const modelStatuses = await dbAllAsync('SELECT type, status FROM ai_models');
  const isEngineActive = (type) => {
    const rows = (modelStatuses || []).filter((m) => m?.type === type);
    if (rows.length === 0) return true;
    return rows.some((m) => String(m.status || '').toLowerCase() === 'deployed');
  };

  // 1. Gemini (TEMPORARILY DISABLED)
  if (isEngineActive('gemini')) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        // Use REST API for maximum control over version/naming
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: [{ 
              parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: effectiveMime } }] 
            }],
            generationConfig: {
              maxOutputTokens: 16384,
              responseMimeType: "application/json"
            }
          })
        });
        const result = await response.json();
        
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          let rawText = result.candidates[0].content.parts[0].text.trim();
          if (rawText.startsWith('```json')) rawText = rawText.replace(/^```json/, '');
          if (rawText.startsWith('```')) rawText = rawText.replace(/^```/, '');
          if (rawText.endsWith('```')) rawText = rawText.replace(/```$/, '');
          const extracted = extractJsonObjectFromText(rawText.trim());
          const data = JSON.parse(extracted || rawText.trim());
          data.engine_used = 'Gemini 3 Flash (Ultra-Fast)';
          return { data };
        }
        throw new Error(result.error?.message || 'Gemini REST API Error');
      }
    } catch (err) {
      console.error('Gemini Extraction Failed (REST):', err.message);
    }
  }

  // 2. OpenAI (TEMPORARILY DISABLED)
  /*
  if (isEngineActive('openai')) {
    try {
      const oaKey = process.env.OPENAI_API_KEY;
      if (oaKey) {
        const openai = new OpenAI({ apiKey: oaKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `You are a world-class Business Card Extraction Engine in EXHAUSTIVE SCAN MODE.
The image contains up to 25 separate business cards. You MUST identify EVERY SINGLE card.
Use a Scan-Line Strategy: Start at the Top-Left corner and move Left-to-Right, then Top-to-Bottom. Do not skip any card.

Return ONLY a valid JSON object:
{
  "engine_used": "Gemini 3 Flash (Exhaustive)",
  "cards": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "name": "Person Name",
      ...
    }
  ]
}` },
                { type: "image_url", image_url: { url: `data:${effectiveMime};base64,${base64Data}` } }
              ]
            }
          ],
          response_format: { type: "json_object" }
        });
        const data = JSON.parse(response.choices[0].message.content);
        data.engine_used = 'ChatGPT 4o-mini';
        return { data };
      }
    } catch (err) {
      console.error('OpenAI Extraction Failed:', err.message);
    }
  }
  */

  // 3. OpenRouter (Secondary Cloud Fallback)
  if (isEngineActive('openrouter')) {
    try {
      const orKey = process.env.OPENROUTER_API_KEY;
      if (orKey) {
        const orModel = process.env.OPENROUTER_MODEL || "google/gemini-1.5-flash";
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${orKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.SERVER_URL || "https://intelliscan.vercel.app", 
            "X-Title": "IntelliScan"
          },
          body: JSON.stringify({
            model: orModel,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: `data:${effectiveMime};base64,${base64Data}` } }
                ]
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        const result = await response.json();
        if (result.choices?.[0]?.message?.content) {
          let rawText = result.choices[0].message.content.trim();
          if (rawText.startsWith('```json')) rawText = rawText.replace(/^```json/, '');
          if (rawText.startsWith('```')) rawText = rawText.replace(/^```/, '');
          if (rawText.endsWith('```')) rawText = rawText.replace(/```$/, '');
          const data = JSON.parse(rawText.trim());
          data.engine_used = `OpenRouter (${orModel})`;
          return { data };
        }
        throw new Error(result.error?.message || 'OpenRouter API Error');
      }
    } catch (err) {
      console.error('OpenRouter Extraction Failed:', err.message);
    }
  }

  // 4. Tesseract (Last Resort)
  if (allowTesseract && isEngineActive('tesseract')) {
    try {
      const tesseractLang = String(process.env.TESSERACT_LANG || 'eng').trim() || 'eng';
      const ocr = await runTesseractOcrInWorker({ base64Data, lang: tesseractLang });
      if (ocr?.ok) {
        // Since Tesseract only gives text, we'd ideally need a second pass with a text-only LLM
        // For brevity in this refactor, we return the raw text if no LLM worked
        return { data: { text: ocr.text, engine_used: 'Tesseract Offline' } };
      }
    } catch (err) {
      console.error('Tesseract Extraction Failed:', err.message);
    }
  }

  return { error: 'All extraction engines failed', status: 500 };
}

/**
 * Unified Text AI Pipeline for generic interactions (e.g. Chatbot, Draft Email)
 */
async function unifiedTextAIPipeline({ prompt, systemPrompt, responseFormat = 'json' }) {
  const combinedPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  // 1. Try Gemini (Primary) - TEMPORARILY DISABLED
  /*
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: combinedPrompt }] }] })
      });
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = result.candidates[0].content.parts[0].text;

        if (responseFormat === 'json') {
          const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const extracted = extractJsonObjectFromText(cleaned);
          return { success: true, data: JSON.parse(extracted || cleaned) };
        }
        return { success: true, data: text.trim() };
      }
      throw new Error(result.error?.message || 'Gemini REST Error');
    }
  } catch (err) {
    console.warn('Gemini Text API Failed (Falling back to OpenAI):', err.message);
  }
  */

  try {
    const orKey = process.env.OPENROUTER_API_KEY;
    if (orKey) {
      const orModel = process.env.OPENROUTER_MODEL || "google/gemini-1.5-flash";
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${orKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: orModel,
          messages: [{ role: "user", content: combinedPrompt }]
        })
      });
      const result = await response.json();
      if (result.choices?.[0]?.message?.content) {
        const text = result.choices[0].message.content;
        if (responseFormat === 'json') {
          let rawText = text.trim();
          if (rawText.startsWith('```json')) rawText = rawText.replace(/^```json/, '');
          if (rawText.startsWith('```')) rawText = rawText.replace(/^```/, '');
          if (rawText.endsWith('```')) rawText = rawText.replace(/```$/, '');
          const extracted = extractJsonObjectFromText(rawText.trim());
          return { success: true, data: JSON.parse(extracted || rawText.trim()) };
        }
        return { success: true, data: text.trim() };
      }
    }
  } catch (err) {
    console.warn('OpenRouter Text API Failed:', err.message);
  }

  // 3. Try OpenAI (Fallback) - TEMPORARILY DISABLED
  /*
  try {
    const oaKey = process.env.OPENAI_API_KEY;
    if (oaKey) {
      const openai = new OpenAI({ apiKey: oaKey });
      const config = {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: combinedPrompt }]
      };
      if (responseFormat === 'json') {
        config.response_format = { type: "json_object" };
      }

      const response = await openai.chat.completions.create(config);
      const content = response.choices[0].message.content;

      if (responseFormat === 'json') {
        return { success: true, data: JSON.parse(content) };
      }
      return { success: true, data: content.trim() };
    }
  } catch (err) {
    console.error('OpenAI Text API Failed:', err.message);
  }
  */

  // 3. Try Hugging Face (Fallback 2)
  try {
    const hfKey = process.env.HUGGINGFACE_API_KEY;
    if (hfKey) {
      console.log('Using Hugging Face Text API (fallback)...');
      const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions",
        {
          headers: {
            "Authorization": `Bearer ${hfKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            model: "meta-llama/Meta-Llama-3-8B-Instruct",
            messages: [{ role: "user", content: combinedPrompt }],
            max_tokens: 1500,
          }),
        }
      );
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      const content = result.choices[0].message.content;

      if (responseFormat === 'json') {
        const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const extracted = extractJsonObjectFromText(cleaned);
        return { success: true, data: JSON.parse(extracted || cleaned) };
      }
      return { success: true, data: content.trim() };
    }
  } catch (err) {
    console.error('Hugging Face Text API Failed:', err.message);
  }

  return { success: false, error: 'All cloud AI text engines (Gemini, OpenAI, HuggingFace) failed.' };
}

module.exports = {
  generateWithFallback,
  generateEmbedding,
  callGeminiWithRetry,
  runTesseractOcrInWorker,
  unifiedExtractionPipeline,
  unifiedTextAIPipeline
};
