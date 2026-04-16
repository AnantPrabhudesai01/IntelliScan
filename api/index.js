/**
 * Vercel Monolithic API Gateway
 * 
 * This file is nested inside dist/api during the build phase.
 * It imports the main Express server from ../../intelliscan-server/src/app.
 */
const app = require('../../intelliscan-server/src/app');

// Export the app as a serverless function
module.exports = app;
