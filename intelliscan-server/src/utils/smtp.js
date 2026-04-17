const nodemailer = require('nodemailer');
const { dbGetAsync } = require('./db');

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

/**
 * Creates a transporter for a specific workspace.
 * Prioritizes workspace credentials over environment variables.
 */
async function getWorkspaceTransporter(workspaceId) {
  if (!workspaceId) return createSmtpTransporterFromEnv();

  try {
    const ws = await dbGetAsync('SELECT settings_json FROM workspaces WHERE id = ?', [workspaceId]);
    if (!ws || !ws.settings_json) return createSmtpTransporterFromEnv();

    const settings = typeof ws.settings_json === 'string' ? JSON.parse(ws.settings_json) : ws.settings_json;
    const smtp = settings.smtp;

    if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
      return createSmtpTransporterFromEnv();
    }

    return {
      transporter: nodemailer.createTransport({
        host: smtp.host,
        port: parseInt(smtp.port || '587'),
        secure: smtp.port == '465',
        auth: {
          user: smtp.user,
          pass: smtp.pass
        }
      }),
      from: smtp.from_email || smtp.user,
      fromName: smtp.from_name || 'IntelliScan'
    };
  } catch (err) {
    console.error(`Error loading workspace SMTP for ${workspaceId}:`, err);
    return createSmtpTransporterFromEnv();
  }
}

/**
 * Utility to verify a configuration before saving
 */
async function testSmtpConnection(config) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: parseInt(config.port || '587'),
    secure: config.port == '465',
    auth: {
      user: config.user,
      pass: config.pass
    },
    connectTimeout: 5000
  });

  return transporter.verify();
}

module.exports = {
  createSmtpTransporterFromEnv,
  getWorkspaceTransporter,
  testSmtpConnection
};
