/**
 * Helper to extract and optionally repair a JSON string from a block of text.
 * Especially useful for AI responses that might include markdown code blocks 
 * or responses that were truncated by token limits.
 */
function repairJson(jsonStr) {
  let text = jsonStr.trim();
  if (!text) return null;

  // 1. Basic cleaning
  text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // Remove control characters

  // 2. Count nesting to identify truncation
  let stack = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char === '{' ? '}' : ']');
      } else if (char === '}' || char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        }
      }
    }
  }

  // 3. If missing terminators, append them
  if (stack.length > 0) {
    if (inString) text += '"'; // Close trailing string
    
    // Check if we ended mid-property or mid-value
    const lastChar = text.trim().slice(-1);
    if (lastChar === ',' || lastChar === ':') {
      text = text.trim().slice(0, -1);
    }
    
    while (stack.length > 0) {
      text += stack.pop();
    }
  }
  
  return text;
}

function extractJsonObjectFromText(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;

  // Find the first occurrence of either '{' or '['
  const startObj = raw.indexOf('{');
  const startArr = raw.indexOf('[');
  let start = -1;

  if (startObj !== -1 && (startArr === -1 || startObj < startArr)) {
    start = startObj;
  } else if (startArr !== -1) {
    start = startArr;
  }

  if (start === -1) return null;

  // Extract from start to the very end of the string
  // We rely on repairJson to close anything left hanging
  const content = raw.slice(start);
  
  try {
    // Try original parse first
    const endChar = (raw[start] === '{') ? '}' : ']';
    const lastEnd = content.lastIndexOf(endChar);
    if (lastEnd !== -1) {
      const candidate = content.slice(0, lastEnd + 1);
      JSON.parse(candidate); 
      return candidate;
    }
  } catch (e) {
    // Falls through to repair logic
  }

  return repairJson(content);
}


/**
 * Sanitizes a string value extracted from a card.
 */
function cleanCardValue(value, maxLength = 300) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Heuristic to derive a name from an email address (e.g. "john.doe@company.com" -> "John Doe").
 */
function deriveNameFromEmail(email) {
  if (!email || !email.includes('@')) return '';
  const localPart = email.split('@')[0] || '';
  const words = localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '';
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Heuristic to derive a company name from an email domain.
 */
function deriveCompanyFromEmail(email, personalDomains = new Set(['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'])) {
  if (!email || !email.includes('@')) return '';
  const domain = email.split('@')[1] || '';
  if (!domain || personalDomains.has(domain.toLowerCase())) return '';

  const root = domain.split('.')[0] || '';
  const words = root
    .replace(/[-_]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Validates if the extracted card data has enough meaningful content to be saved.
 */
function hasMeaningfulContactData(card = {}) {
  return Boolean(
    cleanCardValue(card.name) ||
    cleanCardValue(card.company) ||
    cleanCardValue(card.email) ||
    cleanCardValue(card.phone)
  );
}

/**
 * Generates a vector embedding for a given text using Google's Embedding API.
 */
async function generateEmbedding(text) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const url = `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${apiKey}`;
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
 * Calculates cosine similarity between two numeric vectors.
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (mA * mB);
}

module.exports = {
  extractJsonObjectFromText,
  cleanCardValue,
  deriveNameFromEmail,
  deriveCompanyFromEmail,
  hasMeaningfulContactData,
  generateEmbedding,
  cosineSimilarity
};
