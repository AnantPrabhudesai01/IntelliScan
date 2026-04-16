/**
 * Vercel Zero-Config API Bridge (Root Scope)
 * 
 * This file acts as the primary entry point for Vercel functions.
 * It imports the main Express app from the intelliscan-server workspace.
 */
const app = require('../intelliscan-server/src/app');

// Export the app to be handled as a serverless function by @vercel/node
module.exports = app;
