/**
 * Vercel Root API Gateway (Flatten & Serve)
 * 
 * This file is seated at the project root.
 * It imports the main Express server from ../intelliscan-server/src/app.
 */
const app = require('../intelliscan-server/src/app');

// Export the app as a serverless function
module.exports = app;
