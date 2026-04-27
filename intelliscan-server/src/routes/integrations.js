const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const integrationsController = require('../controllers/integrationsController');

// All integration routes are protected
router.use(authenticateToken);

/**
 * @route GET /api/integrations
 * @desc Get all active integrations for the current user
 */
router.get('/', integrationsController.getIntegrations);

/**
 * @route POST /api/integrations
 * @desc Create or update an integration
 */
router.post('/', integrationsController.saveIntegration);

module.exports = router;
