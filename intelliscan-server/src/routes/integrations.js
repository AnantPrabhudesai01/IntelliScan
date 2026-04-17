const express = require('express');
const router = express.Router();
const integrationsController = require('../controllers/integrationsController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/integrations
 * @desc    Get all active and configured integrations
 */
router.get('/', authenticateToken, integrationsController.getIntegrations);

/**
 * @route   POST /api/integrations
 * @desc    Save or update an integration configuration
 */
router.post('/', authenticateToken, integrationsController.saveIntegration);

/**
 * @route   DELETE /api/integrations/:appId
 * @desc    Remove an integration
 */
router.delete('/:appId', authenticateToken, integrationsController.removeIntegration);

module.exports = router;
