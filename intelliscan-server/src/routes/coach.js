const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { dbGetAsync, dbAllAsync } = require('../utils/db');
const { unifiedTextAIPipeline } = require('../services/aiService');

router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tier = req.user.tier || 'personal';

    // 1. Fetch data for analysis
    const contacts = await dbAllAsync('SELECT name, company, email, phone, scan_date, confidence, linkedin_bio FROM contacts WHERE user_id = ? ORDER BY scan_date DESC LIMIT 10', [userId]);
    const contactsCount = (await dbGetAsync('SELECT COUNT(*) as count FROM contacts WHERE user_id = ? AND is_deleted = FALSE', [userId]))?.count || 0;
    const cardsToday = (await dbGetAsync('SELECT COUNT(*) as count FROM contacts WHERE user_id = ? AND date(scan_date) = date(\'now\')', [userId]))?.count || 0;

    // 2. Check Cache (Return instantly if data is fresh)
    const cached = await dbGetAsync(`
      SELECT insights_json, updated_at 
      FROM coach_insights_cache 
      WHERE user_id = ? AND contact_count_at_cache = ?
      AND updated_at > ${isPostgres ? "NOW() - interval '1 hour'" : "datetime('now', '-1 hour')"}
    `, [userId, contactsCount]);

    if (cached && cached.insights_json) {
      const parsed = JSON.parse(cached.insights_json);
      return res.json({
        health_score: healthScore,
        momentum_status: status,
        actions: parsed.actions,
        cached: true
      });
    }

    // 3. AI Insight Generation (with strict 8s timeout)
    const contactSummary = (contacts || []).map(c => `- ${c.name} (${c.company || 'Unknown'})`).join('\n');
    const prompt = `As a high-level Business Networking Coach, analyze this CRM snapshot for user_id ${userId}:
Total Contacts: ${contactsCount}
Added Today: ${cardsToday}
Recent Leads:
${contactSummary || 'No recent leads'}

Generate 3 actionable "Next Steps" for the user. Return ONLY JSON: { "actions": [{ "title", "description", "cta", "color", "id" }] }`;

    let actions = [];
    try {
      const aiResult = await Promise.race([
        unifiedTextAIPipeline({ prompt, responseFormat: 'json' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI Timeout')), 8000))
      ]);
      if (aiResult.success) {
        actions = aiResult.data.actions;
        
        // Update Cache
        await dbRunAsync('INSERT INTO coach_insights_cache (user_id, insights_json, contact_count_at_cache, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET insights_json = EXCLUDED.insights_json, contact_count_at_cache = EXCLUDED.contact_count_at_cache, updated_at = CURRENT_TIMESTAMP', [userId, JSON.stringify({ actions }), contactsCount]);
      }
    } catch (e) {
      console.warn(`[Coach] AI Insights failed/timed out: ${e.message}`);
    }

    // Fallback if AI fails or times out
    if (!actions || actions.length === 0) {
      actions = [
        { id: 'momentum', title: 'Maintain Momentum', description: 'Consistency is key. Scan new cards daily.', cta: 'Go to Scanner', color: 'emerald' },
        { id: 'context', title: 'Enrich Network', description: 'Add missing details to your recent leads.', cta: 'Open Contacts', color: 'indigo' }
      ];
    }

    res.json({
      health_score: healthScore,
      momentum_status: status,
      actions: actions
    });
  } catch (err) {
    console.error('Coach insights error:', err);
    res.status(500).json({ error: 'Failed to generate coach insights' });
  }
});

module.exports = router;
