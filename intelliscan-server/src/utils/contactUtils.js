/**
 * Contact Utility functions for scoring and deduplication.
 */
const { normalizeEmail, normalizePhone } = require('./auth');

/**
 * Calculates a completeness score for a contact.
 * @param {Object} contact - The contact object
 * @returns {number} Score
 */
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

/**
 * Selects the most complete contact from a group of duplicates.
 * @param {Array} groupContacts - Array of contacts
 * @returns {Object} Primary contact
 */
function selectPrimaryContact(groupContacts) {
  if (!Array.isArray(groupContacts) || groupContacts.length === 0) return null;
  return [...groupContacts].sort((a, b) => {
    const scoreDelta = getContactCompletenessScore(b) - getContactCompletenessScore(a);
    if (scoreDelta !== 0) return scoreDelta;
    return new Date(b.scan_date || 0).getTime() - new Date(a.scan_date || 0).getTime();
  })[0];
}

/**
 * Builds field merge suggestions for duplicates.
 * @param {Object} primary - Primary contact
 * @param {Array} others - Other duplicate contacts
 * @returns {Object} Suggestions
 */
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

/**
 * Detects duplicates in a contact list.
 * @param {Array} contacts - Contact list
 * @returns {Array} Dedupe suggestions
 */
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

    const nameKey = normalizeEmail(contact.name);
    const companyKey = normalizeEmail(contact.company);
    const nameCompanyKey = `${nameKey}::${companyKey}`;
    if (nameKey && companyKey) {
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

module.exports = {
  getContactCompletenessScore,
  selectPrimaryContact,
  buildFieldMergeSuggestions,
  buildDedupeSuggestions
};
