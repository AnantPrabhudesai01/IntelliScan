const twilio = require('twilio');
const { JWT_SECRET } = require('../config/constants');
const { dbGetAsync, dbRunAsync, isPostgres } = require('../utils/db');
const { ensureQuotaRow, resolveTierLimits } = require('../utils/quota');
const { unifiedExtractionPipeline } = require('../services/aiService');
const { notifyUser } = require('../services/notificationService');
const { normalizePhone, firstNameFromFullName } = require('../utils/auth');
const { normalizeExtractedCard } = require('../utils/scanUtils');
const { hasMeaningfulContactData } = require('../utils/aiUtils');
const { sendFollowupEmail } = require('../services/emailService');
const path = require('path');
const marketingController = require('./marketingController');
const { uploadToImgbb } = require('../utils/imageUpload');

// Initialize Twilio Client (Lazily)
let twilioClient;
function getTwilioClient() {
  if (!twilioClient) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID, 
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
}

/**
 * Main Webhook for Twilio WhatsApp
 */
exports.webhook = async (req, res) => {
  const { 
    From, 
    Body, 
    MediaUrl0, 
    MediaContentType0,
    FromCity, FromState, FromCountry
  } = req.body;
  const fromPhone = normalizePhone(From || '');

  // 👮 Check if service is enabled
  if (process.env.ENABLE_WHATSAPP !== 'true') {
     console.warn(`[WhatsApp] Webhook received but ENABLE_WHATSAPP is not 'true'. Ignoring.`);
     return res.status(200).send(`
       <Response>
         <Message>⚠️ IntelliScan WhatsApp Engine is currently in Maintenance Mode. Please check your Dashboard Environment Variables!</Message>
       </Response>
     `);
  }

  // 🕵️ Proceed with processing
  try {
    console.log(`[WhatsApp Incoming] Webhook Triggered from ${fromPhone}`);
    console.log(`[WhatsApp Body] "${(Body || '').substring(0, 50)}..."`);
    
    // 1. Resolve User
    const user = await dbGetAsync('SELECT * FROM users WHERE phone_number = ?', [fromPhone]);

    if (!user) {
      console.warn(`[WhatsApp] Unauthorized: Number ${fromPhone} not linked to any user.`);
      
      // 🕵️ Check for Discovery Code (e.g., join baseball-eventually IS-1234)
      const isCmd = (Body || '').match(/(IS|CODE)[-\s]?(\d{4})/i);
      if (isCmd) {
        const discoCode = `IS-${isCmd[2]}`.toUpperCase();
        console.log(`[WhatsApp] Discovery detected! Code: ${discoCode} for Phone: ${fromPhone}`);
        await dbRunAsync(
          'INSERT INTO whatsapp_discoveries (discovery_code, phone_number) VALUES (?, ?) ON CONFLICT (discovery_code) DO UPDATE SET phone_number = EXCLUDED.phone_number, created_at = CURRENT_TIMESTAMP',
          [discoCode, fromPhone]
        );
        const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
        const host = req.headers.host;
        const baseUrl = (host.includes('localhost') || !host) ? 'https://intelli-scan-psi.vercel.app' : `${protocol}://${host}`;

        return sendWhatsAppReply(From, `✨ *Discovery Code Detected!* I've linked your session. Now, go back to the IntelliScan dashboard to complete your registration! 🚀\n\n🔗 *Dashboard*: ${baseUrl}/dashboard`);
      }

      const bodyLower = (Body || '').toLowerCase().trim();
      if (bodyLower === 'help' || bodyLower === 'guide') {
        return sendWhatsAppReply(From, `📖 *IntelliScan WhatsApp Guide*\n\n1️⃣ *Link Account*: Send your Session Code (e.g., IS-1234).\n2️⃣ *Scan*: Send a photo of a business card.\n3️⃣ *Export*: Type "export" to get your contacts in Excel.\n\nNeed more help? Visit: https://intelli-scan-psi.vercel.app/setup-guide`);
      }

      if (bodyLower === 'ping' || bodyLower === 'test') {
        return sendWhatsAppReply(From, `🏓 *Pong!* Your IntelliScan server is alive and receiving your WhatsApp messages!`);
      }

      const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
      const host = req.headers.host;
      const baseUrl = (host.includes('localhost') || !host) ? 'https://intelli-scan-psi.vercel.app' : `${protocol}://${host}`;

      return sendWhatsAppReply(From, `Hi! It looks like your number (${fromPhone}) isn't linked to an IntelliScan account yet.\n\nPlease log in to IntelliScan on your computer, navigate to Settings > Communications, and send the Session Code (e.g., IS-1234) here to connect! 🚀\n\n🔗 *Login here*: ${baseUrl}/sign-in`);
    }

    // 2. Check for Commands (Export/Excel)
    const body = (Body || '').toLowerCase().trim();
    if (body === 'export' || body === 'excel' || body === 'csv') {
      const jwt = require('jsonwebtoken');
      const exportToken = jwt.sign(
        { id: user.id, purpose: 'magic_export' }, 
        JWT_SECRET, 
        { expiresIn: '15m' }
      );
      
      const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
      const host = req.headers.host;
      let rawDomain = `${protocol}://${host}`;
      
      // Safety: If host is localhost but we are in production, or if no host, fallback to production
      if (host.includes('localhost') || !host) {
        rawDomain = 'https://intelli-scan-psi.vercel.app';
      }

      const cleanDomain = rawDomain.replace(/^https?:\/\//, '');
      const finalProtocol = rawDomain.startsWith('http://') ? 'http' : 'https';
      
      const exportUrl = `${finalProtocol}://${cleanDomain}/api/contacts/export/magic?token=${exportToken}`;
      
      // 🚀 Send Text Message First (Guarantees user gets the link even if attachment fails)
      const message = `✨ *Your Magic Excel Export is ready!*\n\n📥 *Cloud Link (Click to Download):* \n${exportUrl}\n\n🔗 *Visit Dashboard:* \n${rawDomain}/dashboard/contacts\n\n_(Link expires in 15 minutes)_`;
      await sendWhatsAppReply(From, message);

      // 📎 Then attempt to send as an actual file attachment
      return sendWhatsAppReply(From, `Here is your Excel file:`, exportUrl);

    }

    if (body === 'help' || body === 'guide') {
      const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
      const host = req.headers.host;
      const baseUrl = (host.includes('localhost') || !host) ? 'https://intelli-scan-psi.vercel.app' : `${protocol}://${host}`;

      return sendWhatsAppReply(From, `📖 *IntelliScan WhatsApp Help*\n\n📸 *Scan*: Just send me a photo!\n📊 *Excel*: Type "export"\n💰 *Status*: Type "status"\n\n🔗 *Dashboard*: ${baseUrl}/dashboard\n\nHappy scanning! 🚀`);
    }

    if (body === 'status' || body === 'quota') {
      const limits = resolveTierLimits(user.tier);
      const quota = await dbGetAsync('SELECT used_count FROM user_quotas WHERE user_id = ?', [user.id]);
      const used = quota?.used_count || 0;
      const remaining = Math.max(0, limits.single - used);
      
      const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
      const host = req.headers.host;
      const baseUrl = (host.includes('localhost') || !host) ? 'https://intelli-scan-psi.vercel.app' : `${protocol}://${host}`;

      return sendWhatsAppReply(From, `📊 *IntelliScan Status*\n\n👤 *User*: ${user.name}\n🏆 *Plan*: ${user.tier.toUpperCase()}\n📈 *Usage*: ${used} / ${limits.single} Scans\n🔋 *Remaining*: ${remaining}\n\n🔗 *Dashboard:* ${baseUrl}/dashboard\n\nNeed more? Visit your dashboard to upgrade!`);
    }

    // 2. Check for Image
    const mediaUrl = MediaUrl0 || req.body.MediaUrl || req.body.MediaUrl1;
    
    if (!mediaUrl) {
      console.log(`[WhatsApp] No media found. Body keys: ${Object.keys(req.body).join(', ')}`);
      return sendWhatsAppReply(From, `Hi ${firstNameFromFullName(user.name)}! I'm ready to scan. Just send me a photo of a business card (or a photo with multiple cards) and I'll do the rest! 📸\n\n💡 *Tip:* Type "export" anytime to receive your contacts as an Excel sheet!`);
    }

    // Immediate confirmation so user knows we are working
    await sendWhatsAppReply(From, `📥 *Image Received!* I'm starting the AI extraction now. Please wait a few seconds... ⏳`);

    // 3. Quota Enforcement
    const limits = resolveTierLimits(user.tier);
    await ensureQuotaRow(user.id, user.tier);
    const quota = await dbGetAsync('SELECT used_count FROM user_quotas WHERE user_id = ?', [user.id]);

    if ((quota?.used_count || 0) >= limits.single) {
      return sendWhatsAppReply(From, `⚠️ Quota Exhausted!\n\nYou've reached your limit of ${limits.single} scans for the ${user.tier.toUpperCase()} plan.`);
    }

    // 4. Download & AI Extraction (INTELLIGENT BATCH MODE)
    console.log(`[WhatsApp] Processing request for ${user.email} | Media: ${mediaUrl}`);
    
    let imageBase64;
    try {
      console.log(`[WhatsApp] Downloading media from Twilio...`);
      imageBase64 = await downloadImageAsBase64(mediaUrl);
      console.log(`[WhatsApp] Media download success (${Math.round(imageBase64.length / 1024)} KB)`);
    } catch (downErr) {
      console.error(`[WhatsApp] Media download failed:`, downErr.message);
      return sendWhatsAppReply(From, `❌ I couldn't download the image from Twilio. Please try sending it again!`);
    }
    
    console.log(`[WhatsApp] Calling AI Engine (Gemini Flash)...`);
    const aiStart = Date.now();
    
    let extractionResult;
    try {
      extractionResult = await unifiedExtractionPipeline({
        imageBase64,
        mimeType: MediaContentType0 || 'image/jpeg',
        userId: user.id,
        tier: user.tier,
        prompt: `Act as a world-class AI specialized in Business Card OCR and professional document extraction. 
Accuracy is paramount. If you see a business card, extract every detail with high precision.

### EXTRACTION RULES:
1. **Name & Entity Scripting (CRITICAL)**: 
   - 'name': ALWAYS English/Latin script. If the card is only in a native script (Hindi, Gujarati, etc.), YOU MUST TRANSLITERATE it into Latin/English (e.g., "वसुधा" -> "Vasudha").
   - 'name_native': The original verbatim script name (e.g., "वसुधा"). 
   - 'company': ALWAYS English/Latin script. Transliterate if necessary.
   - 'company_native': Original verbatim script company.
   - 'title': ALWAYS English/Latin script. Transliterate if necessary.
   - 'title_native': Original verbatim script title.
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
6. **Group Strategy**:
   - If multiple cards are in one photo, detect ALL of them and return an array under the "cards" key. 

### OUTPUT FORMAT (JSON ONLY):
{
  "cards": [
    {
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
      "inferred_industry": "Industry",
      "inferred_seniority": "Seniority",
      "linkedin_url": "predicted url",
      "confidence": 95
    }
  ]
}`
      });
    } catch (aiErr) {
      console.error(`[WhatsApp] AI Engine Crash:`, aiErr.message);
      return sendWhatsAppReply(From, `❌ AI Extraction Error: The engine encountered a temporary issue. Please try again in a moment!`);
    }

    console.log(`[WhatsApp] AI process finished in ${((Date.now() - aiStart)/1000).toFixed(1)}s`);

    if (extractionResult.error) {
      console.error(`[WhatsApp] AI Engine returned error:`, extractionResult.error);
      return sendWhatsAppReply(From, `❌ AI Extraction Failed: ${extractionResult.error}. Please try a clearer photo!`);
    }

    let cards = extractionResult.data?.cards || [];
    if (cards.length === 0 && extractionResult.data?.name) {
      cards = [extractionResult.data]; // Handle single object fallback
    }

    if (cards.length === 0) {
      console.warn(`[WhatsApp] No cards extracted from image.`);
      return sendWhatsAppReply(From, `🔍 I couldn't find any clear details in that photo. Please make sure the card's text is legible and well-lit!`);
    }

    // 6. Persistence & Sync with Duplicacy Check
    let savedCount = 0;
    let duplicateCount = 0;
    const contactNames = [];
    const locationStr = [FromCity, FromState, FromCountry].filter(Boolean).join(', ') || 'WhatsApp';

    // 🚀 NEW: Upload the image to ImgBB for permanent storage in the dashboard
    let permanentImageUrl = null;
    try {
      if (imageBase64) {
        console.log(`[WhatsApp] Uploading to ImgBB for permanent storage...`);
        permanentImageUrl = await uploadToImgbb(imageBase64);
        console.log(`[WhatsApp] Permanent Image URL: ${permanentImageUrl}`);
      }
    } catch (uploadErr) {
      console.error(`[WhatsApp] ImgBB Upload failed:`, uploadErr.message);
      // Fallback to Twilio URL if upload fails (though Twilio URLs expire)
      permanentImageUrl = mediaUrl;
    }

    for (let i = 0; i < cards.length; i++) {
      const cardData = cards[i];
      const normalized = normalizeExtractedCard(cardData, { fallbackConfidence: 75 });
      if (!hasMeaningfulContactData(normalized)) continue;

      // Build a Rich List item for the reply
      const mainIdent = normalized.name || 'Unknown Contact';
      const subIdent = normalized.company ? ` | ${normalized.company}` : '';
      const phoneIdent = normalized.phone ? `\n    📞 ${normalized.phone}` : '';
      contactNames.push(`${i + 1}. *${mainIdent}*${subIdent}${phoneIdent}`);

      // Check for Existing Contact (Duplicate Prevention)
      const existing = await findExistingContact(user.id, normalized.email, normalized.name);
      
      if (existing) {
        // Update Existing (Duplicate handling - update date and location)
        await dbRunAsync('UPDATE contacts SET scan_date = NOW(), location_context = ?, notes = ?, image_url = ? WHERE id = ?', 
          [locationStr, `Re-scanned via WhatsApp. Previous: ${existing.notes || ''}`, permanentImageUrl, existing.id]);
        duplicateCount++;
      } else {
        // Save New with Location and Permanent Image
        const contactId = await saveContact(user.id, normalized, `Scanned via WhatsApp`, locationStr, permanentImageUrl);
        savedCount++;

        // 📧 Auto-Followup Trigger (If Email exists)
        if (normalized.email) {
          // Automation Hook: Sync to Marketing List
          marketingController.syncContactToDefaultList(user.id, normalized)
            .catch(e => console.error('[WhatsApp Sync Hook Error]', e.message));

          // Send after a short delay (10 seconds for demo, can be longer for prod)
          setTimeout(() => {
            sendFollowupEmail({ ...normalized, id: contactId, location_context: locationStr })
              .catch(err => console.error('[AutoFollowup] Delayed trigger failed:', err.message));
          }, 10000);
        }
      }
    }

    // Update Quota by the number of NEW items found
    if (savedCount > 0) {
      await dbRunAsync('UPDATE user_quotas SET used_count = used_count + ? WHERE user_id = ?', [savedCount, user.id]);
    }

    // 7. Success Reply (REPORT MODE)
    let replyMsg = `📊 *IntelliScan Batch Report*`;
    replyMsg += `\n━━━━━━━━━━━━━━━`;
    replyMsg += `\n📦 Total Found: *${cards.length}*`;
    replyMsg += `\n✨ New: ${savedCount} | ♻️ Updated: ${duplicateCount}`;
    replyMsg += `\n📍 Location: ${locationStr}`;
    replyMsg += `\n━━━━━━━━━━━━━━━\n\n`;
    
    replyMsg += contactNames.join('\n\n');

    if (cards.length > 10) {
      replyMsg += `\n\n_...and more in your dashboard._`;
    }

    const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
    const host = req.headers.host;
    let cleanBaseUrl = `${protocol}://${host}`;

    // Safety: If host is localhost or missing, fallback to the real production site
    if (host.includes('localhost') || !host) {
      cleanBaseUrl = 'https://intelli-scan-psi.vercel.app';
    }

    // Ensure no trailing slash
    if (cleanBaseUrl.endsWith('/')) cleanBaseUrl = cleanBaseUrl.slice(0, -1);
    
    replyMsg += `\n\n🔗 *Full Data Here:* \n${cleanBaseUrl}/dashboard/contacts`;

    await sendWhatsAppReply(From, replyMsg);

    await notifyUser(user.id, {
      type: 'success',
      title: 'Batch Scan Success',
      message: `Processed ${cards.length} cards from WhatsApp photo.`
    });

  } catch (error) {
    console.error('[WhatsApp Webhook Error]', error);
    if (error.message.includes('download')) {
      await sendWhatsAppReply(From, `❌ Failed to download your photo. Please check your internet connection or try sending the image again!`);
    } else if (error.message.includes('timeout') || error.message.includes('engine')) {
      await sendWhatsAppReply(From, `⚠️ AI Error: The image was too complex or AI is slow. I'll keep trying! Check your dashboard in a minute.`);
    } else {
      await sendWhatsAppReply(From, `❌ Sorry, something went wrong while processing your request. Please try again later.`);
    }
  } finally {
    // ⚡️ FINAL RESPONSE: Always send a 200 OK TwiML to Twilio to conclude the webhook session
    try {
      res.status(200).send('<Response></Response>');
    } catch (e) {
      console.error('[WhatsApp Final Response Error]', e.message);
    }
  }
};

/**
 * Diagnostic Health Check
 */
exports.checkHealth = async (req, res) => {
  try {
    // 🚦 RACE: Fail fast if DB check hangs too long
    const healthData = await Promise.race([
      (async () => {
        const dbCheck = await dbGetAsync('SELECT COUNT(*) as count FROM whatsapp_discoveries');
        return { db: '✅ Connected', count: dbCheck?.count || 0 };
      })(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database check timed out')), 5000))
    ]);

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const hasJwtSecret = process.env.JWT_SECRET ? "✅ Found" : "❌ Missing: Set JWT_SECRET in Vercel.";
    const hasDbUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL) ? "✅ Found" : "❌ Missing: Set DATABASE_URL (Supabase) in Vercel.";
    const isEnabled = process.env.ENABLE_WHATSAPP === 'true';
    
    // Auto-detect public URL
    let baseUrl = process.env.APP_BASE_URL;
    if (!baseUrl || baseUrl.includes('localhost') || !baseUrl.startsWith('http')) {
      baseUrl = `https://${req.headers.host}`;
    }
    
    res.json({
      status: 'IntelliScan WhatsApp Diagnostic Interface',
      server_time: new Date().toISOString(),
      database: healthData.db,
      active_discoveries: healthData.count,
      service_status: isEnabled ? "✅ ACTIVE" : "❌ INACTIVE (Maintenance Mode)",
      
      critical_configuration: {
        ENABLE_WHATSAPP: isEnabled ? "✅ Correct" : "❌ Action Required: Set to 'true' in Vercel Environment Variables.",
        DATABASE_URL: hasDbUrl,
        JWT_SECRET: hasJwtSecret,
        TWILIO_ACCOUNT_SID: twilioSid ? "✅ Found" : "❌ Missing: Set TWILIO_ACCOUNT_SID in Vercel.",
        TWILIO_AUTH_TOKEN: twilioAuthToken ? "✅ Found" : "❌ Missing: Set TWILIO_AUTH_TOKEN in Vercel.",
        PUBLIC_URL: baseUrl
      },

      twilio_console_setup: {
        ACTION: "COPY the URL below and PASTE it into your Twilio Sandbox Console field: 'WHEN A MESSAGE COMES IN'",
        WEBHOOK_TARGET_URL: `${baseUrl}/api/whatsapp/webhook`,
        METHOD: "POST"
      },
      
      troubleshooting_steps: [
        "1. Open Vercel Dashboard -> Settings -> Environment Variables. Ensure 'ENABLE_WHATSAPP' is set to 'true'.",
        "2. If values were changed, you MUST Re-deploy your project for them to take effect.",
        "3. Go to Twilio Console -> Messaging -> Sandbox Settings.",
        "4. Paste the 'WEBHOOK_TARGET_URL' provided above.",
        "5. Send 'ping' to the bot from your phone. If you don't get 'Pong!', check your Vercel logs for errors."
      ]
    });
  } catch (err) {
    console.error('[WhatsApp Health Check Error]', err.message);
    res.status(500).json({ 
      status: 'error', 
      error: err.message,
      recommendation: "If this error persists, ensure your database connection is active and stable."
    });
  }
};

/**
 * Helper to find a duplicate contact
 */
async function findExistingContact(userId, email, name) {
  if (!email && !name) return null;
  const q = email 
    ? 'SELECT id, notes, location_context FROM contacts WHERE user_id = ? AND LOWER(email) = LOWER(?) LIMIT 1'
    : 'SELECT id, notes, location_context FROM contacts WHERE user_id = ? AND LOWER(name) = LOWER(?) LIMIT 1';
  return await dbGetAsync(q, email ? [userId, email] : [userId, name]);
}

/**
 * Internal helper to send a WhatsApp message back via Twilio
 * Handles automatic chunking for messages over 1600 characters
 * Supports optional mediaUrl for sending attachments (images, docs, etc.)
 */
async function sendWhatsAppReply(to, message, mediaUrl = null) {
  try {
    const client = getTwilioClient();
    const MAX_LENGTH = 1500; // Leave buffer for metadata

    let twilioFrom = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886';
    if (!twilioFrom.startsWith('whatsapp:')) {
      twilioFrom = `whatsapp:${twilioFrom}`;
    }

    // ✂️ Chunking Logic (Only if message is too long and no media is attached to avoid multiple media sends)
    if (message.length <= MAX_LENGTH || mediaUrl) {
      const msgData = {
        from: twilioFrom,
        to: to,
        body: message
      };
      
      if (mediaUrl) {
        msgData.mediaUrl = [mediaUrl];
      }

      await client.messages.create(msgData);
    } else {
      const parts = [];
      let current = message;
      while (current.length > 0) {
        parts.push(current.substring(0, MAX_LENGTH));
        current = current.substring(MAX_LENGTH);
      }

      for (let i = 0; i < parts.length; i++) {
        await client.messages.create({
          from: twilioFrom,
          to: to,
          body: `[Part ${i + 1}/${parts.length}]\n` + parts[i]
        });
        // Tiny delay to preserve order in WhatsApp
        await new Promise(r => setTimeout(r, 500));
      }
    }
  } catch (err) {
    console.error('[Twilio Send Error]', err.message);
  }
}

/**
 * Downloads a binary media file from Twilio and converts to Base64
 */
async function downloadImageAsBase64(url) {
  const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
  const response = await fetch(url, { headers: { 'Authorization': `Basic ${auth}` } });
  if (!response.ok) throw new Error(`Failed to download media: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

/**
 * Internal helper to save the contact to DB
 */
async function saveContact(userId, card, customNotes = '', locationContext = '', imageUrl = null) {
  const result = await dbRunAsync(`
    INSERT INTO contacts (
      user_id, name, email, phone, company, job_title, confidence, 
      notes, engine_used, inferred_industry, inferred_seniority, location_context,
      name_native, company_native, title_native, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    userId, card.name, card.email || '', card.phone || '', card.company || '', 
    card.title || '', card.confidence || 95, 
    customNotes || 'Scanned via WhatsApp', card.engine_used || 'WhatsApp AI Bot',
    card.inferred_industry || null, card.inferred_seniority || null,
    locationContext,
    card.name_native || null, card.company_native || null, card.title_native || null,
    imageUrl
  ]);
  return result.lastID;
}
