const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Twilio calls this when a user sends a message to the bot
router.post('/webhook', whatsappController.handleIncomingMessage);

module.exports = router;
