const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { authenticateToken, requireFeature } = require('../middleware/auth');

// POST /api/scan
// Scans a single business card image
router.post('/', authenticateToken, requireFeature('standard_scan'), scanController.scanSingleCard);

// POST /api/scan-multi
// Scans multiple business cards in a single photo
router.post('/multi', authenticateToken, requireFeature('batch_upload'), scanController.scanGroupCards);

module.exports = router;
