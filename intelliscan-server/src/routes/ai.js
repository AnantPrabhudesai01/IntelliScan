const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// Contact Enrichment Route
router.post('/enrich/:id', authenticateToken, aiController.enrichContact);

// Semantic Search Route
router.get('/semantic-search', authenticateToken, aiController.semanticSearch);

// Time Suggestion Route
router.post('/suggest-time/:id', authenticateToken, aiController.suggestTime);

// Rich Description Route
router.post('/describe/:id', authenticateToken, aiController.generateDescription);

// AI Support Chat Route (Public / Semi-auth)
router.post('/chat/support', aiController.supportChat);

module.exports = router;
