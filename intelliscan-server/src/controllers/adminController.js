/**
 * Admin Controller — High-level analytics and team management
 */
const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');

// GET /api/admin/leaderboard
exports.getLeaderboard = async (req, res) => {
  const { timeframe } = req.query; // 'This Week', 'This Month', 'All Time'
  
  try {
    const userRow = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [req.user.id]);
    const workspaceId = userRow.workspace_id || req.user.id;

    let dateFilter = '1=1'; // Default: All Time
    if (timeframe === 'This Week') {
      dateFilter = "c.scan_date >= NOW() - INTERVAL '7 days'";
    } else if (timeframe === 'This Month') {
      dateFilter = "c.scan_date >= NOW() - INTERVAL '30 days'";
    }

    const rankings = await dbAllAsync(`
      SELECT 
        u.name, 
        u.email,
        COUNT(CASE WHEN ${dateFilter} THEN c.id ELSE NULL END) as total_scans,
        SUM(CASE WHEN ${dateFilter} AND c.deal_status = 'Closed' THEN 1 ELSE 0 END) as deals_closed,
        COALESCE(SUM(CASE WHEN ${dateFilter} THEN d.value ELSE 0 END), 0) as pipeline_value
      FROM users u
      LEFT JOIN contacts c ON u.id = c.user_id
      LEFT JOIN deals d ON c.id = d.contact_id
      WHERE u.workspace_id = ? OR u.id = ?
      GROUP BY u.id, u.name, u.email
      ORDER BY total_scans DESC, pipeline_value DESC
    `, [workspaceId, req.user.id]);

    res.json({ success: true, rankings });
  } catch (err) {
    console.error('[Leaderboard Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- AI MODEL MANAGEMENT (SUPER ADMIN) ---

exports.getModels = async (req, res) => {
  try {
    const models = await dbAllAsync('SELECT * FROM ai_models ORDER BY id ASC');

    // Calculate aggregate stats
    const stats = {
      activeInference: models.filter(m => m.status === 'deployed').reduce((acc, m) => acc + m.calls_30d, 0),
      avgAccuracy: (models.filter(m => m.status === 'deployed' && m.accuracy > 0).reduce((acc, m) => acc + m.accuracy, 0) /
        Math.max(1, models.filter(m => m.status === 'deployed' && m.accuracy > 0).length)).toFixed(1),
      globalLatency: Math.round(models.filter(m => m.status === 'deployed').reduce((acc, m) => acc + m.latency_ms, 0) /
        Math.max(1, models.filter(m => m.status === 'deployed').length)),
      vramUsage: models.filter(m => m.status === 'deployed').reduce((acc, m) => acc + m.vram_gb, 0).toFixed(1)
    };

    res.json({ success: true, models, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateModelStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['deployed', 'training', 'paused'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  try {
    await dbRunAsync('UPDATE ai_models SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createModel = async (req, res) => {
  const { name, type, vram_gb } = req.body;
  if (!name || !type) {
    return res.status(400).json({ success: false, error: 'Name and type are required' });
  }

  try {
    const result = await dbRunAsync(
      'INSERT INTO ai_models (name, type, vram_gb, status, accuracy, latency_ms, calls_30d) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, type, vram_gb || 0, 'training', 0, 0, 0]
    );
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
