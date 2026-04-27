const { dbGetAsync, dbRunAsync, isPostgres } = require('../utils/db');
const { unifiedTextAIPipeline } = require('../services/aiService');

/**
 * Controller for managing digital business cards and AI designs.
 * Standardized to use 'user_cards' table.
 */

exports.getMyCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const card = await dbGetAsync('SELECT * FROM user_cards WHERE user_id = ?', [userId]);
    
    if (!card) {
      // Return beautiful defaults if no card exists yet
      return res.json({
        url_slug: '',
        bio: 'Digital business card for networking.',
        headline: 'Founder & Professional',
        design_json: { 
          primary: '#4F46E5', 
          secondary: '#7C3AED', 
          layout: 'glassmorphism', 
          font: 'Inter',
          gradient_angle: '135deg'
        },
        views: 0,
        saves: 0
      });
    }

    res.json({
      ...card,
      design_json: typeof card.design_json === 'string' ? JSON.parse(card.design_json) : card.design_json
    });
  } catch (err) {
    console.error('[Card Fetch Error]', err);
    res.status(500).json({ error: 'Failed to retrieve card identity' });
  }
};

exports.saveCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { headline, bio, design_json, url_slug } = req.body;
    
    const finalSlug = url_slug || `identity-${userId}-${Math.random().toString(36).substring(7)}`;
    const designStr = typeof design_json === 'string' ? design_json : JSON.stringify(design_json);

    await dbRunAsync(`
      INSERT INTO user_cards (user_id, url_slug, headline, bio, design_json)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (user_id) DO UPDATE SET
        url_slug = EXCLUDED.url_slug,
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        design_json = EXCLUDED.design_json,
        updated_at = ${isPostgres ? 'NOW()' : 'CURRENT_TIMESTAMP'}
    `, [userId, finalSlug, headline, bio, designStr]);

    res.json({ success: true, slug: finalSlug });
  } catch (err) {
    console.error('[Card Save Error]', err);
    res.status(500).json({ error: 'Failed to save card identity' });
  }
};

exports.generateDesign = async (req, res) => {
  try {
    const { firstName, lastName, name: providedName, title, company, industry, vibe } = req.body;
    const name = providedName || `${firstName || ''} ${lastName || ''}`.trim() || 'Professional';

    const prompt = `
      You are a world-class brand designer for IntelliScan. 
      Generate a premium digital business card design configuration.
      
      User Profile:
      - Name: ${name}
      - Title: ${title || 'Leader'}
      - Company: ${company || 'Stealth Startup'}
      - Industry: ${industry || 'Technology'}
      - Theme Vibe: ${vibe || 'Premium and futuristic'}

      Requirements:
      1. Return JSON ONLY.
      2. Provide a "headline" (Professional networking headline).
      3. Provide a "bio" (Compelling 2-sentence bio).
      4. Provide a "design" object:
         - "primary" (HEX code)
         - "secondary" (HEX code)
         - "layout" (glassmorphism, minimalist, bold_dark, or corporate_pro)
         - "font" (Inter, Roboto, Montserrat, or Outfit)
         - "gradient_angle" (e.g., '135deg')
    `;

    const aiResponse = await unifiedTextAIPipeline({ prompt, responseFormat: 'json' });
    
    if (aiResponse.success) {
      res.json(aiResponse.data);
    } else {
      throw new Error(aiResponse.error || 'AI designer took a break.');
    }
  } catch (err) {
    console.error('[AI Design Error]', err);
    res.status(500).json({ error: 'AI Designer is currently calibrating. Please try again.' });
  }
};
exports.ensureProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;
    const slug = email.split('@')[0].toLowerCase();
    
    const existing = await dbGetAsync('SELECT url_slug FROM user_cards WHERE user_id = ?', [userId]);
    
    if (existing) {
      return res.json({ success: true, slug: existing.url_slug });
    }

    // Provision default card
    await dbRunAsync(`
      INSERT INTO user_cards (user_id, url_slug, headline, bio, design_json)
      VALUES (?, ?, ?, ?, ?)
    `, [
      userId, 
      slug, 
      'IntelliScan Professional', 
      'Self-learning networking professional.', 
      JSON.stringify({ primary: '#6366f1', secondary: '#a855f7', gradient_angle: '135deg', layout: 'glassmorphism' })
    ]);

    res.json({ success: true, slug, provisioned: true });
  } catch (err) {
    console.error('[Ensure Profile Error]', err);
    res.status(500).json({ error: 'Failed to ensure profile existence' });
  }
};
