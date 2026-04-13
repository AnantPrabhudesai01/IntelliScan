/**
 * Campaign Utilities — Audience building and template variable substitution
 */
const { dbAllAsync } = require('./db');

/** Campaign audience builder */
async function getCampaignAudienceForUser({ userId, targetIndustry, targetSeniority, limit = 1000 }) {
  let sql = `SELECT id, name, email, company, job_title, inferred_industry, inferred_seniority
             FROM contacts WHERE user_id = ? AND email IS NOT NULL AND email != ''`;
  const params = [userId];

  if (targetIndustry) {
    sql += ` AND LOWER(inferred_industry) = LOWER(?)`;
    params.push(targetIndustry);
  }
  if (targetSeniority) {
    sql += ` AND LOWER(inferred_seniority) = LOWER(?)`;
    params.push(targetSeniority);
  }
  sql += ` ORDER BY scan_date DESC LIMIT ?`;
  params.push(limit);

  return dbAllAsync(sql, params);
}

/** Template variable substitutions for email campaigns */
function applyTemplateVariables(template, contact) {
  if (!template) return '';
  return String(template)
    .replace(/\{\{firstName\}\}/gi, String(contact?.name || 'there').split(/\s+/)[0])
    .replace(/\{\{name\}\}/gi, String(contact?.name || ''))
    .replace(/\{\{email\}\}/gi, String(contact?.email || ''))
    .replace(/\{\{company\}\}/gi, String(contact?.company || ''))
    .replace(/\{\{title\}\}/gi, String(contact?.job_title || ''))
    .replace(/\{\{industry\}\}/gi, String(contact?.inferred_industry || ''))
    .replace(/\{\{seniority\}\}/gi, String(contact?.inferred_seniority || ''));
}

module.exports = {
  getCampaignAudienceForUser,
  applyTemplateVariables
};
