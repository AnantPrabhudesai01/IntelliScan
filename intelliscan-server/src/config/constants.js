require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is not set. Authentication will use a default insecure secret.');
}
const effectiveJwtSecret = JWT_SECRET || 'dev_only_insecure_secret_change_in_production';

module.exports = {
  JWT_SECRET: effectiveJwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  PORT: process.env.PORT || 5000,
  PERSONAL_EMAIL_DOMAINS: new Set([
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'icloud.com', 'aol.com', 'proton.me', 'protonmail.com'
  ])
};
