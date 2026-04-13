/**
 * Helper to extract a JSON string from a block of text.
 * Especially useful for AI responses that might include markdown code blocks.
 */
function extractJsonObjectFromText(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;

  // Find the first occurrence of either '{' or '['
  const startObj = raw.indexOf('{');
  const startArr = raw.indexOf('[');
  let start = -1;
  let endChar = '';

  if (startObj !== -1 && (startArr === -1 || startObj < startArr)) {
    start = startObj;
    endChar = '}';
  } else if (startArr !== -1) {
    start = startArr;
    endChar = ']';
  }

  if (start === -1) return null;

  const lastEnd = raw.lastIndexOf(endChar);
  if (lastEnd === -1 || lastEnd <= start) return null;

  return raw.slice(start, lastEnd + 1);
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
