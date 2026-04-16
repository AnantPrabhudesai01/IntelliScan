const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { JWT_SECRET, JWT_EXPIRES_IN, PERSONAL_EMAIL_DOMAINS } = require('../config/constants');
const { dbRunAsync, dbGetAsync, dbAllAsync, sql } = require('../utils/db');
const { ensureQuotaRow } = require('../utils/quota');
const { logAuditEvent, AUDIT_SUCCESS, AUDIT_DENIED, AUDIT_ERROR } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');
const whatsappService = require('../services/whatsappService');
const { normalizePhone } = require('../utils/auth');

// In-memory OTP store: key = `${userId}_${type}`, value = { code, email, expiresAt }
const otpStore = new Map();

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
    const ipAddress = req.ip || 'Unknown IP';
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

  try {
    const email = authUser.email.toLowerCase();
    const name = authUser.name || authUser.nickname || email.split('@')[0];
    
    let existingUser = await dbGetAsync('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    let userId;
    let role = 'user';
    let tier = 'personal';
    let workspaceId = null;

    const domain = String(email || '').split('@')[1]?.toLowerCase();
    const isPersonal = PERSONAL_EMAIL_DOMAINS?.has?.(domain) ?? true;
    
    if (!isPersonal) {
      tier = 'enterprise';
      role = 'business_admin';
    }

    if (existingUser) {
      userId = existingUser.id;
      role = existingUser.role;
      tier = existingUser.tier;
      workspaceId = existingUser.workspace_id;
      await dbRunAsync('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    } else {
      const placeholderPass = crypto.randomBytes(24).toString('hex');
      const hashedPlaceholder = await bcrypt.hash(placeholderPass, 12);
      
      const result = await dbRunAsync(`
        INSERT INTO users (name, email, password, role, tier)
        VALUES (?, ?, ?, ?, ?)
      `, [name, email, hashedPlaceholder, role, tier]);
      
      userId = result.lastID;

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

    await ensureQuotaRow(userId, tier);

    // Ensure exactly one primary calendar exists (Deduplication Logic)
    const existingCals = await dbAllAsync('SELECT id FROM calendars WHERE user_id = ? AND is_primary = 1 ORDER BY id ASC', [userId]);
    if (existingCals.length === 0) {
      await dbRunAsync(
        'INSERT INTO calendars (user_id, name, color, is_primary, type) VALUES (?, ?, ?, ?, ?)',
        [userId, 'My Calendar', '#7b2fff', 1, 'personal']
      );
    } else if (existingCals.length > 1) {
      // Cleanup existing duplicates (keep only the oldest one)
      const idsToDelete = existingCals.slice(1).map(c => c.id);
      const placeholders = idsToDelete.map(() => '?').join(',');
      await dbRunAsync(`DELETE FROM calendars WHERE id IN (${placeholders})`, idsToDelete);
    }

    const token = jwt.sign(
      { id: userId, email, role, tier, workspace_id: workspaceId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { id: userId, email, name, role, tier, workspace_id: workspaceId }
    });
  } catch (err) {
    console.error('Auth Sync Error:', err);
    res.status(500).json({ error: 'Manual sync failed: ' + err.message });
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
 * @route POST /api/auth/request-otp
 */
router.post('/request-otp', authenticateToken, async (req, res) => {
  try {
    const { email, type, phone: requestedPhone } = req.body;
    
    // 1. Resolve target phone number
    // We prioritize looking up the user's registered phone, or use the one provided in the request
    const user = await dbGetAsync('SELECT phone_number FROM users WHERE id = ?', [req.user.id]);
    const targetPhone = normalizePhone(requestedPhone || user?.phone_number);

    if (!targetPhone) {
      return res.status(400).json({ 
        error: 'No WhatsApp number found. Please register your WhatsApp number in Settings first.' 
      });
    }

    // 2. Generate OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const key = `${req.user.id}_${type || 'email_change'}`;
    otpStore.set(key, { code, email, expiresAt: Date.now() + 10 * 60 * 1000 });

    // 3. Send via WhatsApp
    console.log(`[OTP] Sending WhatsApp code to ${targetPhone} for user ${req.user.id}`);
    
    try {
      await whatsappService.sendOTP(targetPhone, code);
    } catch (sendErr) {
      console.error('[OTP] WhatsApp delivery failed:', sendErr.message);
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
    const key = `${req.user.id}_${type || 'email_change'}`;
    const entry = otpStore.get(key);

    if (!entry) return res.status(400).json({ error: 'No OTP request found. Please request a new code.' });
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }
    if (entry.code !== String(code)) return res.status(400).json({ error: 'Invalid OTP code' });

    if (type === 'email_change' && entry.email) {
      await dbRunAsync('UPDATE users SET email = ? WHERE id = ?', [entry.email, req.user.id]);
    }
    otpStore.delete(key);

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
