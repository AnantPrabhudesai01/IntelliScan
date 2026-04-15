const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { dbGetAsync, dbAllAsync } = require('../utils/db');

router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const tier = req.user.tier || 'personal';

    // Mock some networking insights based on CRM data
    const contactsCount = (await dbGetAsync('SELECT COUNT(*) as count FROM contacts WHERE user_id = ?', [userId]))?.count || 0;
    const cardsToday = (await dbGetAsync('SELECT COUNT(*) as count FROM contacts WHERE user_id = ? AND created_at >= date(\'now\')', [userId]))?.count || 0;

    const healthScore = Math.min(100, 40 + (contactsCount * 2));
    let status = 'Growing';
    if (healthScore > 80) status = 'Excellent';
    else if (healthScore < 50) status = 'Needs Focus';

    const actions = [
      {
        id: 'stale',
        title: 'Re-engage Stale Leads',
        description: `You have ${contactsCount > 5 ? 'several' : 'a few'} contacts you haven't interacted with in 30 days. Re-connecting keeps your network warm.`,
        cta: 'View Stale Drafts',
        color: 'red'
      },
      {
        id: 'context',
        title: 'Enrich Network Context',
        description: '30% of your recent contacts are missing LinkedIn bio data. Use AI Enrichment to add more context before your next meeting.',
        cta: 'Open Contacts',
        color: 'indigo'
      },
      {
        id: 'momentum',
        title: 'Maintain Momentum',
        description: contactsCount > 0 
          ? `You added ${cardsToday > 0 ? cardsToday : 'no new'} cards today. Consistent networking is the key to business growth.`
          : 'Start scanning business cards to build your AI-powered networking graph.',
        cta: 'Go to Scanner',
        color: 'emerald'
      }
    ];

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
