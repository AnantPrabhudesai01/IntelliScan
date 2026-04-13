const { db, dbAllAsync } = require('../utils/db');

/**
 * Global search across contacts, events, and campaigns
 */
exports.globalSearch = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const query = `%${q}%`;
  const userId = req.user.id;

  try {
    // Search Contacts, Events (using name), and Campaigns in parallel
    // NOTE: Using raw db.all for complex multi-query or separate dbAllAsync calls.
    // To match legacy logic exactly, we'll perform them sequentially or with Promise.all
    
    const [contacts, events, campaigns] = await Promise.all([
      dbAllAsync(
        'SELECT id, name as title, company as subtitle, "contact" as type FROM contacts WHERE (name LIKE ? OR company LIKE ?) AND user_id = ? LIMIT 5',
        [query, query, userId]
      ),
      dbAllAsync(
        'SELECT id, name as title, type as subtitle, "event" as type FROM events WHERE name LIKE ? AND user_id = ? LIMIT 3',
        [query, userId]
      ),
      dbAllAsync(
        'SELECT id, name as title, subject as subtitle, "campaign" as type FROM email_campaigns WHERE name LIKE ? AND user_id = ? LIMIT 3',
        [query, userId]
      )
    ]);

    res.json([...contacts, ...events, ...campaigns]);
  } catch (err) {
    console.error('Global Search Error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Simulate AI Intent Discovery from the contact pool (Signals)
 */
exports.getSignals = async (req, res) => {
  const userId = req.user.id;
  try {
    const contacts = await dbAllAsync(
      'SELECT id, name, company, job_title FROM contacts WHERE user_id = ? LIMIT 5',
      [userId]
    );

    // Legacy mock signals logic relocated from index.js
    const signals = [
      { type: 'intent', icon: 'zap', title: 'Buying Intent Detected', msg: 'Lead is researching competitors.' },
      { type: 'career', icon: 'award', title: 'Promotion Alert', msg: 'Contact recently updated their profile.' },
      { type: 'news', icon: 'globe', title: 'Company News', msg: 'Funding round announced recently.' }
    ];

    res.json({ success: true, signals, contacts });
  } catch (err) {
    console.error('Signals API Error:', err);
    res.status(500).json({ error: err.message });
  }
};
