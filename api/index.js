/**
 * Vercel Flattened API Gateway (Root)
 * 
 * This is the high-fidelity entry point for Vercel functions.
 * It imports the main Express app from the intelliscan-server workspace.
 */
const app = require('../intelliscan-server/src/app');

// Export the app as a serverless function
module.exports = app;
