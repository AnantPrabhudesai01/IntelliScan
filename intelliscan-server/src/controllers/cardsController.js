const { dbGetAsync, dbRunAsync, isPostgres } = require('../utils/db');
const { unifiedImageGeneration, unifiedTextAIPipeline } = require('../services/aiService');

/**
 * Controller for managing digital business cards and AI designs.
 */

exports.getMyCard = async (req, res) => {
  try {
    const userId = req.user.id;
    const card = await dbGetAsync('SELECT * FROM user_cards WHERE user_id = ?', [userId]);
    
    if (!card) {
      return res.json({ url_slug: null, views: 0, saves: 0, design_json: {} });
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
    
    // Validate if design_json has the new logo field
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

exports.generateAiDesign = async (req, res) => {
  try {
    const { name, title, company, industry, vibe } = req.body;

    const aiPrompt = `You are a professional premium brand designer. Generate a high-end digital business card configuration for:
Name: ${name}
Title: ${title}
Company: ${company}
Industry: ${industry}
Style Vibe: ${vibe}

Return ONLY a JSON object:
{
  "headline": "...",
  "bio": "...",
  "design": {
    "style": "glass | executive | futurist | signature | bold_dark",
    "primary": "hex",
    "secondary": "hex",
    "accentColor": "hex",
    "fontClass": "font-sans | font-serif | font-mono",
    "gradient_angle": "135deg",
    "tagline": "...",
    "mood": "Luxury | Tech | Minimalist",
    "designNotes": "Reasoning for the design choices"
  }
}`;

    const aiRes = await unifiedTextAIPipeline({ prompt: aiPrompt, responseFormat: 'json' });
    
    if (aiRes.success) {
      res.json(aiRes.data);
    } else {
      throw new Error(aiRes.error);
    }
  } catch (err) {
    console.error('[AI Design Error]', err);
    res.status(500).json({ error: 'AI Designer is currently calibrating. Please try again.' });
  }
};

exports.generateAiLogo = async (req, res) => {
  try {
    const { company, industry, vibe } = req.body;

    // 1. Concept Generation (Gemini)
    const conceptPrompt = `You are a professional logo designer. Create a highly detailed image generation prompt for a corporate logo.
Company: ${company}
Industry: ${industry}
Vibe: ${vibe}

Guidelines:
- Professional, minimalist, and high-end.
- Mention specific colors and geometric shapes.
- No text inside the logo (emblem only).
- Return ONLY the prompt text.`;

    const conceptRes = await unifiedTextAIPipeline({ prompt: conceptPrompt, responseFormat: 'text' });
    if (!conceptRes.success) throw new Error('Logo conceptualization failed');

    // 2. Materialization (OpenRouter / DALL-E)
    const logoRes = await unifiedImageGeneration({ 
      prompt: conceptRes.data,
      model: 'openai/dall-e-3' // Flagship for professional logos
    });

    if (logoRes.success) {
      res.json({ success: true, logoUrl: logoRes.url, concept: conceptRes.data });
    } else {
      throw new Error(logoRes.error);
    }
  } catch (err) {
    console.error('[AI Logo Error]', err);
    res.status(500).json({ error: 'Logo engine is currently offline. Please try again later.' });
  }
};
