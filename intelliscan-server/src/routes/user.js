/**
 * User Routes — Quota, access control, profile, onboarding, simulate-upgrade
 */
const express = require('express');
const router = express.Router();
const { db, dbGetAsync, dbRunAsync, dbAllAsync } = require('../utils/db');
const { authenticateToken, buildAccessProfile } = require('../middleware/auth');
const { ensureQuotaRow, resolveTierLimits } = require('../utils/quota');
const { logAuditEvent } = require('../utils/logger');
const { uploadToImgbb, upload } = require('../utils/imageUpload');
const { AUDIT_SUCCESS, AUDIT_ERROR } = require('../config/constants');
const { normalizePhone } = require('../utils/auth');

// GET /api/user/quota
router.get('/quota', authenticateToken, async (req, res) => {
  try {
    const row = await dbGetAsync(
      `SELECT u.tier, q.used_count as used, q.limit_amount as "limit", q.group_scans_used
       FROM users u
       LEFT JOIN user_quotas q ON u.id = q.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    const currentTier = row?.tier || 'personal';
    await ensureQuotaRow(req.user.id, currentTier);
    
    // Fetch fresh data after potential promotion in ensureQuotaRow
    const quota = await dbGetAsync('SELECT used_count, limit_amount, group_scans_used FROM user_quotas WHERE user_id = ?', [req.user.id]);
    
    // Resolve the display tier based on actual limits in case of sync delays
    let displayTier = currentTier;
    if (quota?.limit_amount >= 100 && displayTier.toLowerCase() === 'personal') {
      displayTier = 'pro';
    } else if (quota?.limit_amount >= 99999) {
      displayTier = 'enterprise';
    }

    const limits = resolveTierLimits(displayTier);

    res.json({
      tier: displayTier,
      used: Number(quota?.used_count || 0),
      limit: Number(quota?.limit_amount || limits.single),
      group_scans_used: Number(quota?.group_scans_used || 0),
      group_scans_limit: Number(limits.group),
      tierMatch: (req.user.tier || '').toLowerCase() === displayTier.toLowerCase()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/access/me
router.get('/access/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGetAsync('SELECT role, tier FROM users WHERE id = ?', [req.user.id]);
    const profile = buildAccessProfile(user?.role || req.user.role || 'user', user?.tier || req.user.tier || 'personal');
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/access/matrix
router.get('/access/matrix', authenticateToken, (req, res) => {
  res.json({
    profiles: {
      free_personal_user: buildAccessProfile('user', 'personal'),
      pro_personal_user: buildAccessProfile('user', 'pro'),
      enterprise_user: buildAccessProfile('user', 'enterprise'),
      enterprise_admin: buildAccessProfile('business_admin', 'enterprise'),
      super_admin_user: buildAccessProfile('super_admin', 'enterprise')
    }
  });
});

// POST /api/user/simulate-upgrade
router.post('/simulate-upgrade', authenticateToken, async (req, res) => {
  const { plan = 'enterprise' } = req.body;
  const targetTier = plan === 'pro' ? 'pro' : 'enterprise';

  try {
    // 1. Update user tier
    await dbRunAsync('UPDATE users SET tier = ? WHERE id = ?', [targetTier, req.user.id]);
    
    // 2. Resolve limits
    const limits = resolveTierLimits(targetTier);
    
    // 3. Update quota row (Preserve used_count)
    const existing = await dbGetAsync('SELECT id FROM user_quotas WHERE user_id = ?', [req.user.id]);
    if (existing) {
      await dbRunAsync('UPDATE user_quotas SET limit_amount = ?, group_limit_amount = ? WHERE user_id = ?', [limits.single, limits.group, req.user.id]);
    } else {
      await dbRunAsync(
        'INSERT INTO user_quotas (user_id, used_count, limit_amount, group_scans_used, group_limit_amount, last_reset_date) VALUES (?, 0, ?, 0, ?, CURRENT_TIMESTAMP)',
        [req.user.id, limits.single, limits.group]
      );
    }

    console.log(`🚀 User ${req.user.id} upgraded to ${targetTier.toUpperCase()} via simulation.`);
    logAuditEvent(req, {
      action: 'ACCOUNT_TIER_UPDATE',
      resource: '/api/user/simulate-upgrade',
      status: AUDIT_SUCCESS,
      details: { target_tier: targetTier, targetLimit: limits.single }
    });
    res.json({ success: true, message: `Account upgraded to ${targetTier.toUpperCase()}! Please navigate to refresh your session.` });
  } catch (err) {
    logAuditEvent(req, {
      action: 'ACCOUNT_TIER_UPDATE',
      resource: '/api/user/simulate-upgrade',
      status: AUDIT_ERROR,
      details: { target_tier: targetTier, error: err.message }
    });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await dbGetAsync('SELECT id, name, email, role, tier, avatar_url, phone_number, bio FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone_number, bio } = req.body;
    const cleanPhone = normalizePhone(phone_number);
    await dbRunAsync('UPDATE users SET name = ?, phone_number = ?, bio = ? WHERE id = ?', [name, cleanPhone, bio, req.user.id]);
    res.json({ success: true, message: 'Profile updated', phone_number: cleanPhone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile/avatar-library
router.get('/profile/avatar-library', authenticateToken, (req, res) => {
  res.json([
    { id: 1, url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix' },
    { id: 2, url: 'https://api.dicebear.com/7.x/micah/svg?seed=Midnight' },
    { id: 3, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot' },
    { id: 4, url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Destiny' },
    { id: 5, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' }
  ]);
});

// POST /api/profile/set-avatar
router.post('/profile/set-avatar', authenticateToken, async (req, res) => {
  const { avatarUrl } = req.body;
  if (!avatarUrl) return res.status(400).json({ error: 'avatarUrl is required' });
  try {
    await dbRunAsync('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, req.user.id]);
    res.json({ success: true, avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profile/generate-ai
router.post('/profile/generate-ai', authenticateToken, (req, res) => {
  const { prompt } = req.body;
  const seed = prompt ? encodeURIComponent(prompt) : Math.random().toString();
  const imageUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
  res.json({ imageUrl, success: true });
});

// POST /api/profile/upload
router.post('/profile/upload', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const base64Data = req.file.buffer.toString('base64');
    const permanentUrl = await uploadToImgbb(base64Data);
    await dbRunAsync('UPDATE users SET avatar_url = ? WHERE id = ?', [permanentUrl, req.user.id]);
    res.json({ success: true, avatarUrl: permanentUrl });
  } catch (error) {
    console.error('[ImgBB Error]', error.message);
    res.status(500).json({ error: 'Failed to securely host image: ' + error.message });
  }
});

// POST /api/onboarding
router.post('/onboarding', authenticateToken, (req, res) => {
  const { jobTitle, companyName, crm, teamSize, useCases } = req.body;
  const payload = JSON.stringify({ jobTitle, companyName, crm, teamSize, useCases });

  db.run(
    'INSERT INTO onboarding_prefs (user_id, preferences_json) VALUES (?, ?) ON CONFLICT (user_id) DO UPDATE SET preferences_json = EXCLUDED.preferences_json',
    [req.user.id, payload],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      console.log(`✅ Onboarding preferences saved for user ${req.user.id}`);
      res.json({ success: true, message: 'Onboarding complete!' });
    }
  );
});

// GET /api/sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await dbAllAsync(
      'SELECT id, device_info, ip_address, location, is_active, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(sessions || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sessions/:id
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    await dbRunAsync('UPDATE sessions SET is_active = 0 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Session terminated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
