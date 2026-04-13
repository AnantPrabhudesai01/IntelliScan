const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticateToken } = require('../middleware/auth');

// Global search (contacts, events, campaigns)
router.get('/search/global', authenticateToken, searchController.globalSearch);

// Intent discovery signals
router.get('/signals', authenticateToken, searchController.getSignals);

module.exports = router;
