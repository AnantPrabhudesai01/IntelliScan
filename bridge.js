/**
 * Vercel Absolute Isolation Gateway (Bridge)
 * 
 * Seated at the project root to avoid folder collisions.
 * This file IMPORTs the main Express application as an ESM module.
 */
const app = require('./intelliscan-server/src/app');

// Export the app as a serverless function handler
module.exports = (req, res) => {
  // Pass control to the Express application
  return app(req, res);
};
