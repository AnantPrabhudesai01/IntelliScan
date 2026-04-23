const express = require('express');
const router = express.Router();
const { dbAllAsync, dbGetAsync, dbRunAsync } = require('../utils/db');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

/**
 * AI Model Management Routes
 */

// GET /api/models (List all models)
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const models = await dbAllAsync('SELECT * FROM ai_models ORDER BY accuracy DESC');
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/models/stats (Global AI Stats)
router.get('/stats', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const scanStats = await dbGetAsync(`
      SELECT 
        COUNT(*) as total_inference,
        AVG(confidence) as avg_accuracy
      FROM contacts
    `);

    // In a real system, latency would be tracked in a logs table. 
    // We'll return an optimized aggregate from our models table.
    const latencyStats = await dbGetAsync('SELECT AVG(latency_ms) as avg_latency FROM ai_models WHERE status = "deployed"');

    res.json({
      active_inference: scanStats.total_inference || 0,
      avg_accuracy: scanStats.avg_accuracy ? parseFloat(scanStats.avg_accuracy).toFixed(1) : "95.0",
      global_latency: Math.round(latencyStats.avg_latency || 450),
      vram_usage: "48.2" // Simulated based on node cluster
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/models/:id/deploy (Set active model)
router.post('/:id/deploy', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Deactivate all
    await dbRunAsync('UPDATE ai_models SET is_active = FALSE');
    // 2. Activate target
    await dbRunAsync('UPDATE ai_models SET is_active = TRUE WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Model deployed to production node.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
