const { dbGetAsync, dbRunAsync } = require('../utils/db');
const { ensureQuotaRow, resolveTierLimits } = require('../utils/quota');
const { unifiedExtractionPipeline } = require('../services/aiService');
const { hasMeaningfulContactData } = require('../utils/aiUtils');
const { notifyUser } = require('../services/notificationService');
const {
  shouldUseMockAiFallback,
  buildFallbackSingleCardResponse,
  buildFallbackMultiCardResponse,
  normalizeExtractedCard
} = require('../utils/scanUtils');

/**
 * POST /api/scan
 * Scans a single business card image
 */
exports.scanSingleCard = async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Check user tier and quota before calling Gemini
    const userRow = await dbGetAsync(`
      SELECT u.tier, q.used_count 
      FROM users u 
      LEFT JOIN user_quotas q ON u.id = q.user_id 
      WHERE u.id = ?
    `, [req.user.id]);

    const tier = userRow?.tier || 'personal';
    const limits = resolveTierLimits(tier);
    const limit = limits.single;
    
    await ensureQuotaRow(req.user.id, tier);
    const quotaRow = await dbGetAsync('SELECT used_count FROM user_quotas WHERE user_id = ?', [req.user.id]);

    if ((quotaRow?.used_count || 0) >= limit) {
      const upgradePath = tier === 'personal' ? 'Professional or Enterprise' : 'Enterprise';
      notifyUser(req.user.id, {
        type: 'err',
        title: 'Quota Exceeded',
        message: `You have reached your scan limit of ${limit}.`
      });
      return res.status(403).json({
        error: `Scan limit reached. Your ${tier.toUpperCase()} account is limited to ${limit} single scans. Please upgrade to an ${upgradePath} plan for more scans.`
      });
    } else if ((quotaRow?.used_count || 0) === Math.floor(limit * 0.9)) {
      notifyUser(req.user.id, {
        type: 'warn',
        title: 'Quota Warning',
        message: `You have reached 90% of your scan limit (${limit}).`
      });
    }

    const extractionResult = await unifiedExtractionPipeline({
      imageBase64,
      mimeType,
      userId: req.user.id,
      tier,
      prompt: `You are a world-class AI specialized in Business Card OCR and professional document extraction. 
Accuracy is paramount. If you see a business card, extract every detail with high precision.

### EXTRACTION RULES:
1. **Name Scripting**: 
   - 'name': Standard English/Latin name.
   - 'name_native': Original script (Hindi, Arabic, Japanese, etc.) IF AND ONLY IF the card is multilingual. Else empty string.
2. **Contact Info**:
   - Clean all phone numbers to international format (e.g., +123456789).
   - Normalize emails to lowercase.
3. **LinkedIn Strategy**: 
   - If a LinkedIn URL/handle isn't on the card, predict the most likely URL based on 'name' and 'company'.
4. **Insights**:
   - 'inferred_industry': Analyze the logo, company name, and title to provide a specific industry.
   - 'inferred_seniority': Analyze the job title (e.g., Director = VP / Director).
5. **Rejection**:
   - If the image is NOT a business card or contact card, return {"rejected": true, "reason": "Not a valid contact card"}.
   - If multiple cards are in one photo, return {"rejected": true, "reason": "Please scan only one card at a time"}.

### OUTPUT FORMAT (JSON ONLY):
{
  "rejected": false,
  "name": "full name",
  "name_native": "original script name",
  "company": "company name",
  "company_native": "original script company",
  "title": "job title",
  "title_native": "original script title",
  "email": "email",
  "phone": "phone",
  "website": "url",
  "address": "full address",
  "detected_language": "iso language name",
  "inferred_industry": "Technology | Finance | Healthcare | Real Estate | etc.",
  "inferred_seniority": "CXO / Founder | VP / Director | Senior | Mid-Level | Entry-Level",
  "deal_score": 0-100,
  "linkedin_url": "predicted or found url",
  "linkedin_bio": "one sentence bio",
  "confidence": 0-100
}`
    });

    if (extractionResult.error) {
      if (shouldUseMockAiFallback()) {
        console.log("All Single-Card engines failed. Returning Offline Mock Fallback.");
        return res.json({
          rejected: false,
          ...buildFallbackSingleCardResponse()
        });
      }
      return res.status(extractionResult.status || 500).json({ error: extractionResult.error });
    }

    const scannedData = extractionResult.data;

    // If Gemini/OpenAI flagged the image as rejected, return a 422
    if (scannedData.rejected === true) {
      return res.status(422).json({
        error: scannedData.reason || 'Invalid image type. Please upload a single business card photo.',
        is_multi_card: true
      });
    }

    const normalizedCard = normalizeExtractedCard(scannedData, { fallbackConfidence: 72 });
    if (!hasMeaningfulContactData(normalizedCard)) {
      return res.status(422).json({
        error: 'No contact fields were confidently extracted. Please retake the photo with better lighting and focus.'
      });
    }

    // 1. Detection: Is this the user's own card?
    const userEmail = (req.user.email || '').toLowerCase();
    const userName = (req.user.name || '').toLowerCase();
    const cardEmail = (normalizedCard.email || '').toLowerCase();
    const cardName = (normalizedCard.name || '').toLowerCase();

    const isSelfScan = (cardEmail && cardEmail === userEmail) || 
                       (cardName && userName && cardName.includes(userName));

    // 2. Prepare Enrichment Payload (Magic Sync)
    const enrichmentPayload = isSelfScan ? {
      title: normalizedCard.title,
      company: normalizedCard.company,
      phone: normalizedCard.phone,
      bio: normalizedCard.linkedin_bio || `Professional ${normalizedCard.title} in ${normalizedCard.inferred_industry}`,
      industry: normalizedCard.inferred_industry
    } : null;

    // 3. Successful scan: Increment Quota
    await dbRunAsync('UPDATE user_quotas SET used_count = used_count + 1 WHERE user_id = ?', [req.user.id]);

    res.json({
      rejected: false,
      is_self_scan: isSelfScan,
      enrichment_payload: enrichmentPayload,
      ...normalizedCard,
      engine_used: scannedData.engine_used || 'Gemini 2.5 Flash Enterprise'
    });
  } catch (error) {
    console.error('OCR Error:', error);
    if (shouldUseMockAiFallback()) {
      return res.json(buildFallbackSingleCardResponse());
    }
    res.status(500).json({ error: 'Failed to process image with AI', details: error.message });
  }
};

