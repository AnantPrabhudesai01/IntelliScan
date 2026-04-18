const express = require('express');
const router = express.Router();
const crypto = require('crypto');
// Keep dependencies consistent with the rest of the server (bcryptjs is installed).
const bcrypt = require('bcryptjs');
const { db, dbGetAsync, dbRunAsync, dbAllAsync } = require('../utils/db');
const { logAuditEvent } = require('../utils/logger');
const { authenticateToken, requireEnterpriseAdmin } = require('../middleware/auth');
const { createSmtpTransporterFromEnv, testSmtpConnection } = require('../utils/smtp');
const contactsController = require('../controllers/contactsController');

const AUDIT_SUCCESS = 'SUCCESS';

async function getScopeForUser(userId) {
  const user = await dbGetAsync('SELECT workspace_id, id FROM users WHERE id = ?', [userId]);
  const scopeWorkspaceId = user?.workspace_id || user?.id;
  return { scopeWorkspaceId };
}

const policyUtils = require('../utils/policyUtils');

// Workspace Analytics (Bridge)
router.get('/analytics', authenticateToken, contactsController.getWorkspaceAnalytics);

// Shared Rolodex Contacts
router.get('/contacts', authenticateToken, contactsController.getWorkspaceContacts);

// Data Quality / Duplicates (Bridge) - Redirected from contacts/workspace/duplicates
router.get('/contacts/duplicates', authenticateToken, contactsController.getDuplicates);

// Org Chart (Bridge)
router.get('/org-chart/:company', authenticateToken, contactsController.getOrgChart);

// Data Compliance Policies
router.get('/data-policies', authenticateToken, async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const policies = await policyUtils.getPoliciesForScope(scopeWorkspaceId);
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/data-policies', authenticateToken, async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const { retention_days, pii_redaction_enabled, strict_audit_storage_enabled } = req.body;
    
    await dbRunAsync(
      `INSERT INTO workspace_policies (workspace_id, retention_days, pii_redaction_enabled, strict_audit_storage_enabled)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(workspace_id) DO UPDATE SET
         retention_days = excluded.retention_days,
         pii_redaction_enabled = excluded.pii_redaction_enabled,
         strict_audit_storage_enabled = excluded.strict_audit_storage_enabled,
         updated_at = CURRENT_TIMESTAMP`,
      [scopeWorkspaceId, retention_days || 90, pii_redaction_enabled ? 1 : 0, strict_audit_storage_enabled ? 1 : 0]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workspace/members - List all members in the current user's workspace
router.get('/members', authenticateToken, (req, res) => {
  db.get('SELECT workspace_id, id FROM users WHERE id = ?', [req.user.id], (err, userRow) => {
    if (err) return res.status(500).json({ error: err.message });
    const workspaceId = (userRow && userRow.workspace_id) || userRow.id;
    db.all(
      'SELECT id, name, email, role, tier FROM users WHERE workspace_id = ? ORDER BY name ASC',
      [workspaceId],
      (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(rows);
      }
    );
  });
});

// POST /api/workspace/members/invite - Invite a new member (Legacy Simulation with auto-init)
router.post('/members/invite', authenticateToken, requireEnterpriseAdmin, async (req, res) => {
  const { email, name, role = 'user' } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'Email and Name are required' });

  try {
    const adminUser = await dbGetAsync('SELECT workspace_id, email FROM users WHERE id = ?', [req.user.id]);
    let workspaceId = adminUser?.workspace_id;

    if (!workspaceId) {
      workspaceId = `ws_${crypto.randomBytes(4).toString('hex')}`;
      await dbRunAsync('UPDATE users SET workspace_id = ?, role = ? WHERE id = ?', 
        [workspaceId, 'business_admin', req.user.id]);
    }

    const existingUser = await dbGetAsync('SELECT id, workspace_id FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
      if (existingUser.workspace_id === workspaceId) {
        return res.status(400).json({ error: 'User is already a member of this workspace' });
      }
      if (existingUser.workspace_id) {
        return res.status(400).json({ error: 'User already belongs to another organization.' });
      }
      await dbRunAsync('UPDATE users SET workspace_id = ?, role = ?, tier = ? WHERE id = ?', 
        [workspaceId, role, 'enterprise', existingUser.id]);
    } else {
      const randomPass = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPass, 10);
      await dbRunAsync(
        'INSERT INTO users (name, email, password, role, workspace_id, tier) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role, workspaceId, 'enterprise']
      );
    }

    logAuditEvent(req, {
      action: 'TEAM_MEMBER_INVITE',
      resource: '/api/workspace/members/invite',
      status: AUDIT_SUCCESS,
      details: { invited_email: email, role, workspace_id: workspaceId }
    });

    res.json({ success: true, message: `Successfully invited ${name} (${email}) to your organization.` });
  } catch (error) {
    console.error('Invitation Error:', error);
    res.status(500).json({ error: 'Invitation system failed. Please try again later.' });
  }
});

