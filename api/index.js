/**
 * Vercel De-Framework API Gateway (Root)
 * 
 * This file is seated permanently at the project root.
 * It imports the main Express server from ../intelliscan-server/src/app.
 */
const app = require('../intelliscan-server/src/app');

// Export the app as a serverless function
module.exports = app;
