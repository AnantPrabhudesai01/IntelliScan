const { db, dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');
const crypto = require('crypto');

exports.getAllLinks = async (req, res) => {
  try {
    const user_id = req.user.id;
    // For simplicity, we fetch by user_id. In enterprise, we might fetch by workspace_id.
    const links = await dbAllAsync(
      'SELECT * FROM scanner_links WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    res.json({ success: true, links });
  } catch (err) {
    console.error('[ScannerLinks] Fetch Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createLink = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

    const user_id = req.user.id;
    const slug = crypto.randomBytes(4).toString('hex');
    
    // Get workspace_id if available
    const user = await dbGetAsync('SELECT workspace_id FROM users WHERE id = ?', [user_id]);
    const workspace_id = user?.workspace_id;

    await dbRunAsync(
      'INSERT INTO scanner_links (user_id, workspace_id, name, slug) VALUES (?, ?, ?, ?)',
      [user_id, workspace_id, name, slug]
    );

    const newLink = await dbGetAsync('SELECT * FROM scanner_links WHERE slug = ?', [slug]);
    res.json({ success: true, link: newLink });
  } catch (err) {
    console.error('[ScannerLinks] Create Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateLinkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await dbRunAsync(
      'UPDATE scanner_links SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );

    const updatedLink = await dbGetAsync('SELECT * FROM scanner_links WHERE id = ?', [id]);
    res.json({ success: true, link: updatedLink });
  } catch (err) {
    console.error('[ScannerLinks] Update Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
