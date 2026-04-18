const { db } = require('./db');

/**
 * Log administrative actions for enterprise audit compliance.
 * @param {object} req - Express request object for IP and user info
 * @param {object} event - { action, resource, status, details }
 */
function logAuditEvent(req, event) {
  const { action, resource, status, details, actorEmail, actorUserId, actorRole } = event;
  
  // Safely extract actor info
  const actor_user_id = actorUserId || req?.user?.id || null;
  const actor_email = actorEmail || req?.user?.email || 'anonymous';
  const actor_role = actorRole || req?.user?.role || 'user';
  
  // Guard against missing headers/socket to prevent 500 crash cascades
  const ip_address = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || 'unknown';
  const user_agent = req?.headers?.['user-agent'] || 'unknown';

  const { dbRunAsync } = require('./db');
  dbRunAsync(
    'INSERT INTO audit_trail (actor_user_id, actor_email, actor_role, action, resource, status, ip_address, user_agent, details_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [actor_user_id, actor_email, actor_role, action, resource, status, ip_address, user_agent, JSON.stringify(details || {})]
  ).catch(err => {
    console.error('[AUDIT] Log Error:', err.message);
  });
}

module.exports = {
  logAuditEvent,
  AUDIT_SUCCESS: 'SUCCESS',
  AUDIT_DENIED: 'DENIED',
  AUDIT_ERROR: 'ERROR'
};
