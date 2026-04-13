const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const { dbGetAsync } = require('../utils/db');
const { resolveTierLimits } = require('../utils/quota');

/**
 * Middleware to authenticate requests via JWT
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // === AUTHENTICATION LOGIC ===

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

/**
 * Middleware to restrict access to Admins (Platform or Business)
 */
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  
  if (req.user.role !== 'admin' && req.user.role !== 'business_admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
}

/**
 * Middleware to restrict access to Enterprise/Business Admins
 */
function requireEnterpriseAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });

  if (req.user.role !== 'business_admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Enterprise Admin privileges required' });
  }
  next();
}

/**
 * Middleware to restrict access by Tier (e.g., 'pro', 'enterprise')
 */
function requireTier(tier) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    if (req.user.role === 'super_admin' || req.user.tier === 'enterprise') {
        return next();
    }

    if (req.user.tier !== tier) {
      return res.status(403).json({ error: `This feature requires ${tier} tier` });
    }
    next();
  };
}

/**
 * Builds an access profile with feature flags and limits based on role and tier
 */
function buildAccessProfile(role = 'user', tier = 'personal') {
  const normalizedRole = String(role || 'user').toLowerCase();
  const normalizedTier = String(tier || 'personal').toLowerCase();
  const limits = resolveTierLimits(normalizedTier);

  const featureFlags = {
    standard_scan: true,
    group_scan: true,
    batch_upload: true,
    contacts: true,
    events: true,
    ai_drafts: true,
    ai_coach: true,
    ai_sequences: true,
    meeting_presence: true,
    event_kiosk: true,
    digital_card: true,
    card_creator: true,
    apps: true,
    feedback: true,
    workspace_contacts: true,
    workspace_members: true,
    workspace_scanner_links: true,
    workspace_crm_mapping: true,
    workspace_routing_rules: true,
    workspace_data_policies: true,
    workspace_data_quality: true,
    workspace_campaigns: true,
    workspace_analytics: true,
    workspace_org_chart: true,
    workspace_billing: true,
    workspace_shared_rolodex: true,
    api_integrations: normalizedTier !== 'personal',
    admin_platform: normalizedRole === 'super_admin'
  };

  return {
    role: normalizedRole,
    tier: normalizedTier,
    limits: {
      single_scans_per_cycle: limits.single,
      group_scans_per_cycle: limits.group,
      batch_upload_limit: normalizedTier === 'enterprise' ? 100 : normalizedTier === 'pro' ? 50 : 10
    },
    feature_flags: featureFlags
  };
}

/**
 * Middleware to restrict access based on a specific feature flag
 */
function requireFeature(feature) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    // Keep this resilient even if user has stale token data
    const dbUser = await dbGetAsync('SELECT role, tier FROM users WHERE id = ?', [req.user.id]);
    const profile = buildAccessProfile(dbUser?.role || req.user.role || 'user', dbUser?.tier || req.user.tier || 'personal');

    if (!profile.feature_flags || !profile.feature_flags[feature]) {
      return res.status(403).json({ error: `Feature '${feature}' is not available for your plan` });
    }

    next();
  };
}

/**
 * Middleware to restrict access to Super Admins only
 */
function requireSuperAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin privileges required' });
  }
  next();
}

/**
 * Middleware to restrict access to Enterprise users or Admins
 */
function requireEnterpriseOrAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const isEnterprise = req.user.tier === 'enterprise' || req.user.tier === 'business';
  const isAdmin = req.user.role === 'super_admin' || req.user.role === 'business_admin' || req.user.role === 'admin';
  
  if (isEnterprise || isAdmin) {
    return next();
  }
  return res.status(403).json({ error: 'Enterprise or Administrative account required' });
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireEnterpriseAdmin,
  requireSuperAdmin,
  requireEnterpriseOrAdmin,
  requireTier,
  requireFeature,
  buildAccessProfile
};
