const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/incidents
 * @desc Get all platform incidents
 */
router.get('/', authenticateToken, adminController.getIncidents);

/**
 * @route POST /api/incidents
 * @desc Manually create an incident
 */
router.post('/', authenticateToken, adminController.createIncident);

/**
 * @route PATCH /api/incidents/:id/status
 * @desc Update incident status (ack or resolve)
 */
router.patch('/:id/status', authenticateToken, adminController.updateIncidentStatus);

/**
 * @route DELETE /api/incidents/:id
 * @desc Delete an incident
 */
router.delete('/:id', authenticateToken, adminController.deleteIncident);

module.exports = router;
