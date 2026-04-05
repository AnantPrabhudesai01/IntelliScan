require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret_intelliscan_key_123',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  PORT: process.env.PORT || 5000,
  PERSONAL_EMAIL_DOMAINS: new Set([
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'icloud.com', 'aol.com', 'proton.me', 'protonmail.com'
  ])
};
