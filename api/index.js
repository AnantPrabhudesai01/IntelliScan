/**
 * Vercel Flattened API Gateway (Root)
 * 
 * This file is the primary entry point for Vercel functions.
 * It imports the main Express server from within the monorepo logic.
 */
const app = require('../intelliscan-server/src/app');

// Export the app as a serverless function
module.exports = app;
