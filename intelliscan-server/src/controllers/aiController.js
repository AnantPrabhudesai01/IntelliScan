/**
 * AI Controller — Logic for contact enrichment, semantic search, and intelligence gaps
 */
const { dbGetAsync, dbAllAsync, dbRunAsync } = require('../utils/db');
const { generateEmbedding, cosineSimilarity } = require('../utils/aiUtils');
const { generateWithFallback, unifiedTextAIPipeline } = require('../services/aiService');

/**
 * Uses AI to research and enrich contact data.
 * POST /api/contacts/:id/enrich
 */
exports.enrichContact = async (req, res) => {
  const contactId = req.params.id;
  try {
    const contact = await dbGetAsync('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [contactId, req.user.id]);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const contactData = JSON.parse(contact.json_data || '{}');
    const name = contactData.name || contact.name || 'Unknown';
    const company = contactData.company || contact.company || 'Unknown';
    const title = contactData.title || contact.title || '';

    const enrichmentPrompt = `As a professional AI research assistant, research and provide a detailed professional profile for:
Name: ${name}
Company: ${company}
Job Title: ${title}

Provide the following in VALID JSON format:
{
  "bio": "A professional 1-paragraph summary (max 60 words) of their likely recent experience and expertise.",
  "latest_news": "A summary of recent news or industry trends regarding their company or role.",
  "industry": "One of: Technology, Finance, Healthcare, Real Estate, Manufacturing, Education, Retail, Other.",
  "seniority": "One of: CXO / Founder, VP / Director, Senior, Mid-Level, Entry-Level."
}

Use your training data to suggest the most likely and professional details based on these identifiers. Return ONLY the JSON.`;

    const enrichmentText = await generateWithFallback(enrichmentPrompt);
    let enriched = {};
    try {
      const jsonMatch = enrichmentText.match(/\{[\s\S]*\}/);
      enriched = JSON.parse(jsonMatch ? jsonMatch[0] : enrichmentText);
    } catch (e) {
      console.warn('AI Enrichment JSON parse failed, using raw text');
    }

    await dbRunAsync(`
      UPDATE contacts SET 
        linkedin_bio = ?, 
        ai_enrichment_news = ?, 
        inferred_industry = ?, 
        inferred_seniority = ? 
      WHERE id = ?`,
      [enriched.bio || '', enriched.latest_news || '', enriched.industry || '', enriched.seniority || '', contactId]
    );

    res.json({ success: true, message: 'Contact enriched successfully', data: enriched });
  } catch (err) {
    console.error('Enrichment Error:', err);
    res.status(500).json({ error: 'Failed to enrich contact via AI' });
  }
};

/**
 * Natural language search for contacts using vector embeddings.
 * GET /api/contacts/semantic-search
 */
exports.semanticSearch = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Search query "q" is required' });

  try {
    const queryVector = await generateEmbedding(q);
    if (!queryVector) return res.status(503).json({ error: 'Embedding engine unavailable' });

    const contacts = await dbAllAsync('SELECT * FROM contacts WHERE user_id = ? AND search_vector IS NOT NULL', [req.user.id]);

    const results = contacts
      .map(c => {
        try {
          const contactVector = JSON.parse(c.search_vector);
          const score = cosineSimilarity(queryVector, contactVector);
          return { ...c, similarity_score: score };
        } catch (e) {
          return { ...c, similarity_score: 0 };
        }
      })
      .filter(c => c.similarity_score > 0.6)
      .sort((a, b) => b.similarity_score - a.similarity_score);

    res.json({ success: true, results: results.slice(0, 10) });
  } catch (err) {
    console.error('Semantic Search Error:', err);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
};

/**
 * Suggests optimal meeting times based on contact context and bio.
 * POST /api/ai/suggest-time/:id
 */
exports.suggestTime = async (req, res) => {
  const contactId = req.params.id;
  try {
    const contact = await dbGetAsync('SELECT name, job_title, company, linkedin_bio FROM contacts WHERE id = ? AND user_id = ?', [contactId, req.user.id]);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const prompt = `As an AI business assistant, suggest 3 optimal meeting times (slots) and a rationale for scheduling a call with this professional:
Name: ${contact.name}
Role: ${contact.job_title} at ${contact.company}
Bio: ${contact.linkedin_bio || 'Standard professional'}

Consider their likely seniority and industry norms. Return exactly 3 suggestions in a clear bulleted format with high-level rationale for each.`;

    const suggestion = await generateWithFallback(prompt);
    res.json({ success: true, suggestion });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate time suggestions' });
  }
};

/**
 * Generates a rich professional description/summary for a contact.
 * POST /api/ai/describe/:id
 */
exports.generateDescription = async (req, res) => {
  const contactId = req.params.id;
  try {
    const contact = await dbGetAsync('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [contactId, req.user.id]);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });

    const prompt = `Write a professional 2-sentence summary/elevator pitch describing why this person is a valuable contact based on:
Name: ${contact.name}
Role: ${contact.job_title} at ${contact.company}
Industry: ${contact.inferred_industry || 'Professional Services'}
Notes: ${contact.notes || 'None'}

The tone should be concise and strategic for a CRM dashboard.`;

    const description = await generateWithFallback(prompt);
    res.json({ success: true, description });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate contact description' });
  }
};

/**
 * Handles conversations for the AI Support Chatbot widget.
 * Provides platform-specific guidance and intelligence.
 * POST /api/ai/chat/support
 */
exports.supportChat = async (req, res) => {
  try {
    const { messages, currentPage } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Dynamic Context based on current page
    let pageContext = "";
    if (currentPage) {
      const path = currentPage.toLowerCase();
      if (path.includes('contacts')) pageContext = "\nCURRENT CONTEXT: The user is currently on the CONTACTS page. They can see their scanned cards, filter by confidence, use AI Enrichment, and export to Excel/CRM. Mention the 'Deduplication Hub' if they ask about cleaning up.";
      else if (path.includes('calendar')) pageContext = "\nCURRENT CONTEXT: The user is on the CALENDAR / CAMPAIGNS page. They can see their scheduled follow-ups, ROI tracking, and networking events.";
      else if (path.includes('billing')) pageContext = "\nCURRENT CONTEXT: The user is on the BILLING page. They can see their current quota, upgrade tiers, or contact sales for Enterprise Scale.";
      else if (path.includes('settings')) pageContext = "\nCURRENT CONTEXT: The user is in SETTINGS. This is where they configure their Profile, CRM links, and Twilio WhatsApp Sandbox.";
      else if (path.includes('dashboard') && !path.includes('/')) pageContext = "\nCURRENT CONTEXT: The user is on the main DASHBOARD OVERVIEW. They can see quick stats and the 'New Scan' button.";
    }

    const systemPrompt = `You are the IntelliScan Expert, an advanced AI Support Assistant.
You guide users on how to use the IntelliScan Enterprise platform.
${pageContext}

### STRUCTURE RULES:
1. **USE BOLD HEADERS** (e.g. ### 💎 Feature Name) for every new section.
2. **USE BULLET POINTS** for all lists of steps or features.
3. **KEEP PARAGRAPHS SHORT** (max 2-3 sentences). 
4. **USE EMOJIS** sparingly at the start of sections to highlight them (e.g. 🛠️, 🚀, 💳).
5. **ALWAYS USE MARKDOWN** for formatting (bold, italics, lists).

### PLATFORM KNOWLEDGE:
1. Business Card Scanning (Web & WhatsApp Sandbox via Twilio using Discovery Codes).
2. Contact Management (Enrichment, Export to VCard/CSV/CRM).
3. Campaign Center (Creates networking events, logs them to Calendar, tracks ROI).
4. Billing & Tiers (Personal (10 credits), Advanced, Scale). Note: Scale/Enterprise requires contacting sales via the Company Registration modal.
5. Email Marketing & Drafts (Follow-ups using Gemini AI).

Be concise, helpful, and professional. If the user asks something outside of IntelliScan or general networking, politely steer them back.`;

    const formattedHistory = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const userPrompt = `Conversation History:\n${formattedHistory}\n\nASSISTANT: `;

    const result = await unifiedTextAIPipeline({
      prompt: userPrompt,
      systemPrompt,
      responseFormat: 'text'
    });
    
    if (result.success) {
      res.json({ success: true, reply: result.data });
    } else {
      throw new Error(result.error || 'AI Pipeline Failure');
    }
  } catch (err) {
    console.error('Support Chat Error:', err);
    res.status(500).json({ error: 'Failed to process chat response' });
  }
};

