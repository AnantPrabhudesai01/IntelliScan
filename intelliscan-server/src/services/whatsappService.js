const twilio = require('twilio');
const { normalizePhone } = require('../utils/auth');

/**
 * WhatsApp Messaging Service
 * 
 * Handles all outbound WhatsApp communications via Twilio.
 */

// Initialize Twilio Client (Lazily)
let twilioClient;
function getTwilioClient() {
  if (!twilioClient) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('[WhatsAppService] Missing Twilio credentials. Messages will be logged to console only.');
      return null;
    }
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID, 
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
}

/**
 * Standardizes a number for Twilio's WhatsApp format
 */
function toTwilioWhatsApp(phone) {
  let clean = normalizePhone(phone);
  if (!clean.startsWith('whatsapp:')) {
    clean = `whatsapp:${clean}`;
  }
  return clean;
}

/**
 * Sends a direct WhatsApp message
 */
async function sendMessage(to, body) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886';
  const whatsappFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
  const whatsappTo = toTwilioWhatsApp(to);

  if (!client) {
    console.log(`[WhatsAppService][MOCK] Sending to ${whatsappTo}: ${body}`);
    return { sid: 'MOCK_' + Date.now(), status: 'queued' };
  }

  try {
    const message = await client.messages.create({
      from: whatsappFrom,
      to: whatsappTo,
      body: body
    });
    console.log(`[WhatsAppService] Message sent to ${whatsappTo}: ${message.sid}`);
    return message;
  } catch (err) {
    console.error(`[WhatsAppService] Failed to send to ${whatsappTo}:`, err.message);
    throw err;
  }
}

/**
 * Sends a specialized OTP message
 */
async function sendOTP(to, code) {
  const body = `*IntelliScan Verification*\n\nYour 6-digit security code is: *${code}*\n\nThis code expires in 10 minutes. If you did not request this, please ignore this message.`;
  return await sendMessage(to, body);
}

module.exports = {
  sendMessage,
  sendOTP,
  normalizeWhatsApp: toTwilioWhatsApp
};