/**
 * POST /api/scan-multi
 * Extracted group scan functionality
 */
exports.scanGroupCards = async (req, res) => {
  console.log('📬 Received MULTI-SCAN request from:', req.user.email);
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

    // Check user tier and group scan quota before calling Gemini
    const userRow = await dbGetAsync(`
      SELECT u.tier, q.group_scans_used 
      FROM users u 
      LEFT JOIN user_quotas q ON u.id = q.user_id 
      WHERE u.id = ?
    `, [req.user.id]);

    const tier = userRow?.tier || 'personal';
    const limits = resolveTierLimits(tier);
    const groupLimit = limits.group;
    
    await ensureQuotaRow(req.user.id, tier);
    const quotaRow = await dbGetAsync('SELECT group_scans_used FROM user_quotas WHERE user_id = ?', [req.user.id]);

    if ((quotaRow?.group_scans_used || 0) >= groupLimit) {
      const upgradePath = tier === 'personal' ? 'Professional or Enterprise' : 'Enterprise';
      return res.status(403).json({
        error: `Group Photo limit reached. Your ${tier.toUpperCase()} account is limited to ${groupLimit} group scans. Please upgrade to an ${upgradePath} plan.`
      });
    }

    const extractionResult = await unifiedExtractionPipeline({
      imageBase64,
      mimeType,
      userId: req.user.id,
      tier,
      allowTesseract: false,
      prompt: `You are a world-class Business Card Extraction Engine in EXHAUSTIVE SCAN MODE.
The image contains up to 25 separate business cards. You MUST identify EVERY SINGLE card.
Use a Scan-Line Strategy: Start at the Top-Left corner and move Left-to-Right, then Top-to-Bottom. Do not skip any card.

Return ONLY a valid JSON object:
{
  "engine_used": "Gemini 3 Flash (Exhaustive)",
  "cards": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "name": "Person Name",
      "name_native": "Original script name if non-Latin, else empty",
      "company": "Company Name",
      "company_native": "Original script company if non-Latin, else empty",
      "title": "Job title",
      "title_native": "Original script title if non-Latin, else empty",
      "email": "Email Address",
      "phone": "Phone Number",
      "website": "Website URL",
      "address": "Full Physical Address",
      "detected_language": "Primary detected language",
      "inferred_industry": "Industry description",
      "inferred_seniority": "Seniority level",
      "deal_score": 80,
      "linkedin_url": "URL",
      "linkedin_bio": "one sentence bio",
      "confidence": 95
    }
  ]
}

If you cannot detect any cards, return:
{ "cards": [] }`
    });

    if (extractionResult.error) {
      if (shouldUseMockAiFallback()) {
        await dbRunAsync('UPDATE user_quotas SET group_scans_used = group_scans_used + 1 WHERE user_id = ?', [req.user.id]);
        return res.json(buildFallbackMultiCardResponse());
      }
      return res.status(extractionResult.status || 500).json({ error: extractionResult.error });
    }

    const parsed = extractionResult.data;

    if (String(parsed?.engine_used || '').toLowerCase().includes('tesseract')) {
      if (shouldUseMockAiFallback()) {
        return res.json(buildFallbackMultiCardResponse());
      }
      return res.status(503).json({
        error: 'Multi-card OCR requires Gemini/OpenAI. Offline OCR cannot reliably detect multiple cards from one photo.'
      });
    }

    if (!parsed.cards && !parsed.rejected) {
      parsed.cards = [parsed]; 
      parsed.total_detected = 1;
    }

    if (!parsed.cards || !Array.isArray(parsed.cards)) {
      return res.status(422).json({ error: 'No business cards were detected. Try placing cards flat and well-lit.' });
    }

    const normalizedCards = (parsed.cards || [])
      .map((card) => normalizeExtractedCard(card, { fallbackConfidence: 68 }))
      .filter((card) => hasMeaningfulContactData(card));

    if (normalizedCards.length === 0) {
      return res.status(422).json({ error: 'No business cards were confidently detected. Try placing all cards face-up.' });
    }

    const userId = req.user.id;
    const checkDuplicate = async (email, name) => {
      if (!email && !name) return false;
      const q = email
        ? 'SELECT id FROM contacts WHERE user_id = ? AND (LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)) LIMIT 1'
        : 'SELECT id FROM contacts WHERE user_id = ? AND LOWER(name) = LOWER(?) LIMIT 1';
      const params = email ? [userId, email, name] : [userId, name];
      const row = await dbGetAsync(q, params);
      return !!row;
    };

    const seenThisBatch = new Set();
    const cardsWithDupInfo = await Promise.all(normalizedCards.map(async (card, idx) => {
      const keyBase = `${(card.email || '').toLowerCase()}|${(card.name || '').toLowerCase()}|${(card.phone || '').toLowerCase()}|${(card.company || '').toLowerCase()}`;
      const key = keyBase === '|||' ? `unknown-${idx}` : keyBase;
      const isIntraBatchDup = seenThisBatch.has(key);
      seenThisBatch.add(key);
      const isDbDup = await checkDuplicate(card.email, card.name);
      return { ...card, is_duplicate: isDbDup || isIntraBatchDup };
    }));

    await dbRunAsync('UPDATE user_quotas SET group_scans_used = group_scans_used + 1 WHERE user_id = ?', [req.user.id]);

    res.json({
      cards: cardsWithDupInfo,
      total_detected: cardsWithDupInfo.length,
      engine_used: parsed.engine_used || 'Gemini 2.5 Flash Multi-Card'
    });

  } catch (error) {
    console.error('Multi-Card OCR Error:', error);
    if (shouldUseMockAiFallback()) {
      try {
        await dbRunAsync('UPDATE user_quotas SET group_scans_used = group_scans_used + 1 WHERE user_id = ?', [req.user.id]);
      } catch (_) {}
      return res.json(buildFallbackMultiCardResponse());
    }
    res.status(500).json({ error: 'Failed to process multi-card image', details: error.message });
  }
};