// POST /api/workspaces/:id/invitations - Send official email invitation
router.post('/:id/invitations', authenticateToken, requireEnterpriseAdmin, async (req, res) => {
  const { email, role = 'member' } = req.body;
  const workspace_id = req.params.id;

  try {
    const existingUser = await dbGetAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      const membership = await dbGetAsync('SELECT 1 FROM users WHERE id = ? AND workspace_id = ?', [existingUser.id, workspace_id]);
      if (membership) return res.status(400).json({ error: 'User is already a member of this workspace' });
    }

    const existingInv = await dbGetAsync('SELECT 1 FROM workspace_invitations WHERE workspace_id = ? AND email = ? AND status = "pending"', [workspace_id, email]);
    if (existingInv) return res.status(400).json({ error: 'An invitation is already pending for this email' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await dbRunAsync(
      'INSERT INTO workspace_invitations (workspace_id, email, role, token, expires_at, invited_by) VALUES (?, ?, ?, ?, ?, ?)',
      [workspace_id, email, role, token, expires_at, req.user.id]
    );

    const smtp = createSmtpTransporterFromEnv();
    if (smtp) {
      const inviteUrl = `${req.protocol}://${req.get('host').replace(':5000', ':3000')}/accept-invitation?token=${token}`;
      try {
        await smtp.transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || 'IntelliScan'}" <${smtp.from}>`,
          to: email,
          subject: 'You have been invited to join a workspace on IntelliScan',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <div style="background: #4f46e5; padding: 20px; color: white;">
                <h2 style="margin: 0;">Workspace Invitation</h2>
              </div>
              <div style="padding: 24px;">
                <p>Hello,</p>
                <p>You have been invited to join an enterprise workspace on <strong>IntelliScan</strong> as a <strong>${role}</strong>.</p>
                <p>Click the button below to accept the invitation and set up your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
                </div>
                <p style="color: #64748b; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #64748b; font-size: 12px; word-break: break-all;">${inviteUrl}</p>
                <p style="margin-top: 24px;">Best regards,<br>The IntelliScan Team</p>
              </div>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('Failed to send invitation email:', mailErr);
      }
    }

    logAuditEvent(req, {
      action: 'SEND_INVITATION',
      resource: 'WORKSPACE',
      status: 'SUCCESS',
      details: { workspace_id, invited_email: email, role }
    });

    res.json({ message: 'Invitation sent successfully', token });
  } catch (err) {
    console.error('Invitation Error:', err);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// GET /api/workspaces/:id/invitations - List invitations for a workspace
router.get('/:id/invitations', authenticateToken, async (req, res) => {
  try {
    const invitations = await dbAllAsync('SELECT * FROM workspace_invitations WHERE workspace_id = ?', [req.params.id]);
    res.json(invitations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// POST /api/workspaces/invitations/:token/accept - Accept an invitation
router.post('/invitations/:token/accept', authenticateToken, async (req, res) => {
  const { token } = req.params;
  try {
    const invitation = await dbGetAsync('SELECT * FROM workspace_invitations WHERE token = ? AND status = "pending"', [token]);
    if (!invitation) return res.status(404).json({ error: 'Invalid or expired invitation' });

    if (new Date(invitation.expires_at) < new Date()) {
      await dbRunAsync('UPDATE workspace_invitations SET status = "expired" WHERE id = ?', [invitation.id]);
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    await dbRunAsync('UPDATE users SET workspace_id = ?, role = ? WHERE id = ?', [invitation.workspace_id, invitation.role, req.user.id]);
    await dbRunAsync('UPDATE workspace_invitations SET status = "accepted" WHERE id = ?', [invitation.id]);

    logAuditEvent(req, {
      action: 'ACCEPT_INVITATION',
      resource: 'WORKSPACE',
      status: 'SUCCESS',
      details: { workspace_id: invitation.workspace_id }
    });
    res.json({ message: 'Invitation accepted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// DELETE /api/workspace/members/:id - Remove a member
router.delete('/members/:id', authenticateToken, requireEnterpriseAdmin, async (req, res) => {
  const targetUserId = req.params.id;
  if (targetUserId == req.user.id) {
    return res.status(400).json({ error: 'You cannot remove yourself from the workspace' });
  }

  try {
    const adminUser = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    const targetUser = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [targetUserId]);

    if (!targetUser || targetUser.workspace_id !== adminUser.workspace_id) {
      return res.status(403).json({ error: 'User not found in your workspace' });
    }

    await dbRunAsync('UPDATE users SET workspace_id = NULL, role = "user", tier = "personal" WHERE id = ?', [targetUserId]);
    
    logAuditEvent(req, {
      action: 'REMOVE_MEMBER',
      resource: 'WORKSPACE',
      status: 'SUCCESS',
      details: { removed_user_id: targetUserId, workspace_id: adminUser.workspace_id }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Workspace Settings (Branding, SMTP, etc.)
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const workspace = await dbGetAsync('SELECT * FROM workspaces WHERE id = ?', [scopeWorkspaceId]);
    
    if (!workspace) {
      // Auto-init workspace if missing (same as invite logic)
      return res.json({ name: 'My Workspace', settings: {} });
    }

    const settings = typeof workspace.settings_json === 'string' 
      ? JSON.parse(workspace.settings_json || '{}') 
      : (workspace.settings_json || {});

    // Redact SMTP password
    if (settings.smtp && settings.smtp.pass) {
      settings.smtp.pass = '********';
    }

    res.json({
      id: workspace.id,
      name: workspace.name,
      logo_url: workspace.logo_url,
      settings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings/smtp', authenticateToken, async (req, res) => {
  try {
    const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
    const { host, port, user, pass, from_email, from_name } = req.body;

    // ── AUTO-INIT: If this is a personal user without a workspace row, create it now
    const workspace = await dbGetAsync('SELECT id FROM workspaces WHERE id = ?', [scopeWorkspaceId]);
    
    if (!workspace) {
      console.log(`[Workspace] Initializing personal workspace for user ${req.user.id}`);
      await dbRunAsync(
        'INSERT INTO workspaces (id, name, owner_id, settings_json) VALUES (?, ?, ?, ?)',
        [scopeWorkspaceId, `${req.user.name || 'Personal'} Workspace`, req.user.id, '{}']
      );
    }
    let settings = typeof workspace?.settings_json === 'string' 
      ? JSON.parse(workspace?.settings_json || '{}') 
      : (workspace?.settings_json || {});

    // Handle password redaction on update
    let finalPass = pass;
    if (pass === '********' && settings.smtp?.pass) {
      finalPass = settings.smtp.pass;
    }

    settings.smtp = { host, port, user, pass: finalPass, from_email, from_name };

    await dbRunAsync(
      'UPDATE workspaces SET settings_json = ? WHERE id = ?',
      [JSON.stringify(settings), scopeWorkspaceId]
    );

    logAuditEvent(req, {
      action: 'UPDATE_SMTP_SETTINGS',
      resource: 'WORKSPACE',
      status: 'SUCCESS',
      details: { workspace_id: scopeWorkspaceId }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings/smtp/test', authenticateToken, async (req, res) => {
  try {
    const { host, port, user, pass, from_email } = req.body;
    
    // Resolve password if hidden
    let finalPass = pass;
    if (pass === '********') {
      const { scopeWorkspaceId } = await getScopeForUser(req.user.id);
      const ws = await dbGetAsync('SELECT settings_json FROM workspaces WHERE id = ?', [scopeWorkspaceId]);
      const settings = JSON.parse(ws?.settings_json || '{}');
      finalPass = settings.smtp?.pass;
    }

    await testSmtpConnection({ host, port, user, pass: finalPass });
    res.json({ success: true, message: 'SMTP credentials verified successfully!' });
  } catch (err) {
    res.status(400).json({ error: `Connection failed: ${err.message}` });
  }
});

module.exports = router;
