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
router.get('/stats', analyticsController.getPublicStats); // Public Transparency Gateway

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

/**
 * @route POST /api/analytics/log
 * @desc Log user activity (clicks, session duration, etc.) for performance monitoring.
 * @access Public (Safe for anonymous tracking)
 */
router.post('/log', analyticsController.logActivity);

/**
 * @route GET /api/engine/stats
 * @desc Get real-time engine health, throughput, and active crawler nodes.
 * @access Private
 */
router.get('/engine/stats', authenticateToken, analyticsController.getEngineStats);

module.exports = router;
