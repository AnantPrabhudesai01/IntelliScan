const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cardsController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../utils/imageUpload');

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
 * @route POST /api/cards/generate-logo
 * @desc Generate an AI branding logo.
 * @access Private
 */
router.post('/generate-logo', authenticateToken, cardsController.generateAiLogo);

/**
 * @route POST /api/cards/upload-logo
 * @desc Upload a custom branding logo.
 * @access Private
 */
router.post('/upload-logo', authenticateToken, upload.single('logo'), cardsController.uploadLogo);

module.exports = router;
