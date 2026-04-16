/**
 * Vercel Explicit API Gateway
 * 
 * Seated in the /functions folder to avoid directory-collision with /api.
 * It imports the main Express server from ../intelliscan-server/src/app.
 */
const app = require('../intelliscan-server/src/app');

// Export the app as a serverless function
module.exports = app;
