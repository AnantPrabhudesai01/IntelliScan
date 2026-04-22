const express = require('express');
const router = express.Router();
const scannerLinksController = require('../controllers/scannerLinksController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, scannerLinksController.getAllLinks);
router.post('/', authenticateToken, scannerLinksController.createLink);
router.patch('/:id', authenticateToken, scannerLinksController.updateLinkStatus);

module.exports = router;
