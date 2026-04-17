const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { JWT_SECRET, JWT_EXPIRES_IN, PERSONAL_EMAIL_DOMAINS } = require('../config/constants');
const { dbRunAsync, dbGetAsync, dbAllAsync, sql, isPostgres } = require('../utils/db');
const { ensureQuotaRow } = require('../utils/quota');
const { logAuditEvent, AUDIT_SUCCESS, AUDIT_DENIED, AUDIT_ERROR } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');
const whatsappService = require('../services/whatsappService');
const { normalizePhone } = require('../utils/auth');

// OTP storage is now database-backed via otp_codes table for serverless stability.

// --- SCHEMAS ---

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Valid email required').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['user', 'admin', 'business_admin', 'super_admin']).optional().default('user')
});

const loginSchema = z.object({
  email: z.string().trim().email('Valid email required').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

const syncSchema = z.object({
  user: z.object({
    email: z.string().email(),
    name: z.string().optional(),
    nickname: z.string().optional()
  }),
  token: z.string().optional()
});

// --- ROUTES ---

/**
 * @route POST /api/auth/register
 */
router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role || 'user';

    const insertSql = "INSERT INTO users (name, email, password, role, tier) VALUES (?, ?, ?, ?, 'personal')";

    try {
      const result = await dbRunAsync(insertSql, [name, email, hashedPassword, userRole]);
      const userId = result.lastID;

      await ensureQuotaRow(userId, 'personal');
      
      // Ensure exactly one primary calendar exists
      const existingCals = await dbAllAsync('SELECT id FROM calendars WHERE user_id = ? AND is_primary = 1 ORDER BY id ASC', [userId]);
      if (existingCals.length === 0) {
        await dbRunAsync(
          'INSERT INTO calendars (user_id, name, color, is_primary, type) VALUES (?, ?, ?, ?, ?)',
          [userId, 'My Calendar', '#7b2fff', 1, 'personal']
        );
      } else if (existingCals.length > 1) {
        // Cleanup duplicates if they exist (keep only the first one)
        const idsToDelete = existingCals.slice(1).map(c => c.id);
        const placeholders = idsToDelete.map(() => '?').join(',');
        await dbRunAsync(`DELETE FROM calendars WHERE id IN (${placeholders})`, idsToDelete);
      }

      const token = jwt.sign(
        { id: userId, email, name, role: userRole, tier: 'personal' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Session tracking (fail-safe)
      try {
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'Unknown IP';
        await dbRunAsync(
          'INSERT INTO sessions (user_id, token, device_info, ip_address, location, is_active) VALUES (?, ?, ?, ?, ?, 1)',
          [userId, token, deviceInfo, ipAddress, 'Unknown Location']
        );
      } catch (sessionErr) {
        console.warn('[Register] Session tracking failed (non-critical):', sessionErr.message);
      }

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: userId, name, email, role: userRole, tier: 'personal' }
      });

      logAuditEvent(req, {
        action: 'USER_REGISTER',
        resource: '/api/auth/register',
        status: AUDIT_SUCCESS,
        actorUserId: userId,
        actorEmail: email,
        actorRole: userRole,
        details: { tier: 'personal' }
      });

    } catch (err) {
      if (err.message.includes('UNIQUE') || err.message.includes('already exists')) {
        logAuditEvent(req, {
          action: 'USER_REGISTER',
          resource: '/api/auth/register',
          status: AUDIT_DENIED,
          actorEmail: email,
          actorRole: userRole,
          details: { reason: 'email_exists' }
        });
        return res.status(400).json({ error: 'Email already exists' });
      }
      throw err;
    }
  } catch (error) {
    logAuditEvent(req, {
      action: 'USER_REGISTER',
      resource: '/api/auth/register',
      status: AUDIT_ERROR,
      actorEmail: email,
      actorRole: role || 'user',
      details: { server_error: error.message }
    });
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

/**
 * @route POST /api/auth/login
 */
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await dbGetAsync('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      logAuditEvent(req, {
        action: 'USER_LOGIN',
        resource: '/api/auth/login',
        status: AUDIT_DENIED,
        actorEmail: email,
        details: { reason: 'user_not_found' }
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logAuditEvent(req, {
        action: 'USER_LOGIN',
        resource: '/api/auth/login',
        status: AUDIT_DENIED,
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        details: { reason: 'invalid_password' }
      });
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, tier: user.tier || 'personal' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Session tracking
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'Unknown IP';
    const location = 'Unknown Location';

    try {
      await dbRunAsync(
        'INSERT INTO sessions (user_id, token, device_info, ip_address, location, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [user.id, token, deviceInfo, ipAddress, location]
      );
      await ensureQuotaRow(user.id, user.tier || 'personal');
    } catch (sessionErr) {
      console.error('Session/Quota bootstrap failed on login:', sessionErr.message);
    }

    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, tier: user.tier || 'personal' }
    });

    logAuditEvent(req, {
      action: 'USER_LOGIN',
      resource: '/api/auth/login',
      status: AUDIT_SUCCESS,
      actorUserId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      details: { session_created: true, tier: user.tier || 'personal' }
    });

  } catch (err) {
    logAuditEvent(req, {
      action: 'USER_LOGIN',
      resource: '/api/auth/login',
      status: AUDIT_ERROR,
      actorEmail: email,
      details: { server_error: err.message }
    });
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

/**
 * @route GET /api/auth/google
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @route GET /api/auth/google/callback
 */
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/sign-in?auth_error=google_failed', session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, tier: user.tier || 'personal' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Session tracking (fail-safe)
      try {
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'Unknown IP';
        await dbRunAsync(
          'INSERT INTO sessions (user_id, token, device_info, ip_address, location, is_active) VALUES (?, ?, ?, ?, ?, 1)',
          [user.id, token, deviceInfo, ipAddress, 'Unknown Location']
        );
      } catch (sessionErr) {
        console.warn('[GoogleSSO] Session tracking failed (non-critical):', sessionErr.message);
      }

      logAuditEvent(req, {
        action: 'USER_LOGIN_SSO_GOOGLE',
        resource: '/api/auth/google/callback',
        status: AUDIT_SUCCESS,
        actorUserId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        details: { sso_provider: 'google' }
      });

      const frontendUrl = process.env.APP_PUBLIC_URL || process.env.CLIENT_ORIGIN || 'https://intelliscan.vercel.app';
      const userJson = encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier || 'personal',
        workspace_id: user.workspace_id
      }));

      res.redirect(`${frontendUrl}/sso-callback?token=${token}&user=${userJson}`);
    } catch (err) {
      console.error('Google Callback Error:', err);
      res.redirect('/sign-in?auth_error=server_error');
    }
  }
);

