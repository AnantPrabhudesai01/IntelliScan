const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { dbGetAsync, dbAllAsync } = require('../utils/db');
const { unifiedTextAIPipeline } = require('../services/aiService');

router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

    // 1. REAL DATA ANALYSIS
    // ---------------------------------------------------------
    
    // Total contacts
    const stats = await dbGetAsync(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN crm_synced = 1 THEN 1 END) as synced,
        COUNT(CASE WHEN created_at > ${isPostgres ? "NOW() - interval '7 days'" : "datetime('now', '-7 days')"} THEN 1 END) as recent
      FROM contacts 
      WHERE user_id = ? AND is_deleted = FALSE
    `, [userId]);

    const total = stats.total || 0;
    const synced = stats.synced || 0;
    const recent = stats.recent || 0;
    const syncRatio = total > 0 ? Math.round((synced / total) * 100) : 100;
    
    // Find Stale Leads (Added > 7 days ago, but not synced/updated)
    const staleCount = (await dbGetAsync(`
      SELECT COUNT(*) as count 
      FROM contacts 
      WHERE user_id = ? 
      AND created_at < ${isPostgres ? "NOW() - interval '7 days'" : "datetime('now', '-7 days')"}
      AND crm_synced = 0
    `, [userId]))?.count || 0;

    // Calculate Health Score
    // Formula: 40% sync ratio + 40% recent activity + 20% database cleanliness
    const healthScore = Math.min(100, Math.round((syncRatio * 0.4) + (Math.min(recent, 10) * 4) + 20));
    const momentumStatus = healthScore > 80 ? 'Peak Momentum' : healthScore > 50 ? 'Steady Growth' : 'Needs Attention';

    // 2. GENERATE PROACTIVE ACTIONS
    // ---------------------------------------------------------
    let actions = [];

    // Rule A: Sync Gap
    if (syncRatio < 60 && total > 5) {
      actions.push({
        id: 'sync_gap',
        title: 'CRM Sync Gap',
        description: `Only ${syncRatio}% of your leads are in your CRM. You have ${total - synced} leads sitting locally.`,
        cta: 'Sync to CRM',
        color: 'red'
      });
    }

    // Rule B: Stale Leads
    if (staleCount > 0) {
      actions.push({
        id: 'stale',
        title: 'Stale Lead Alert',
        description: `You have ${staleCount} leads from last week that haven't been contacted. Shall I draft a follow-up?`,
        cta: 'Review Stale Leads',
        color: 'amber'
      });
    }

    // Rule C: Networking Win
    if (recent > 3) {
      actions.push({
        id: 'momentum',
        title: 'Networking Win',
        description: `Great job! You added ${recent} new connections this week. Keep the momentum going.`,
        cta: 'View Recent',
        color: 'emerald'
      });
    }

    // Default Fallback
    if (actions.length === 0) {
      actions.push({
        id: 'context',
        title: 'Daily Coach',
        description: 'Your network is stable. Try adding 3 new contacts this week to increase your health score.',
        cta: 'Go to Scanner',
        color: 'indigo'
      });
    }

    res.json({
      health_score: healthScore,
      momentum_status: momentumStatus,
      actions: actions
    });
  } catch (err) {
    console.error('Coach insights error:', err);
    res.status(500).json({ error: 'Failed to generate coach insights' });
  }
});

module.exports = router;
