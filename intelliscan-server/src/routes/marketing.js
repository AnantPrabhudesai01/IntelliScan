const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const { authenticateToken, requireTier } = require('../middleware/auth');

// Sequence Management Routes
router.get('/sequences', authenticateToken, marketingController.getSequences);
router.post('/sequences', authenticateToken, marketingController.createSequence);
router.get('/sequences/:id', authenticateToken, marketingController.getSequenceById);
router.put('/sequences/:id', authenticateToken, marketingController.updateSequence);
router.post('/enroll', authenticateToken, marketingController.enrollContact);

// Campaign Management Routes
router.get('/campaigns', authenticateToken, requireTier('enterprise'), marketingController.getCampaigns);
router.post('/campaigns', authenticateToken, requireTier('enterprise'), marketingController.createCampaign);
router.get('/campaigns/:id', authenticateToken, requireTier('enterprise'), marketingController.getCampaignById);
router.post('/campaigns/:id/send', authenticateToken, requireTier('enterprise'), marketingController.sendCampaign);

// Resource Retrieval Routes (Audience & Templates)
router.get('/lists', authenticateToken, marketingController.getLists);
router.get('/lists/:id', authenticateToken, marketingController.getListById);
router.post('/lists/:id/contacts', authenticateToken, marketingController.addContactsToList);
router.get('/templates', authenticateToken, marketingController.getTemplates);
router.post('/templates/generate-ai', authenticateToken, marketingController.generateAiTemplate);

// Tracking & Analytics (Public & Protected)
router.get('/track/open/:trackingId', marketingController.trackOpen);
router.get('/track/click/:trackingId', marketingController.trackClick);
router.get('/unsubscribe/:trackingId', marketingController.unsubscribe);
router.get('/analytics/overview', authenticateToken, requireTier('enterprise'), marketingController.getAnalyticsOverview);

module.exports = router;
