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
const OPENROUTER_FREE_POOL = [
  "meta-llama/llama-3.2-11b-vision-instruct:free",
  "mistralai/pixtral-12b:free",
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash-exp:free",
  "qwen/qwen-2-vl-7b-instruct:free"
];

async function generateWithFallback(prompt) {
  // 1. Try Gemini
  let geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  let geminiModelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
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
      console.warn('Gemini API Fallback Triggered:', err.message);
    }
  }

  // 2. Try OpenRouter (Multi-Model Pool)
  let orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    const primaryModel = process.env.OPENROUTER_MODEL || "google/gemini-1.5-flash";
    const modelsToTry = [primaryModel, ...OPENROUTER_FREE_POOL.filter(m => m !== primaryModel)];

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${orKey}`,
            'X-Title': 'IntelliScan'
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        const result = await response.json();
        if (result.choices?.[0]?.message?.content) {
          return result.choices[0].message.content;
        }
      } catch (err) {
        console.warn(`OpenRouter model ${modelName} failed in fallback chain:`, err.message);
      }
    }
  }

  // 3. Try OpenAI Fallback
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
      
      // In serverless/production, we FAIL FAST and fallback rather than sleeping for 7 seconds.
      // This prevents Vercel/Twilio timeouts.
      if (is429) {
        console.warn(`⏳ Gemini rate-limited (429). Falling back immediately to next provider...`);
        throw err; 
      }
      
      if (i < maxRetries) {
        const retryAfterMs = 500; // Small delay for non-429 errors
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
  let lastError = 'No engines attempted';

  const modelStatuses = await dbAllAsync('SELECT type, status FROM ai_models');
  const isEngineActive = (type) => {
    const rows = (modelStatuses || []).filter((m) => m?.type === type);
    if (rows.length === 0) return true;
    return rows.some((m) => String(m.status || '').toLowerCase() === 'deployed');
  };

  // 1. Gemini (CLOUD OVERDRIVE — Priority 1)
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  if (geminiApiKey || isEngineActive('gemini')) {
    try {
      if (geminiApiKey) {
        // Use REST API for maximum control over version/naming
        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${geminiApiKey}`;
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
        console.error('Gemini REST API Rejected:', JSON.stringify(result));
        throw new Error(result.error?.message || 'Gemini REST API Error');
      }
    } catch (err) {
      console.error('Gemini Extraction Failed (REST):', err.message);
    }
  }

  // 2. OpenAI (CLOUD OVERDRIVE — Priority 2)
  const oaKey = process.env.OPENAI_API_KEY;
  if (oaKey || isEngineActive('openai')) {
    try {
      if (oaKey) {
        console.log('[AI Service] Calling OpenAI Fallback (gpt-4o-mini)');
        const openai = new OpenAI({ apiKey: oaKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
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
        });
        const data = JSON.parse(response.choices[0].message.content);
        data.engine_used = 'ChatGPT 4o-mini';
        return { data };
      }
    } catch (err) {
      console.error('OpenAI Extraction Failed:', err.message);
    }
  }

  // 3. OpenRouter (Secondary Cloud Fallback)
  if (isEngineActive('openrouter')) {
      try {
        const orKey = process.env.OPENROUTER_API_KEY;
        if (orKey) {
          console.log('[AI Service] Engaging Deep Pool Hunter... Scanning for available free endpoints.');
          
          const isMultiScan = prompt.toLowerCase().includes('every') || prompt.toLowerCase().includes('30 cards');
          const primaryModel = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";
          const modelsToTry = [primaryModel, ...OPENROUTER_FREE_POOL.filter(m => m !== primaryModel)];

          for (const modelCandidate of modelsToTry) {
            try {
              let currentModel = modelCandidate;
              if (isMultiScan && (currentModel.includes('free') || currentModel.includes('nano'))) {
                currentModel = "meta-llama/llama-3.2-11b-vision-instruct:free"; 
              }

              const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${orKey}`,
                  "Content-Type": "application/json",
                  "HTTP-Referer": process.env.SERVER_URL || "https://intelliscan.vercel.app", 
                  "X-Title": "IntelliScan"
                },
                body: JSON.stringify({
                  model: currentModel,
                  messages: [
                    { role: "system", content: "Extract business card data into a DENSE JSON object. Minimize whitespace to save tokens." },
                    { role: "user", content: [
                      { type: "text", text: extractionPrompt },
                      { type: "image_url", image_url: { url: `data:${effectiveMime};base64,${base64Data}` } }
                    ]}
                  ],
                  max_tokens: 8192,
                  temperature: 0.1
                })
              });

              const result = await response.json();
              if (result.choices?.[0]?.message?.content) {
                let rawText = result.choices[0].message.content.trim();
                const cleanedJson = extractJsonObjectFromText(rawText);
                if (!cleanedJson) throw new Error("AI outputted text but no valid JSON block was found.");

                const data = JSON.parse(cleanedJson);
                data.engine_used = `OpenRouter Hunter (${currentModel})`;
                return { data };
              }
              
              const errMsg = result.error?.message || 'Model Unavailable';
              console.warn(`[Deep Hunter] ${currentModel} failed: ${errMsg}. Trying next...`);
            } catch (innerErr) {
              console.warn(`[Deep Hunter] Skipping ${modelCandidate} due to error:`, innerErr.message);
              continue;
            }
          }
          throw new Error("No available vision models found in the OpenRouter pool.");
        }
      } catch (err) {
        lastError = err.message;
        console.error('OpenRouter Extraction Exhausted:', err.message);
      }
  }

      // 4. Text-Only Recovery (The "Safe-Mode" Fallback)
      if (allowTesseract) {
        try {
          console.log('[AI Service] Cloud Vision exhausted. Attempting OCR Recovery Mode...');
          const tesseractLang = String(process.env.TESSERACT_LANG || 'eng').trim() || 'eng';
          const ocr = await runTesseractOcrInWorker({ base64Data, lang: tesseractLang });
          
          if (ocr?.ok && ocr.text.trim().length > 10) {
            console.log('[AI Service] OCR Successful. Sending text to LLM for structuring.');
            const textPrompt = `I have OCR text from a business card scan. Extract the contacts into JSON.\n\nOCR TEXT:\n${ocr.text}`;
            const recovery = await generateWithFallback(textPrompt);
            const extracted = extractJsonObjectFromText(recovery);
            const data = JSON.parse(extracted || recovery);
            data.engine_used = 'OCR + LLM Recovery';
            return { data };
          }
        } catch (ocrErr) {
          console.error('[AI Service] OCR Recovery Failed:', ocrErr.message);
        }
      }
    } catch (err) {
      lastError = err.message;
      console.error('OpenRouter Extraction Exhausted:', err.message);
    }

    return { error: `All extraction engines failed. Last error: ${lastError}`, status: 500 };
}

/**
 * Unified Text AI Pipeline for generic interactions (e.g. Chatbot, Draft Email)
 */
async function unifiedTextAIPipeline({ prompt, systemPrompt, responseFormat = 'json', model: preferredModel }) {
  const combinedPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  // 0. Specific Model Override (Multi-Model Support)
  if (preferredModel && preferredModel !== 'gemini') {
    try {
      const orKey = process.env.OPENROUTER_API_KEY;
      if (orKey) {
        console.log(`[AI Service] Routing to preferred model: ${preferredModel} via OpenRouter`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${orKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: preferredModel,
            messages: [{ role: "user", content: combinedPrompt }]
          })
        });
        const result = await response.json();
        if (result.choices?.[0]?.message?.content) {
          const text = result.choices[0].message.content;
          if (responseFormat === 'json') {
            const extracted = extractJsonObjectFromText(text.trim());
            return { success: true, data: JSON.parse(extracted || text.trim()) };
          }
          return { success: true, data: text.trim() };
        }
      }
    } catch (err) {
      console.warn(`[AI Service] Preferred model ${preferredModel} failed, falling back to default chain:`, err.message);
    }
  }

  // 1. Try Gemini (Primary) - Prioritized for Low Latency
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    if (apiKey) {
      // Use Flash-8B for CHAT to get ~1s response time.
      const modelName = preferredModel || process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: combinedPrompt }] }],
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7
          }
        })
      });

      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = result.candidates[0].content.parts[0].text;

        if (responseFormat === 'json') {
          const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const extracted = extractJsonObjectFromText(cleaned);
          return { success: true, data: JSON.parse(extracted || cleaned), model_used: modelName };
        }
        return { success: true, data: text.trim(), model_used: modelName };
      }
      throw new Error(result.error?.message || 'Gemini REST Error');
    }
  } catch (err) {
    console.warn('Gemini Direct Fast-Track Failed, checking fallbacks:', err.message);
  }

  // 2. Try OpenRouter (Secondary Cloud Fallback)
  try {
    const orKey = process.env.OPENROUTER_API_KEY;
    if (orKey) {
      const primaryModel = process.env.OPENROUTER_MODEL || "google/gemini-1.5-flash";
      const modelsToTry = [primaryModel, ...OPENROUTER_FREE_POOL.filter(m => m !== primaryModel)];

      for (const modelName of modelsToTry) {
        try {
          console.log(`[AI Service] Attempting OpenRouter model: ${modelName}`);
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${orKey}`,
              "Content-Type": "application/json",
              "X-Title": "IntelliScan"
            },
            body: JSON.stringify({
              model: modelName,
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
            return { success: true, data: text.trim(), model_used: modelName };
          }
          console.warn(`[AI Service] OpenRouter model ${modelName} returned no content or error. Trying next...`);
        } catch (err) {
          console.warn(`[AI Service] OpenRouter model ${modelName} failed:`, err.message);
        }
      }
    }
  } catch (err) {
    console.warn('OpenRouter Text API Chain Failed:', err.message);
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

  // 4. Mock Local Fallback (Final Safety Net)
  console.warn('[AI Service] All cloud engines failed. Using local heuristic fallback for continuity.');
  
  const lowerPrompt = combinedPrompt.toLowerCase();
  let mockReply = "I'm currently in a limited-connectivity mode, but I can still help! IntelliScan is a powerful CRM for scanning business cards and managing professional contacts. You can upload cards via the dashboard, export them to Excel, or even link your WhatsApp for scanning on the go. What specific feature can I guide you through?";

  if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi ')) {
    mockReply = "Hello! I'm your IntelliScan assistant. While my cloud brain is currently being optimized, I can still help you with scanning, exports, or WhatsApp setup. How can I assist?";
  } else if (lowerPrompt.includes('price') || lowerPrompt.includes('tier') || lowerPrompt.includes('plan')) {
    mockReply = "IntelliScan has three tiers: Personal (10 credits/mo), Advanced (Pro features), and Scale (Enterprise). You can upgrade in the Billing section to get more precision and CRM sync features.";
  } else if (lowerPrompt.includes('whatsapp') || lowerPrompt.includes('phone')) {
    mockReply = "To set up WhatsApp, go to Settings > Personal Info, click '1. Join Sandbox', and then send your unique Discovery Code to our Twilio node. This lets you scan cards just by taking a photo on your phone!";
  } else if (lowerPrompt.includes('scan') || lowerPrompt.includes('upload')) {
    mockReply = "You can scan cards by clicking 'New Scan' on the dashboard. I support single cards or bulk uploads (up to 25 at once). Our AI extracts names, emails, and phone numbers automatically.";
  }

  if (responseFormat === 'json') {
    return { success: true, data: { reply: mockReply, is_mock: true } };
  }
  return { success: true, data: mockReply };
}

