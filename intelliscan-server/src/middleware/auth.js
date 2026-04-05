const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

/**
 * Middleware to authenticate requests via JWT
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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

module.exports = {
  authenticateToken,
  requireAdmin,
  requireEnterpriseAdmin,
  requireTier
};
