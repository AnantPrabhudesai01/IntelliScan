const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cardsController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/my-card
 * @desc Get the current user's digital business card design.
 * @access Private
 */
router.get('/my-card', authenticateToken, cardsController.getMyCard);

/**
 * @route POST /api/cards/save
 * @desc Save or update digital business card identity.
 * @access Private
 */
router.post('/save', authenticateToken, cardsController.saveCard);

/**
 * @route POST /api/cards/generate-design
 * @desc Generate a premium design using Gemini AI.
 * @access Private
 */
router.post('/generate-design', authenticateToken, cardsController.generateAiDesign);

module.exports = router;
