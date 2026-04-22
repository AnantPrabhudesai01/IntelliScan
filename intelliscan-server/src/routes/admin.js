const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// Leaderboard Route
router.get('/leaderboard', authenticateToken, adminController.getLeaderboard);

// AI Model Management (Super Admin)
router.get('/models', authenticateToken, requireSuperAdmin, adminController.getModels);
router.put('/models/:id/status', authenticateToken, requireSuperAdmin, adminController.updateModelStatus);
router.post('/models', authenticateToken, requireSuperAdmin, adminController.createModel);

// Global Stats (Super Admin)
router.get('/stats', authenticateToken, requireSuperAdmin, adminController.getGlobalStats);

// Workspace & Organization Management (Super Admin)
router.get('/workspaces', authenticateToken, requireSuperAdmin, adminController.getWorkspaces);
router.post('/workspaces', authenticateToken, requireSuperAdmin, adminController.createWorkspace);
router.delete('/workspaces/:id', authenticateToken, requireSuperAdmin, adminController.deleteWorkspace);


module.exports = router;
