const { dbGetAsync, dbRunAsync } = require('../utils/db');

/**
 * Controller for resolving public digital business cards.
 * No authentication required for these endpoints.
 */

exports.getPublicProfile = async (req, res) => {
  try {
    const { slug } = req.params;

    // 1. Resolve card and associated user data in one join
    const profile = await dbGetAsync(`
      SELECT 
        u.name, 
        u.email, 
        u.phone_number as phone, 
        u.avatar_url, 
        u.bio as user_bio,
        c.headline, 
        c.bio as card_bio, 
        c.design_json, 
        c.views,
        w.name as company,
        w.logo_url as company_logo
      FROM user_cards c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN workspaces w ON u.workspace_id = w.id
      WHERE c.url_slug = ?
    `, [slug]);

    if (!profile) {
      return res.status(404).json({ error: 'Identity not found. This profile may have been deactivated or moved.' });
    }

    // 2. Atomic View Increment
    // We don't await this to keep the response fast
    dbRunAsync('UPDATE user_cards SET views = views + 1 WHERE url_slug = ?', [slug]).catch(console.error);

    // 3. Prepare response with design logic
    res.json({
      name: profile.name,
      email: profile.email,
      phone: profile.phone || 'Contact for Phone',
      company: profile.company || 'Professional Network',
      company_logo: profile.company_logo,
      headline: profile.headline || 'Independent Professional',
      bio: profile.card_bio || profile.user_bio || 'Professional networking profile.',
      avatar_text: profile.name.charAt(0),
      design_json: typeof profile.design_json === 'string' ? JSON.parse(profile.design_json) : profile.design_json
    });

  } catch (err) {
    console.error('[Public Profile Resolver Error]', err);
    res.status(500).json({ error: 'Identity gateway is currently unavailable.' });
  }
};
