const { dbGetAsync, dbRunAsync, isPostgres } = require('../utils/db');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

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

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      // Fallback for mock environments
      return res.json({
        headline: `${title} at ${company}`,
        bio: `Connect with ${name}, a professional in ${industry}. Designed with ${vibe} vibes.`,
        design: {
          primary: '#4F46E5',
          secondary: '#7C3AED',
          layout: 'glassmorphism',
          font: 'Inter',
          gradient_angle: '135deg'
        }
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are a professional brand designer for IntelliScan. 
      Generate a premium digital business card design configuration in JSON format.
      
      User Profile:
      - Name: ${name}
      - Title: ${title}
      - Company: ${company}
      - Industry: ${industry}
      - Theme Vibe: ${vibe}

      Rules:
      1. Return JSON ONLY. No markdown blocks.
      2. Include: "headline", "bio" (compelling short bio), and a "design" object.
      3. Design object must have: "primary" (hex), "secondary" (hex), "layout" (one of: glassmorphism, minimal, bold_dark, corporate_pro), "font" (Inter, Roboto, Playfair Display), and "gradient_angle".
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    // Clean potential markdown blocks
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const aiDesign = JSON.parse(cleanJson);

    res.json(aiDesign);
  } catch (err) {
    console.error('[AI Design Error]', err);
    res.status(500).json({ error: 'AI Designer is currently calibrating. Please try again.' });
  }
};
