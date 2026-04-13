const { deriveNameFromEmail, deriveCompanyFromEmail, cleanCardValue } = require('./aiUtils');
const { normalizeEmail } = require('./auth');
const { PERSONAL_EMAIL_DOMAINS } = require('../config/constants');

/**
 * Determines whether the fallback Mock AI mode should be active.
 * Usually true in non-production environments when allowances are set.
 */
function shouldUseMockAiFallback() {
  const raw = String(process.env.ALLOW_MOCK_AI_FALLBACK || '').trim().toLowerCase();
  if (!raw) {
    // In dev, prefer returning deterministic fallbacks so the app is usable without keys.
    return String(process.env.NODE_ENV || '').trim().toLowerCase() !== 'production';
  }
  return ['1', 'true', 'yes', 'on'].includes(raw);
}

/**
 * Returns a static, structured fallback response for a single card scan.
 */
function buildFallbackSingleCardResponse() {
  return {
    rejected: false,
    name: 'Sarah Mitchell',
    company: 'Stark Industries',
    title: 'Senior Solutions Architect',
    email: 'sarah.mitchell@stark.com',
    phone: '+1 (555) 019-2834',
    website: 'www.stark.com',
    address: '10880 Malibu Point, CA 90265',
    inferred_industry: 'Technology',
    inferred_seniority: 'Senior',
    confidence: 82,
    engine_used: 'Fallback OCR (offline mode)',
    warning: 'Gemini AI is unavailable. This is a fallback draft - please review before saving.'
  };
}

/**
 * Returns a static, structured fallback response for multi-card group scan.
 */
function buildFallbackMultiCardResponse() {
  const baseContacts = [
    { name: 'Alex Harper', title: 'VP of Product', company: 'Acme Corp', email: 'alex@acme.io', phone: '+1-555-0100' },
    { name: 'Jordan Lee', title: 'CTO', company: 'Cybernetics Inc', email: 'jordan.l@cybernetics.dom', phone: '+1-555-0211' },
    { name: 'Jamie Rivera', title: 'Director of Sales', company: 'Global Traders', email: 'jamie@globaltraders.co', phone: '555-0322' },
    { name: 'Casey Smith', title: 'Marketing Lead', company: 'Nexus Ltd', email: 'casey@nexus.net', phone: '555-0450' },
    { name: 'Taylor Swift', title: 'Developer Advocate', company: 'TechFlow', email: 'taylor@techflow.dev', phone: '555-0678' }
  ];

  const mockContacts = Array.from({ length: 25 }).map((_, i) => {
    const base = baseContacts[i % baseContacts.length];
    return {
      ...base,
      name: `${base.name} ${i + 1}`,
      email: `user${i + 1}_${base.email}`
    };
  });

  const cards = mockContacts.map((c) => ({
    name: c.name,
    company: c.company,
    title: c.title,
    email: c.email,
    phone: c.phone,
    website: '',
    address: '',
    inferred_industry: 'Software',
    inferred_seniority: 'Executive',
    confidence: 85,
    is_duplicate: false
  }));
  return {
    cards,
    total_detected: cards.length,
    engine_used: 'Fallback OCR (offline mode)',
    warning: 'Gemini AI is unavailable. These fallback placeholders should be edited before saving.'
  };
}

/**
 * Normalizes an extracted card's attributes and applies heuristics.
 */
function normalizeExtractedCard(card = {}, options = {}) {
  const fallbackConfidence = Number(options.fallbackConfidence ?? 75);
  const normalized = {
    name: cleanCardValue(card.name, 160),
    company: cleanCardValue(card.company, 160),
    title: cleanCardValue(card.title || card.job_title, 160),
    email: normalizeEmail(card.email),
    phone: cleanCardValue(card.phone, 80),
    website: cleanCardValue(card.website, 180),
    address: cleanCardValue(card.address, 280),
    inferred_industry: cleanCardValue(card.inferred_industry, 80),
    inferred_seniority: cleanCardValue(card.inferred_seniority, 80),
    detected_language: cleanCardValue(card.detected_language || card.language, 64)
  };

  if (!normalized.name && normalized.email) {
    normalized.name = deriveNameFromEmail(normalized.email);
  }

  if (!normalized.company && normalized.email) {
    normalized.company = deriveCompanyFromEmail(normalized.email, PERSONAL_EMAIL_DOMAINS);
  }

  const parsedConfidence = Number(card.confidence);
  normalized.confidence = Number.isFinite(parsedConfidence)
    ? Math.max(0, Math.min(100, Math.round(parsedConfidence)))
    : fallbackConfidence;

  if (card.name_native) normalized.name_native = cleanCardValue(card.name_native, 160);
  if (card.company_native) normalized.company_native = cleanCardValue(card.company_native, 160);
  if (card.title_native) normalized.title_native = cleanCardValue(card.title_native, 160);

  return normalized;
}

module.exports = {
  shouldUseMockAiFallback,
  buildFallbackSingleCardResponse,
  buildFallbackMultiCardResponse,
  normalizeExtractedCard
};
