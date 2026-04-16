/**
 * Vercel Root API Gateway (Relocation Ready)
 * 
 * This file sits at the root but is designed to be copied into dist/api during build.
 * It imports the main Express server using a path relative to its final destination.
 */
const app = require('../../intelliscan-server/src/app');

// Export the app as a serverless function
module.exports = app;
