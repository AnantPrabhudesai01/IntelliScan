const { dbGetAsync, dbRunAsync } = require('./db');

/**
 * Returns default system policies.
 */
function getDefaultPolicies() {
  return {
    retention_days: 90,
    pii_redaction_enabled: 1,
    strict_audit_storage_enabled: 1
  };
}

/**
 * Masks an email for PII protection.
 * e.g., "example@domain.com" -> "e*****e@domain.com"
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
}

/**
 * Masks a phone number for PII protection.
 * e.g., "+1234567890" -> "+123****890"
 */
function maskPhone(phone) {
  if (!phone) return phone;
  const str = String(phone);
  if (str.length <= 5) return '****' + str.slice(-1);
  return str.slice(0, 3) + '*'.repeat(str.length - 6) + str.slice(-3);
}

/**
 * Fetches policies for a specific workspace or user scope.
 */
async function getPoliciesForScope(scopeWorkspaceId) {
  const row = await dbGetAsync(
    `SELECT retention_days, pii_redaction_enabled, strict_audit_storage_enabled 
     FROM workspace_policies WHERE workspace_id = ?`,
    [scopeWorkspaceId]
  );

  if (!row) return getDefaultPolicies();
  return {
    retention_days: Number(row.retention_days),
    pii_redaction_enabled: Number(row.pii_redaction_enabled) ? 1 : 0,
    strict_audit_storage_enabled: Number(row.strict_audit_storage_enabled) ? 1 : 0
  };
}

/**
 * Applies PII redaction to contact input based on policies.
 */
function applyPiiPolicyToContactInput(contactInput = {}, policies = getDefaultPolicies()) {
  if (!policies?.pii_redaction_enabled) return contactInput;

  const sanitized = { ...contactInput };
  if (sanitized.email) sanitized.email = maskEmail(sanitized.email);
  if (sanitized.phone) sanitized.phone = maskPhone(sanitized.phone);
  
  // Clear base64 data to prevent DB bloat if it somehow bypassed the interceptor
  const base64Regex = /^data:image\//;
  if (sanitized.image_url && base64Regex.test(String(sanitized.image_url))) {
    sanitized.image_url = null;
  }
  if (sanitized.card_image && base64Regex.test(String(sanitized.card_image))) {
    sanitized.card_image = null;
  }
  return sanitized;
}

/**
 * Deletes contacts that have exceeded the retention period.
 */
async function runRetentionPurgeForScope(scopeWorkspaceId, retentionDays) {
  if (!retentionDays || Number(retentionDays) <= 0) {
    return { purged: 0 };
  }

  const cutoff = new Date(Date.now() - Number(retentionDays) * 24 * 60 * 60 * 1000).toISOString();
  const result = await dbRunAsync(
    `DELETE FROM contacts 
     WHERE workspace_scope = ? 
       AND (crm_synced IS NULL OR crm_synced = 0) 
       AND scan_date < ?`,
    [scopeWorkspaceId, cutoff]
  );

  return { purged: Number(result?.changes || 0) };
}

module.exports = {
  getDefaultPolicies,
  getPoliciesForScope,
  applyPiiPolicyToContactInput,
  runRetentionPurgeForScope,
  maskEmail,
  maskPhone
};
