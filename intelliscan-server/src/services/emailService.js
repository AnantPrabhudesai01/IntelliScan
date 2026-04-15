const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a professional follow-up email to the scanned contact
 */
async function sendFollowupEmail(contact, options = {}) {
  // 1. Basic Validation
  if (!contact.email) {
    console.log(`[EmailService] Skipping follow-up for ${contact.name}: No email found.`);
    return;
  }

  const senderName = process.env.SMTP_FROM_NAME || 'IntelliScan Team';
  const meetingLocation = contact.location_context || 'our meeting';

  const mailOptions = {
    from: `"${senderName}" <${process.env.SMTP_USER}>`,
    to: contact.email,
    subject: `Great meeting you at ${meetingLocation}!`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
        <h2 style="color: #4f46e5;">Nice meeting you!</h2>
        <p>Hi <b>${contact.name}</b>,</p>
        <p>It was a pleasure connecting with you today at <b>${meetingLocation}</b>. I wanted to send a quick note to say thank you for your time.</p>
        
        <p>I've saved your contact details in my IntelliScan CRM. Below IS what I have on file:</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin: 5px 0;"><b>Company:</b> ${contact.company || '—'}</p>
          <p style="margin: 5px 0;"><b>Title:</b> ${contact.job_title || contact.title || '—'}</p>
        </div>

        <p>I look forward to keeping in touch. Please don't hesitate to reach out if there's anything I can help you with.</p>
        
        <br />
        <p>Best Regards,</p>
        <p><b>Anant Prabhudesai</b><br />
        <span style="color: #777;">Sent via IntelliScan AI</span></p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">
          This is an automated follow-up from IntelliScan. Ready to digitize your networking? Visit intelliscan.io
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Follow-up sent to ${contact.email}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[EmailService] Failed to send email to ${contact.email}:`, err.message);
    throw err;
  }
}

module.exports = {
  transporter,
  sendFollowupEmail
};
