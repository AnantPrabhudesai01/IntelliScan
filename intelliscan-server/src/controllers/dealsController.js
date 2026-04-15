/**
 * Deals Controller — Logic for pipeline board and contact deal updates
 */
const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');
const { logAuditEvent, AUDIT_SUCCESS, AUDIT_ERROR } = require('../utils/logger');

// GET /api/deals
exports.getDeals = async (req, res) => {
  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    const workspaceId = userRow?.workspace_id || null;

    const rows = workspaceId
      ? await dbAllAsync(
        `SELECT
           c.id as id,
           c.user_id,
           c.name,
           c.email,
           c.phone,
           c.company,
           c.job_title,
           c.scan_date,
           c.confidence,
           COALESCE(d.stage, c.deal_status, 'Prospect') as deal_status,
           COALESCE(d.value, 0) as deal_value,
           d.expected_close as deal_date,
           d.notes as deal_notes,
           u.name as scanner_name
         FROM contacts c
         JOIN users u ON c.user_id = u.id
         LEFT JOIN deals d ON d.contact_id = c.id
         WHERE u.workspace_id = ?
         ORDER BY c.scan_date DESC, c.id DESC`,
        [workspaceId]
      )
      : await dbAllAsync(
        `SELECT
           c.id as id,
           c.user_id,
           c.name,
           c.email,
           c.phone,
           c.company,
           c.job_title,
           c.scan_date,
           c.confidence,
           COALESCE(d.stage, c.deal_status, 'Prospect') as deal_status,
           COALESCE(d.value, 0) as deal_value,
           d.expected_close as deal_date,
           d.notes as deal_notes,
           u.name as scanner_name
         FROM contacts c
         JOIN users u ON c.user_id = u.id
         LEFT JOIN deals d ON d.contact_id = c.id
         WHERE c.user_id = ?
         ORDER BY c.scan_date DESC, c.id DESC`,
        [req.user.id]
      );

    res.json({ deals: rows || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/contacts/:id/deal
exports.updateDeal = async (req, res) => {
  const { stage, value, notes, expected_close } = req.body;
  const contactId = req.params.id;

  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    const workspaceId = userRow.workspace_id || req.user.id;

    await dbRunAsync(`
      INSERT INTO deals (contact_id, user_id, workspace_id, stage, value, notes, expected_close, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(contact_id) DO UPDATE SET
        stage = excluded.stage,
        value = excluded.value,
        notes = excluded.notes,
        expected_close = excluded.expected_close,
        updated_at = CURRENT_TIMESTAMP
    `, [contactId, req.user.id, workspaceId, stage, value || 0, notes || '', expected_close || null]);

    await dbRunAsync('UPDATE contacts SET deal_status = ? WHERE id = ?', [stage, contactId]);

    // Note: triggerWebhook implementation would need to be accessible, 
    // ideally from a shared utility or via an event emitter.
    // For now, we assume it's part of the global scope or will be modularized.
    if (global.triggerWebhook) {
        global.triggerWebhook(workspaceId, 'on_deal_update', { contactId, stage, value });
    }

    res.json({ success: true, message: 'Deal updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
