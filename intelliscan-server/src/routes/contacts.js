const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');
const validate = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');
const { 
  createContactSchema, 
  updateDealSchema, 
  enrollSequenceSchema 
} = require('../schemas/contactSchema');

// All routes here require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts for the user
 */
router.get('/', contactsController.getContacts);

/**
 * @route   GET /api/contacts/stats
 * @desc    Get contact statistics
 */
router.get('/stats', contactsController.getStats);
router.put('/reorder', contactsController.reorderContacts);

/**
 * @route   POST /api/contacts
 * @desc    Create a new contact (saved scan)
 */
router.post('/', validate(createContactSchema), contactsController.createContact);

/**
 * Trash / Recycle Bin Routes
 */
router.get('/trash', contactsController.getDeletedContacts);
router.post('/restore', contactsController.restoreContacts);
router.delete('/trash', contactsController.permanentlyDeleteContacts);
router.delete('/trash/empty', contactsController.emptyTrash);

/**
 * DELETE /api/contacts/bulk
 * @desc    Mass delete contacts (Soft Delete)
 */
router.delete('/bulk', contactsController.bulkDeleteContacts);

/**
 * DELETE /api/contacts/:id
 * @desc    Delete a contact (Soft Delete)
 */
router.put('/:id', contactsController.updateContact);
router.delete('/:id', authenticateToken, contactsController.deleteContact);
router.post('/:id/send-followup', authenticateToken, contactsController.sendFollowup);

/**
 * @route   PUT /api/contacts/:id/deal
 * @desc    Update deal information for a contact
 */
router.put('/:id/deal', validate(updateDealSchema), contactsController.updateDeal);

const marketingController = require('../controllers/marketingController');

/**
 * @route   POST /api/contacts/:id/enrich
 * @desc    Enrich contact data using AI
 */
router.post('/:id/enrich', contactsController.enrichContact);
router.post('/:id/enroll-sequence', marketingController.enrollContact);

/**
 * @route   GET /api/workspace/analytics
 * @desc    Get workspace-level analytics
 */
router.get('/workspace/analytics', contactsController.getWorkspaceAnalytics);

/**
 * @route   GET /api/workspace/contacts/duplicates
 * @desc    Get duplicate contacts feed
 */
router.get('/workspace/contacts/duplicates', contactsController.getDuplicates);

/**
 * @route   POST /api/contacts/relationships
 * @desc    Establish a relationship between contacts
 */
router.post('/relationships', contactsController.establishRelationship);

/**
 * @route   GET /api/contacts/:id/relationships
 * @desc    Get relationships for a contact
 */
router.get('/:id/relationships', contactsController.getRelationships);

/**
 * @route   GET /api/org-chart/:company
 * @desc    Get organization chart for a company
 */
router.get('/org-chart/:company', contactsController.getOrgChart);

// Natural Language Search
router.get('/semantic-search', authenticateToken, contactsController.semanticSearch);

// Magic Export
router.get('/export/magic', contactsController.exportContactsToExcel);

module.exports = router;


