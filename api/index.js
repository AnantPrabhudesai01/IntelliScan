/**
 * Vercel Monolithic API Gateway (Forced Runtime)
 * 
 * This file is seated at the root but copied to dist/api for deployment.
 * It imports the main Express server from ../../intelliscan-server/src/app.
 */
const app = require('../../intelliscan-server/src/app');

// Export the app as a serverless function
module.exports = app;
