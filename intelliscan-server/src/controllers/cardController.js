const { dbGetAsync, dbRunAsync } = require('../utils/db');
const { unifiedTextAIPipeline } = require('../services/aiService');

/**
 * GET /api/my-card
 * Fetches the digital card for the current user.
 */
exports.getMyCard = async (req, res) => {
  try {
    const card = await dbGetAsync('SELECT * FROM digital_cards WHERE user_id = ?', [req.user.id]);
    if (card) {
      return res.json(card);
    }
    // Return defaults if no card exists yet
    res.json({
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/cards/save
 * Saves or updates the user's digital card.
 */
exports.saveCard = async (req, res) => {
  try {
    const { bio, headline, design_json, url_slug } = req.body;
    const userId = req.user.id;
    const slug = url_slug || req.user.name?.toLowerCase().replace(/\s+/g, '-') || `user-${userId}`;

    const existing = await dbGetAsync('SELECT id FROM digital_cards WHERE user_id = ?', [userId]);

    if (existing) {
      await dbRunAsync(
        'UPDATE digital_cards SET bio = ?, headline = ?, design_json = ?, url_slug = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [bio, headline, JSON.stringify(design_json), slug, userId]
      );
    } else {
      await dbRunAsync(
        'INSERT INTO digital_cards (user_id, bio, headline, design_json, url_slug) VALUES (?, ?, ?, ?, ?)',
        [userId, bio, headline, JSON.stringify(design_json), slug]
      );
    }

    res.json({ success: true, message: 'Card saved successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/cards/generate-design
 * Uses AI to brainstorm a high-conversion card design.
 */
exports.generateDesign = async (req, res) => {
  try {
    const { firstName, lastName, title, company, industry, vibe } = req.body;
    const name = `${firstName} ${lastName}`.trim() || 'Anonymous';

    // Tier-based access check (Optional but professional)
    const user = await dbGetAsync('SELECT tier FROM users WHERE id = ?', [req.user.id]);
    const tier = user?.tier || 'personal';

    // Let's assume Card Creator AI designer is a 'Premium' feature
    if (tier === 'personal') {
      // Allow 3 free designs then require upgrade
      const count = await dbGetAsync('SELECT COUNT(*) as cnt FROM digital_cards WHERE user_id = ?', [req.user.id]);
      if (count.cnt >= 3) {
        return res.json({ 
          success: false, 
          requiresUpgrade: true, 
          error: 'Free tier limit reached! Upgrade to PRO for unlimited AI magic designs.' 
        });
      }
    }

    const prompt = `As a world-class brand designer and copywriter, create a professional digital business card identity for:
Name: ${name}
Title: ${title}
Company: ${company}
Industry: ${industry}
Preferred Vibe: ${vibe}

Provide a high-conversion Bio, a catchy Networking Headline, and a premium Design Specification.
Return ONLY a valid JSON object:
{
  "success": true,
  "bio": "...",
  "headline": "...",
  "design": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "layout": "glassmorphism | bold_dark | minimalist | corporate_pro",
    "font": "Inter | Roboto | Montserrat | Outfit",
    "gradient_angle": "45deg | 135deg | 180deg",
    "style": "minimal | bold | luxury | tech | glass | neon",
    "accentColor": "#HEX",
    "tagline": "SHORT BRAND TAGLINE",
    "designNotes": "EXPERT DESIGN RATIONALE",
    "mood": "SOUP | MODERN | ELEGANT"
  }
}`;

    const aiResponse = await unifiedTextAIPipeline({ prompt, responseFormat: 'json' });
    
    if (aiResponse.success) {
      // Flatten the response slightly to satisfy both frontend callers
      const data = aiResponse.data;
      res.json({
        success: true,
        ...data,
        // Legacy support for CardCreatorPage
        design: data.design
      });
    } else {
      throw new Error(aiResponse.error || 'AI generation failed');
    }
  } catch (err) {
    console.error('[AI Designer Error]', err.message);
    res.status(500).json({ success: false, error: 'Failed to generate design: ' + err.message });
  }
};
