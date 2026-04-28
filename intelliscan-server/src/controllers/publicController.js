const { dbGetAsync, dbRunAsync, isPostgres } = require('../utils/db');
const dns = require('dns').promises;

/**
 * Controller for resolving public digital business cards.
 * No authentication required for these endpoints.
 */

exports.getPublicProfile = async (req, res) => {
  try {
    const { slug } = req.params;
    const slugLower = slug.toLowerCase();

    // Cross-database compatible email prefix extraction
    const emailPrefix = isPostgres
      ? `LOWER(SPLIT_PART(u.email, '@', 1))`
      : `LOWER(SUBSTR(u.email, 1, INSTR(u.email, '@') - 1))`;

    // 1. Resolve card and associated user data with multi-fallback
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
        c.contact_email,
        c.contact_phone,
        c.contact_linkedin,
        c.contact_whatsapp,
        w.name as company,
        w.logo_url as company_logo
      FROM users u
      LEFT JOIN user_cards c ON u.id = c.user_id
      LEFT JOIN workspaces w ON u.workspace_id = w.id
      WHERE c.url_slug = ? 
         OR (LOWER(REPLACE(u.name, ' ', '')) = ?)
         OR (${emailPrefix} = ?)
      ORDER BY (CASE WHEN c.url_slug = ? THEN 1 WHEN ${emailPrefix} = ? THEN 2 ELSE 3 END)
      LIMIT 1
    `, [slug, slugLower, slugLower, slug, slugLower]);

    if (!profile) {
      return res.status(404).json({ error: 'Identity not found. This profile may have been deactivated or moved.' });
    }

    // 2. Atomic View Increment (non-blocking)
    dbRunAsync('UPDATE user_cards SET views = views + 1 WHERE url_slug = ?', [slug]).catch(() => {});

    // 3. Parse design_json safely
    let designJson = null;
    try {
      designJson = (typeof profile.design_json === 'string' && profile.design_json.trim()) 
        ? JSON.parse(profile.design_json) 
        : profile.design_json;
    } catch (e) {
      designJson = null;
    }

    // 4. Prepare response with premium fallback design
    res.json({
      name: profile.name,
      email: profile.contact_email || profile.email,
      phone: profile.contact_phone || profile.phone || 'Contact for Phone',
      linkedin: profile.contact_linkedin,
      whatsapp: profile.contact_whatsapp,
      company: profile.company || 'Professional Network',
      company_logo: profile.company_logo,
      headline: profile.headline || 'Independent Professional',
      bio: profile.card_bio || profile.user_bio || 'Professional networking profile.',
      avatar_text: (profile.name || 'U').charAt(0).toUpperCase(),
      design_json: designJson || {
        primary: '#6366f1',
        secondary: '#a855f7',
        gradient_angle: '135deg'
      }
    });

  } catch (err) {
    console.error('[Public Profile Resolver Error]', err);
    res.status(500).json({ error: 'Identity gateway is currently unavailable.' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // 1. Basic Regex Check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({ valid: false, reason: 'Invalid format' });
  }

  // 2. DNS MX Check
  const domain = email.split('@')[1];
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return res.json({ valid: true, domain, records: mxRecords.length });
    } else {
      return res.json({ valid: false, reason: 'No mail servers (MX) found for this domain' });
    }
  } catch (err) {
    return res.json({ valid: false, reason: 'Domain not found or unreachable' });
  }
};
