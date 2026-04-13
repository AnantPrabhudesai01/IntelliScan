const express = require('express');
const router = express.Router();
const dealsController = require('../controllers/dealsController');
const { authenticateToken } = require('../middleware/auth');

// Deals Pipeline Route
router.get('/', authenticateToken, dealsController.getDeals);

// Deal Update Route (mounted under /api/contacts/:id/deal or similar)
router.put('/:id/deal', authenticateToken, dealsController.updateDeal);

module.exports = router;
