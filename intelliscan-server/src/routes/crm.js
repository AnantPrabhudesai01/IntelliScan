const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');
const { authenticateToken } = require('../middleware/auth');

// CRM Config Routes
router.get('/config', authenticateToken, crmController.getConfig);
router.post('/config', authenticateToken, crmController.saveConfig);

// CRM Connection Routes
router.post('/connect', authenticateToken, crmController.connect);
router.post('/disconnect', authenticateToken, crmController.disconnect);

// CRM Schema and Log Routes
router.get('/schema', authenticateToken, crmController.getSchema);
router.get('/sync-log', authenticateToken, crmController.getSyncLog);

// CRM Export Route
router.post('/export/:provider', authenticateToken, crmController.exportContacts);

module.exports = router;
