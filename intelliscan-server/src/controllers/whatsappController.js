const twilio = require('twilio');
const { dbGetAsync, dbRunAsync } = require('../utils/db');
const { ensureQuotaRow, resolveTierLimits } = require('../utils/quota');
const { unifiedExtractionPipeline } = require('../services/aiService');
const { notifyUser } = require('../services/notificationService');
const { normalizePhone, firstNameFromFullName } = require('../utils/auth');
const { normalizeExtractedCard } = require('../utils/scanUtils');
const { hasMeaningfulContactData } = require('../utils/aiUtils');
const { sendFollowupEmail } = require('../services/emailService');
const fs = require('fs');
const path = require('path');

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
exports.handleIncomingMessage = async (req, res) => {
  const { From, Body, MediaUrl0, MediaContentType0, FromCity, FromState, FromCountry } = req.body;
  const fromPhone = normalizePhone(From);

  // ⚡️ SPEED FIX: Send 200 OK immediately to Twilio to prevent timeout
  res.status(200).send('<Response></Response>');

  // 🕵️ Proceed with processing in the background
  try {
    // 1. Resolve User
    const user = await dbGetAsync('SELECT * FROM users WHERE phone_number = ?', [fromPhone]);

    if (!user) {
      console.warn(`[WhatsApp] Unauthorized access attempt from ${fromPhone}`);
      return sendWhatsAppReply(From, `Hi! It looks like your number (${fromPhone}) isn't linked to an IntelliScan account yet.\n\nPlease add your WhatsApp number in the Settings page of the IntelliScan dashboard to start scanning! 🚀`);
    }

    // 2. Check for Commands (Export/Excel)
    const body = (Body || '').toLowerCase().trim();
    if (body === 'export' || body === 'excel' || body === 'csv') {
      const jwt = require('jsonwebtoken');
      const exportToken = jwt.sign(
        { id: user.id, purpose: 'magic_export' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
      );
      
      const domain = process.env.APP_DOMAIN || 'intelliscan.pro';
      const protocol = domain.includes('localhost') ? 'http' : 'https';
      const exportUrl = `${protocol}://${domain}/api/contacts/export/magic?token=${exportToken}`;
      
      return sendWhatsAppReply(From, `✨ *Your Magic Excel Export is ready!*\n\nThis file contains all your active contacts formatted for marketing and CRM growth.\n\n📥 *Download link:* \n${exportUrl}\n\n_(Link expires in 15 minutes)_`);
    }

    // 2. Check for Image
    if (!MediaUrl0) {
      return sendWhatsAppReply(From, `Hi ${firstNameFromFullName(user.name)}! I'm ready to scan. Just send me a photo of a business card (or a photo with multiple cards) and I'll do the rest! 📸\n\n💡 *Tip:* Type "export" anytime to receive your contacts as an Excel sheet!`);
    }


    // 3. Quota Enforcement
    const limits = resolveTierLimits(user.tier);
    await ensureQuotaRow(user.id, user.tier);
    const quota = await dbGetAsync('SELECT used_count FROM user_quotas WHERE user_id = ?', [user.id]);

    if ((quota?.used_count || 0) >= limits.single) {
      return sendWhatsAppReply(From, `⚠️ Quota Exhausted!\n\nYou've reached your limit of ${limits.single} scans for the ${user.tier.toUpperCase()} plan.`);
    }

    // 4. Download & Process Image (Background)
    console.log(`[WhatsApp] Processing Batch Scan for ${user.email}...`);
    const imageBase64 = await downloadImageAsBase64(MediaUrl0);
    
    // 5. AI Extraction (EXHAUSTIVE SCAN MODE)
    const extractionResult = await unifiedExtractionPipeline({
      imageBase64,
      mimeType: MediaContentType0 || 'image/jpeg',
      userId: user.id,
      tier: user.tier,
      prompt: `You are a world-class Business Card Extraction Engine in EXHAUSTIVE SCAN MODE.
The image may contain one or MANY separate business cards (up to 25). You MUST identify EVERY SINGLE card.

### RULES:
1. **Name Fallback**: If a person's name is NOT on the card, use the 'Company Name' as the 'name' field.
2. **Exhaustive Capture**: For EVERY CARD found, you MUST extract: name, company, title, email, phone, website, address.
3. **No Skipping**: Scan systematically from top-left to bottom-right.
4. **Validation**: Ensure phone numbers are cleaned (+123...).

Return ONLY a valid JSON object:
{
  "engine_used": "Gemini 3 Flash (Exhaustive)",
  "cards": [
    {
      "name": "Full Name or Company",
      "company": "Company Name",
      "title": "Job title",
      "email": "email",
      "phone": "+123456789",
      "website": "url",
      "address": "address",
      "confidence": 95
    }
  ]
}`
    });

    if (extractionResult.error) throw new Error(extractionResult.error);

    let cards = extractionResult.data.cards || [];
    if (cards.length === 0 && extractionResult.data.name) {
      cards = [extractionResult.data]; // Handle single object fallback
    }

    if (cards.length === 0) {
      return sendWhatsAppReply(From, `❌ Sorry, I couldn't find any clear business cards in that photo. Please try again with better lighting!`);
    }

    // 6. Persistence & Sync with Duplicacy Check
    let savedCount = 0;
    let duplicateCount = 0;
    const contactNames = [];
    const locationStr = [FromCity, FromState, FromCountry].filter(Boolean).join(', ') || 'WhatsApp';

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
        await dbRunAsync('UPDATE contacts SET scan_date = NOW(), location_context = ?, notes = ? WHERE id = ?', 
          [locationStr, `Re-scanned via WhatsApp. Previous: ${existing.notes || ''}`, existing.id]);
        duplicateCount++;
      } else {
        // Save New with Location
        const contactId = await saveContact(user.id, normalized, `Scanned via WhatsApp`, locationStr);
        savedCount++;

        // 📧 Auto-Followup Trigger (If Email exists)
        if (normalized.email) {
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

    replyMsg += `\n\n🔗 *Full Data Here:* \nhttps://${process.env.APP_DOMAIN || 'intelliscan.pro'}/dashboard/contacts`;

    await sendWhatsAppReply(From, replyMsg);

    notifyUser(user.id, {
      type: 'success',
      title: 'Batch Scan Success',
      message: `Processed ${cards.length} cards from WhatsApp photo.`
    });

  } catch (error) {
    console.error('[WhatsApp Webhook Error]', error);
    if (error.message.includes('timeout') || error.message.includes('engine')) {
      sendWhatsAppReply(From, `⚠️ AI Error: The image was too complex or AI is slow. I'll keep trying! Check your dashboard in a minute.`);
    }
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
 */
async function sendWhatsAppReply(to, message) {
  try {
    const client = getTwilioClient();
    const MAX_LENGTH = 1500; // Leave buffer for metadata

    // ✂️ Chunking Logic
    if (message.length <= MAX_LENGTH) {
      await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886',
        to: to,
        body: message
      });
    } else {
      const parts = [];
      let current = message;
      while (current.length > 0) {
        parts.push(current.substring(0, MAX_LENGTH));
        current = current.substring(MAX_LENGTH);
      }

      for (let i = 0; i < parts.length; i++) {
        await client.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886',
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
async function saveContact(userId, card, customNotes = '', locationContext = '') {
  const result = await dbRunAsync(`
    INSERT INTO contacts (
      user_id, name, email, phone, company, job_title, confidence, 
      notes, engine_used, inferred_industry, inferred_seniority, location_context
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    userId, card.name, card.email || '', card.phone || '', card.company || '', 
    card.title || '', card.confidence || 95, 
    customNotes || 'Scanned via WhatsApp', card.engine_used || 'WhatsApp AI Bot',
    card.inferred_industry || null, card.inferred_seniority || null,
    locationContext
  ]);
  return result.lastID;
}