/**
 * Validates a profile photo for human presence and professional appropriateness.
 * Blocks non-human subjects and NSFW/Inappropriate content.
 */
async function validateProfilePhoto(imageBase64, mimeType = 'image/jpeg') {
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const prompt = `You are an Enterprise Identity Moderation AI. Your task is to validate profile photos for a professional business platform.

Strictly evaluate the image for the following:
1. Human Presence: The image MUST contain a clear human face/portrait.
2. Professionalism: Reject animals, landscapes, cartoons, or random objects.
3. Safety: Reject any nudity, sexually suggestive content, violence, or offensive gestures (NSFW).

Return ONLY a valid JSON object:
{
  "valid": true/false,
  "reason": "Detailed explanation if valid is false (e.g. 'Photo must contain a human face' or 'Inappropriate content detected')"
}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[AI Service] No Gemini API Key. Skipping photo validation.');
      return { valid: true }; // Fallback to allow if AI is unconfigured
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType } }] 
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          responseMimeType: "application/json"
        }
      })
    });

    const result = await response.json();
    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      const rawText = result.candidates[0].content.parts[0].text;
      const data = JSON.parse(extractJsonObjectFromText(rawText) || rawText);
      return data;
    }
    
    throw new Error(result.error?.message || 'AI Validation Service Error');
  } catch (err) {
    console.error('[AI Photo Validation Failed]', err.message);
    // Be lenient on AI failure to prevent blocking user uploads on API down-time
    return { valid: true }; 
  }
}

/**
 * Unified Image AI Pipeline for generating professional brand assets (e.g. Logos).
 */
async function unifiedImageGeneration({ prompt, size = '1024x1024', model = 'openai/dall-e-3' }) {
  try {
    // 1. Try Direct OpenAI (Primary for DALL-E 3)
    const oaKey = process.env.OPENAI_API_KEY;
    if (oaKey && model.includes('dall-e')) {
      console.log(`[AI Service] Generating image with Direct OpenAI: ${model}`);
      const openai = new OpenAI({ apiKey: oaKey });
      const response = await openai.images.generate({
        model: model.includes('dall-e-3') ? "dall-e-3" : "dall-e-2",
        prompt: prompt,
        n: 1,
        size: size,
      });
      if (response.data?.[0]?.url) {
        return { success: true, url: response.data[0].url };
      }
    }

    // 2. Try OpenRouter (Fallback / Multi-Model)
    const orKey = process.env.OPENROUTER_API_KEY;
    if (orKey) {
      console.log(`[AI Service] Generating image via OpenRouter: ${model}`);
      const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${orKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          size: size
        })
      });

      const result = await response.json();
      if (result.data?.[0]?.url) {
        return { success: true, url: result.data[0].url };
      }
      
      if (result.choices?.[0]?.message?.content) {
        const content = result.choices[0].message.content;
        const urlMatch = content.match(/https:\/\/\S+/);
        if (urlMatch) return { success: true, url: urlMatch[0] };
      }

      const errorDetail = result.error?.message || (result.data?.[0]?.error) || 'OpenRouter unknown error';
      console.warn(`[AI Service] OpenRouter Image Gen failed: ${errorDetail}`);
    }

    // 3. Premium Heuristic Fallback (Dicebear / Abstract)
    // If specific AI services fail, we provide a high-end abstract geometric logo from a reliable source.
    console.warn('[AI Service] All cloud image engines failed. Falling back to premium procedural identity.');
    const seed = encodeURIComponent(prompt.substring(0, 80));
    // Using Dicebear "shapes" or "identicon" for a clean, corporate tech look
    const fallbackUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=0f172a,1e293b,334155&shape1Color=818cf8,38bdf8,22d3ee`;
    
    return { 
      success: true, 
      url: fallbackUrl, 
      isMock: true, 
      note: 'Cloud engine offline. High-end synthetic fallback generated.' 
    };

  } catch (err) {
    console.error('[AI Image Generation Error]', err.message);
    const seed = Math.random().toString(36).substring(7);
    return { 
      success: true, 
      url: `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}`, 
      isMock: true,
      error: `Cloud engine error: ${err.message}. Showing synthetic fallback.` 
    };
  }

}


module.exports = {
  generateWithFallback,
  generateEmbedding,
  callGeminiWithRetry,
  runTesseractOcrInWorker,
  unifiedExtractionPipeline,
  unifiedTextAIPipeline,
  unifiedImageGeneration,
  validateProfilePhoto
};
