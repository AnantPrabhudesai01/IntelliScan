const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authenticateToken } = require('../middleware/auth');

// Public catalog
router.get('/plans', billingController.getPlans);

// Order creation
router.post('/create-order', authenticateToken, billingController.createOrder);

// Payment verification
router.post('/verify-payment', authenticateToken, billingController.verifyPayment);

module.exports = router;
