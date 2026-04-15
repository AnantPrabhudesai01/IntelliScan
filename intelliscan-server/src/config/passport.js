const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { dbGetAsync, dbRunAsync } = require('../utils/db');
const { ensureQuotaRow } = require('../utils/quota');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Configure Passport with Google OAuth 2.0 Strategy
 */
function configurePassport() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('[Passport] WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found in .env. Google SSO disabled.');
    return;
  }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: (process.env.APP_BASE_URL || 'https://intelli-scan-psi.vercel.app') + '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase();
      if (!email) return done(new Error('No email found in Google profile'), null);

      let user = await dbGetAsync('SELECT * FROM users WHERE email = ?', [email]);
      
      if (!user) {
        // Create new user for first-time SSO
        const name = profile.displayName || email.split('@')[0];
        const placeholderPass = crypto.randomBytes(24).toString('hex');
        const hashedPassword = await bcrypt.hash(placeholderPass, 12);
        
        const result = await dbRunAsync(
          "INSERT INTO users (name, email, password, role, tier) VALUES (?, ?, ?, 'user', 'personal')",
          [name, email, hashedPassword]
        );
        
        user = {
          id: result.lastID,
          name,
          email,
          role: 'user',
          tier: 'personal'
        };

        // Initialize quota
        await ensureQuotaRow(user.id, 'personal');
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  // Simple serialization/deserialization for JWT-based auth (session: false)
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await dbGetAsync('SELECT * FROM users WHERE id = ?', [id]);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

module.exports = { configurePassport };
