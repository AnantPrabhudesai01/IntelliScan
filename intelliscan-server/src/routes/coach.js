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

    // 2. Real Analytics
    const missingData = contacts.filter(c => !c.email || !c.phone || !c.linkedin_bio).length;
    const lowConf = contacts.filter(c => (c.confidence || 0) < 80).length;
    
    const baseScore = Math.min(60, (contactsCount * 5));
    const freshnessBonus = Math.min(20, (cardsToday * 10));
    const qualityDeduction = Math.min(10, (lowConf * 2));
    const healthScore = Math.max(0, Math.min(100, baseScore + freshnessBonus - qualityDeduction));

    let status = 'Growing';
    if (healthScore > 80) status = 'Excellent';
    else if (healthScore < 40) status = 'Needs Focus';

    // 3. AI Insight Generation
    const contactSummary = (contacts || []).map(c => `- ${c.name} (${c.company || 'Unknown'})`).join('\n');
    const prompt = `As a high-level Business Networking Coach, analyze this CRM snapshot for user_id ${userId}:
Total Contacts: ${contactsCount}
Added Today: ${cardsToday}
Recent Leads:
${contactSummary || 'No recent leads'}

Generate 3 actionable "Next Steps" for the user to strengthen their network.
Each action should have:
- title: Short title (4-5 words)
- description: Engaging, data-driven advice (15-20 words)
- cta: Short button text
- color: One of ['red', 'indigo', 'emerald', 'amber']
- id: a unique slug

Return JSON format: { "actions": [...] }`;

    let actions = [];
    try {
      const aiResult = await unifiedTextAIPipeline({ prompt, responseFormat: 'json' });
      if (aiResult.success) {
        actions = aiResult.data.actions;
      }
    } catch (e) {
      console.error('AI Insight generation failed, using fallbacks');
    }

    // Fallback if AI fails
    if (!actions || actions.length === 0) {
      actions = [
        {
          id: 'momentum',
          title: 'Maintain Momentum',
          description: contactsCount > 0 
            ? `You added ${cardsToday > 0 ? cardsToday : 'no new'} cards today. Consistent networking is the key to business growth.`
            : 'Start scanning business cards to build your AI-powered networking graph.',
          cta: 'Go to Scanner',
          color: 'emerald'
        },
        {
          id: 'context',
          title: 'Enrich Network Context',
          description: missingData > 0 
            ? `${missingData} of your recent contacts are missing full profile data. Use AI Enrichment for better context.`
            : 'Your contact data looks great! Keep enriching new leads to stay ahead.',
          cta: 'Open Contacts',
          color: 'indigo'
        }
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
