/**
 * Dedupe Utilities — Contact deduplication, completeness scoring, merge suggestions
 */
const { normalizeEmail } = require('./auth');

/** Normalize a phone number by stripping non-digit chars (except leading +) */
function normalizePhone(phone) {
  if (!phone) return '';
  const str = String(phone).trim();
  return str.replace(/[^+\d]/g, '');
}

function getContactCompletenessScore(contact) {
  let score = 0;
  if (contact?.email) score += 3;
  if (contact?.phone) score += 2;
  if (contact?.company) score += 1;
  if (contact?.job_title) score += 1;
  if (contact?.notes) score += 1;
  score += Math.round((Number(contact?.confidence) || 0) / 20);
  return score;
}

function selectPrimaryContact(groupContacts) {
  if (!Array.isArray(groupContacts) || groupContacts.length === 0) return null;
  return [...groupContacts].sort((a, b) => {
    const scoreDelta = getContactCompletenessScore(b) - getContactCompletenessScore(a);
    if (scoreDelta !== 0) return scoreDelta;
    return new Date(b.scan_date || 0).getTime() - new Date(a.scan_date || 0).getTime();
  })[0];
}

function buildFieldMergeSuggestions(primary, others) {
  if (!primary) return {};
  const suggestions = {};
  const mergeFields = ['email', 'phone', 'company', 'job_title', 'notes', 'tags', 'inferred_industry', 'inferred_seniority', 'image_url'];

  mergeFields.forEach((field) => {
    if (primary[field]) return;
    const candidate = others.find((contact) => contact?.[field]);
    if (candidate?.[field]) {
      suggestions[field] = candidate[field];
    }
  });

  return suggestions;
}

function buildDedupeSuggestions(contacts = []) {
  const byEmail = new Map();
  const byPhone = new Map();
  const byNameCompany = new Map();
  const suggestionMap = new Map();
  const contactById = new Map((contacts || []).map((c) => [c.id, c]));

  contacts.forEach((contact) => {
    const emailKey = normalizeEmail(contact.email);
    if (emailKey) {
      if (!byEmail.has(emailKey)) byEmail.set(emailKey, []);
      byEmail.get(emailKey).push(contact.id);
    }

    const phoneKey = normalizePhone(contact.phone);
    if (phoneKey.length >= 7) {
      if (!byPhone.has(phoneKey)) byPhone.set(phoneKey, []);
      byPhone.get(phoneKey).push(contact.id);
    }

    const nameCompanyKey = `${normalizeEmail(contact.name)}::${normalizeEmail(contact.company)}`;
    if (normalizeEmail(contact.name) && normalizeEmail(contact.company)) {
      if (!byNameCompany.has(nameCompanyKey)) byNameCompany.set(nameCompanyKey, []);
      byNameCompany.get(nameCompanyKey).push(contact.id);
    }
  });

  const ingestGroup = (ids, reason, confidence) => {
    const uniqueSortedIds = [...new Set(ids)].sort((a, b) => a - b);
    if (uniqueSortedIds.length < 2) return;

    const idsKey = uniqueSortedIds.join(',');
    if (!suggestionMap.has(idsKey)) {
      suggestionMap.set(idsKey, { ids: uniqueSortedIds, reasons: new Set(), confidence: 0 });
    }
    const current = suggestionMap.get(idsKey);
    current.reasons.add(reason);
    current.confidence = Math.max(current.confidence, confidence);
  };

  for (const ids of byEmail.values()) if (ids.length > 1) ingestGroup(ids, 'Exact email match', 97);
  for (const ids of byPhone.values()) if (ids.length > 1) ingestGroup(ids, 'Exact phone match', 92);
  for (const ids of byNameCompany.values()) if (ids.length > 1) ingestGroup(ids, 'Same name + company', 83);

  return [...suggestionMap.values()].map((entry) => {
    const groupContacts = entry.ids.map((id) => contactById.get(id)).filter(Boolean);
    const primary = selectPrimaryContact(groupContacts);
    const duplicates = groupContacts.filter((c) => c.id !== primary?.id);
    const fingerprint = `${entry.ids.join('-')}|${[...entry.reasons].sort().join('&')}`;
    return {
      fingerprint,
      reason: [...entry.reasons].join(' + '),
      confidence: entry.confidence,
      contact_ids: entry.ids,
      primary_contact_id: primary?.id || entry.ids[0],
      primary_contact: primary || groupContacts[0],
      duplicates,
      merge_suggestions: buildFieldMergeSuggestions(primary, duplicates)
    };
  }).sort((a, b) => b.confidence - a.confidence);
}

function buildCoachFallbackInsights({ total, staleCount, missingContext, topIndustries, topSeniorities }) {
  const freshnessRatio = total > 0 ? Math.max(0, 1 - staleCount / total) : 0.5;
  const contextRatio = total > 0 ? Math.max(0, 1 - missingContext / total) : 0.5;
  const diversityBonus = topIndustries ? 0.12 : 0.05;
  const health = Math.round(Math.min(100, (freshnessRatio * 48 + contextRatio * 40 + diversityBonus * 100)));

  const actions = [
    {
      id: 'stale',
      title: staleCount > 0 ? `Re-activate ${staleCount} stale contacts` : 'Maintain outreach momentum',
      description: staleCount > 0
        ? `${staleCount} relationships are idle for over 14 days. Send follow-up drafts now to avoid deal decay.`
        : 'No stale contacts detected this week. Keep your weekly touchpoints consistent.',
      cta: staleCount > 0 ? 'Open AI Drafts' : 'Review Draft Queue',
      color: staleCount > 0 ? 'red' : 'emerald'
    },
    {
      id: 'industry',
      title: topIndustries ? `Double down on ${topIndustries.split(',')[0]}` : 'Build one focused segment',
      description: topIndustries
        ? `Your strongest network cluster is in ${topIndustries}. Run a tailored campaign with persona-specific messaging.`
        : 'No strong vertical cluster yet. Segment your contacts by industry to unlock smarter campaigns.',
      cta: 'Plan Campaign',
      color: 'indigo'
    },
    {
      id: 'context',
      title: missingContext > 0 ? `Fix ${missingContext} incomplete profiles` : 'Profiles look healthy',
      description: missingContext > 0
        ? `${missingContext} contacts are missing key context (role/company/email). Fill these fields to improve routing and outreach quality.`
        : `Your profile quality is strong. Seniority coverage: ${topSeniorities || 'balanced'}.`,
      cta: missingContext > 0 ? 'Clean Contacts' : 'View Contacts',
      color: missingContext > 0 ? 'blue' : 'emerald'
    }
  ];

  return {
    health_score: health,
    momentum_status: health >= 75 ? 'Strong Momentum' : health >= 55 ? 'Stable Growth' : 'Needs Attention',
    actions
  };
}

function extractJsonObjectFromText(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return raw.slice(firstBrace, lastBrace + 1);
}

module.exports = {
  normalizePhone,
  getContactCompletenessScore,
  selectPrimaryContact,
  buildFieldMergeSuggestions,
  buildDedupeSuggestions,
  buildCoachFallbackInsights,
  extractJsonObjectFromText
};
