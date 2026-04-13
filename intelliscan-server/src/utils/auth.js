function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function firstNameFromFullName(name) {
  const parsed = String(name || '').trim().split(/\s+/)[0];
  return parsed || 'there';
}

module.exports = { normalizeEmail, firstNameFromFullName };
