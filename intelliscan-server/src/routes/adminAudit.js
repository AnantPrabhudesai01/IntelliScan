const express = require('express');
const router = express.Router();
const { dbAllAsync, dbGetAsync } = require('../utils/db');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

/**
 * Advanced Admin & Security Audit Routes
 */

// GET /api/admin/audit-timeline (Real Audit Logs)
router.get('/audit-timeline', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const logs = await dbAllAsync(`
      SELECT id, action, resource, status, actor_email, actor_role, created_at, details_json
      FROM audit_trail 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/security-pulse (Suspicious Activity Detector)
router.get('/security-pulse', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    // 1. Check for failed logins in last 24h
    const failedLogins = await dbGetAsync(`
      SELECT COUNT(*) as count 
      FROM audit_trail 
      WHERE action = 'LOGIN_FAIL' 
      AND created_at > datetime('now', '-1 day')
    `);

    // 2. Check for scan spikes (e.g. > 50 scans by one user in 1 hour)
    const scanSpikes = await dbAllAsync(`
      SELECT actor_email, COUNT(*) as scan_count
      FROM audit_trail
      WHERE action = 'CARD_SCAN'
      AND created_at > datetime('now', '-1 hour')
      GROUP BY actor_email
      HAVING scan_count > 50
    `);

    // 3. Check for unauthorized admin attempts
    const unauthorizedAdmin = await dbGetAsync(`
      SELECT COUNT(*) as count
      FROM audit_trail
      WHERE status = 'FAILURE' AND resource LIKE '%admin%'
      AND created_at > datetime('now', '-1 day')
    `);

    res.json({
      pulse_status: scanSpikes.length > 0 || unauthorizedAdmin.count > 5 ? 'critical' : 'healthy',
      failed_logins_24h: failedLogins.count,
      active_threats: scanSpikes.map(s => `Potential data scraping by ${s.actor_email} (${s.scan_count} scans/hr)`),
      unauthorized_admin_attempts: unauthorizedAdmin.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
