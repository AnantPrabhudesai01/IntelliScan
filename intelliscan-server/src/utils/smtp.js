const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter using environment variables.
 * Returns null if required variables are missing.
 */
function createSmtpTransporterFromEnv() {
  const host = String(process.env.SMTP_HOST || '').trim();
  const user = String(process.env.SMTP_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || '').trim();

  const looksLikePlaceholder =
    user.toLowerCase().includes('your-email') ||
    pass.toLowerCase().includes('your-app-password');

  if (!host || !user || !pass || looksLikePlaceholder) {
    console.warn('SMTP configuration missing (or still placeholder) in .env. Email features will run in simulated mode.');
    return null;
  }

  return {
    transporter: nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user,
        pass
      }
    }),
    from: process.env.SMTP_FROM || user
  };
}

module.exports = {
  createSmtpTransporterFromEnv
};
