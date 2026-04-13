const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { authenticateToken } = require('../middleware/auth');

// Webhook Management Routes
router.get('/', authenticateToken, webhookController.getWebhooks);
router.post('/', authenticateToken, webhookController.registerWebhook);
router.delete('/:id', authenticateToken, webhookController.deleteWebhook);

module.exports = router;