/**
 * @route POST /api/auth/sync
 * @desc Sync an external Auth0 session with the local database
 */
router.post('/sync', validate(syncSchema), async (req, res) => {
  const { user: authUser } = req.body;

  // 🛡️ JSON Enforcement & Soft Timeout (prevents non-JSON 500s on Vercel)
  const syncTimeout = setTimeout(() => {
    if (!res.headersSent) {
      console.warn(`[Sync] Timeout reached for ${authUser?.email}. Sending fail-safe JSON.`);
      res.status(504).json({ 
        error: 'Sync Timeout', 
        message: 'The identity synchronization is taking longer than expected. Please refresh and try again.' 
      });
    }
  }, 18000); // 18s (Vercel limit is 20s)

  try {
    if (!authUser || !authUser.email) {
      clearTimeout(syncTimeout);
      return res.status(400).json({ error: 'Auth0 profile missing target email for synchronization.' });
    }

    const email = authUser.email.toLowerCase().trim();
    const name = authUser.name || authUser.nickname || email.split('@')[0] || 'IntelliScan User';
    
    let existingUser = await dbGetAsync('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    let userId;
    let role = 'user';
    let tier = 'personal';
    let workspaceId = null;

    // Robust Domain Intelligence
    const domain = String(email).split('@')[1]?.toLowerCase();
    const personalDomains = PERSONAL_EMAIL_DOMAINS instanceof Set ? PERSONAL_EMAIL_DOMAINS : new Set();
    const isPersonal = personalDomains.has(domain);
    
    if (!isPersonal && domain) {
      tier = 'enterprise';
      role = 'business_admin';
    }

    if (existingUser) {
      userId = existingUser.id;
      role = existingUser.role;
      tier = existingUser.tier;
      workspaceId = existingUser.workspace_id;
      
      // Keep name synchronized if it changed in Auth0
      if (name !== existingUser.name) {
        await dbRunAsync('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
      }
    } else {
      // 1. Provision User
      const placeholderPass = crypto.randomBytes(32).toString('hex');
      const hashedPlaceholder = await bcrypt.hash(placeholderPass, 12);
      
      const userRes = await dbRunAsync(`
        INSERT INTO users (name, email, password, role, tier)
        VALUES (?, ?, ?, ?, ?)
      `, [name, email, hashedPlaceholder, role, tier]);
      
      userId = userRes.lastID;

      // 2. Provision Enterprise Workspace
      if (tier === 'enterprise') {
        const wsName = `${name.split(' ')[0]}'s Organization`;
        const wsRes = await dbRunAsync(`
          INSERT INTO workspaces (name, owner_id, created_at) 
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `, [wsName, userId]);
        
        workspaceId = wsRes.lastID;
        await dbRunAsync('UPDATE users SET workspace_id = ? WHERE id = ?', [workspaceId, userId]);
      }
    }

    // 3. Infrastructure Bootstrap (Self-Healing)
    await ensureQuotaRow(userId, tier);

    // Bootstrap Primary Calendar
    const existingCals = await dbAllAsync('SELECT id FROM calendars WHERE user_id = ? AND is_primary = 1', [userId]);
    if (existingCals.length === 0) {
      await dbRunAsync(
        'INSERT INTO calendars (user_id, name, color, is_primary) VALUES (?, ?, ?, ?)',
        [userId, 'My Calendar', '#7b2fff', 1]
      );
    }

    // 4. Identity Generation
    const token = jwt.sign(
      { id: userId, email, role, tier, workspace_id: workspaceId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 5. Session tracking (Non-blocking safety)
    try {
      const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
      const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'Unknown IP';
      await dbRunAsync(
        'INSERT INTO sessions (user_id, token, device_info, ip_address, location, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [userId, token, deviceInfo, ipAddress, 'Unknown Location']
      );
    } catch (sessionErr) {
      console.warn('[Sync] Session tracking failed (non-critical):', sessionErr.message);
    }

    console.log(`[AuthSync] Successfully synchronized ${email} (${tier})`);

    clearTimeout(syncTimeout);
    if (!res.headersSent) {
      res.json({
        token,
        user: { id: userId, email, name, role, tier, workspace_id: workspaceId }
      });
    }

  } catch (err) {
    clearTimeout(syncTimeout);
    console.error('[AuthSync Error] Critical Identity Failure:', err.message, err.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Identity synchronization failed.', 
        message: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined 
      });
    }
  }
});

/**
 * @route GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGetAsync(
      'SELECT id, name, email, role, tier, workspace_id, avatar_url, phone_number, bio FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/auth/sessions/me
 * @desc Get all active sessions for the current user
 */
router.get('/sessions/me', authenticateToken, async (req, res) => {
  try {
    const sessions = await dbAllAsync(
      'SELECT id, device_info, ip_address, location, last_active, token FROM sessions WHERE user_id = ? AND is_active = 1 ORDER BY last_active DESC',
      [req.user.id]
    );

    const currentToken = req.headers.authorization?.split(' ')[1];

    const result = sessions.map(s => ({
      id: s.id,
      device_info: s.device_info,
      ip_address: s.ip_address,
      location: s.location || 'Unknown Location',
      last_active: s.last_active,
      isCurrent: s.token === currentToken
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route DELETE /api/auth/sessions/:id
 * @desc Revoke a specific session
 */
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'others') {
      const currentToken = req.headers.authorization?.split(' ')[1];
      await dbRunAsync('DELETE FROM sessions WHERE user_id = ? AND token != ?', [req.user.id, currentToken]);
      return res.json({ success: true, message: 'All other sessions revoked' });
    }

    await dbRunAsync('DELETE FROM sessions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true, message: 'Session revoked' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/auth/request-otp
 */
router.post('/request-otp', authenticateToken, async (req, res) => {
  try {
    const { email, type, phone: requestedPhone } = req.body;
    
    // 1. Resolve target phone number
    // Mode 'unlock' strictly sends to the CURRENT number in DB for identity check
    const user = await dbGetAsync('SELECT phone_number FROM users WHERE id = ?', [req.user.id]);
    const targetPhone = normalizePhone(type === 'unlock_phone' ? user?.phone_number : (requestedPhone || user?.phone_number));

    if (type === 'unlock_phone' && !user?.phone_number) {
       return res.status(400).json({ error: 'No verified phone number found to unlock.' });
    }

    if (!targetPhone) {
      return res.status(400).json({ 
        error: 'No WhatsApp number found. Please register your WhatsApp number in Settings first.' 
      });
    }

    // 2. Generate OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const metaData = JSON.stringify({ email, phone: targetPhone });

    // Store in DB (Persistent for serverless)
    const otpType = type || 'email_change';
    await dbRunAsync(`
      INSERT INTO otp_codes (user_id, type, code, meta_data, expires_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (user_id, type) DO UPDATE SET
        code = EXCLUDED.code,
        meta_data = EXCLUDED.meta_data,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW()
    `, [req.user.id, otpType, code, metaData, expiresAt]);

    // 3. Send via WhatsApp
    console.log(`[OTP] Sending WhatsApp code to ${targetPhone} for user ${req.user.id}`);
    
    try {
      const msg = await whatsappService.sendOTP(targetPhone, code);
      console.log(`[AUTH] OTP sent successfully to ${targetPhone} via SID ${msg.sid}. Code: ${code} (${type})`);
    } catch (sendErr) {
      console.error('[OTP] WhatsApp delivery failed to', targetPhone, ':', sendErr.message);
      return res.status(500).json({ error: 'Failed to send WhatsApp message. Please check your number.' });
    }

    const response = { 
      success: true, 
      message: 'OTP sent to your WhatsApp number' 
    };

    // Only include debug_code in development
    if (process.env.NODE_ENV !== 'production') {
      response.debug_code = code;
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/auth/verify-otp
 */
router.post('/verify-otp', authenticateToken, async (req, res) => {
  try {
    const { code, type } = req.body;
    const otpType = type || 'email_change';

    // Fetch from DB
    const entry = await dbGetAsync(
      'SELECT * FROM otp_codes WHERE user_id = ? AND type = ?', 
      [req.user.id, otpType]
    );

    if (!entry) return res.status(400).json({ error: 'No OTP request found. Please request a new code.' });
    
    // Check Expiration (Postgres returns TIMESTAMPTZ as Date object or ISO string depending on driver)
    const expiry = new Date(entry.expires_at).getTime();
    if (Date.now() > expiry) {
      await dbRunAsync('DELETE FROM otp_codes WHERE id = ?', [entry.id]);
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }
    
    if (entry.code !== String(code)) return res.status(400).json({ error: 'Invalid OTP code' });

    // Meta data parsing
    const meta = typeof entry.meta_data === 'string' ? JSON.parse(entry.meta_data) : entry.meta_data;

    if (otpType === 'email_change' && meta?.email) {
      await dbRunAsync('UPDATE users SET email = ? WHERE id = ?', [meta.email, req.user.id]);
    }
    if (otpType === 'phone_change' && meta?.phone) {
      await dbRunAsync('UPDATE users SET phone_number = ? WHERE id = ?', [meta.phone, req.user.id]);
    }
    
    // Cleanup
    await dbRunAsync('DELETE FROM otp_codes WHERE id = ?', [entry.id]);

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/auth/whatsapp/discovery
 * Checks if a Discovery Code has been claimed by a phone number in the last 10 minutes
 */
router.post('/whatsapp/discovery', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Discovery code is required' });

    const discovery = await dbGetAsync(
      'SELECT phone_number FROM whatsapp_discoveries WHERE discovery_code = ? AND created_at > NOW() - INTERVAL \'10 minutes\'',
      [code.toUpperCase()]
    );

    if (!discovery) {
      return res.status(404).json({ error: 'No discovery found yet. Please send the WhatsApp message.' });
    }

    res.json({ success: true, phone_number: discovery.phone_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
