const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/analytics/dashboard
 * @desc Get real-time dashboard metrics including scan volume, demographics, and audit logs.
 * @access Private
 */
router.get('/dashboard', authenticateToken, analyticsController.getDashboardAnalytics);

/**
 * @route GET /api/analytics
 * @desc Alias for the main signals feed.
 */
router.get('/', authenticateToken, analyticsController.getSignalsList);

/**
 * @route GET /api/analytics/signals
 * @desc Get signal accuracy, alert counts, and conversation metrics.
 * @access Private
 */
router.get('/signals', authenticateToken, analyticsController.getSignalsStats);

module.exports = router;
