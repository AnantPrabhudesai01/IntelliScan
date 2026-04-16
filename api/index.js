import app from '../intelliscan-server/src/app.js';
/**
 * Vercel Modern Monolith API Gateway
 * 
 * Seated at the project root.
 * It imports the main Express server from ../intelliscan-server/src/app.
 */
const app = require('../intelliscan-server/src/app');

// Export the app as a serverless function
module.exports = app;
