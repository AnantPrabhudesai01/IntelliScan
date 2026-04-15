function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function firstNameFromFullName(name) {
  const parsed = String(name || '').trim().split(/\s+/)[0];
  return parsed || 'there';
}

/**
 * Standardizes phone numbers to a clean digits-only format or E.164.
 * Removes 'whatsapp:' prefix if present.
 */
function normalizePhone(phone) {
  let cleaned = String(phone || '').replace(/whatsapp:/i, '').trim();
  // Ensure it starts with + if it looks like an international number
  if (cleaned.length >= 10 && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

module.exports = { normalizeEmail, firstNameFromFullName, normalizePhone };
