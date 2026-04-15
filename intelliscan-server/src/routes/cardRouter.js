const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { authenticateToken } = require('../middleware/auth');

// Note: Mounted at /api/cards in index.js
router.get('/my', authenticateToken, cardController.getMyCard); // Internal helper
router.post('/save', authenticateToken, cardController.saveCard);
router.post('/generate-design', authenticateToken, cardController.generateDesign);

module.exports = router;
