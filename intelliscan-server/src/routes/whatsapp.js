const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Twilio calls this when a user sends a message to the bot
router.post('/webhook', whatsappController.webhook);

// Diagnostic Health Check
router.get('/health', whatsappController.checkHealth);

module.exports = router;
