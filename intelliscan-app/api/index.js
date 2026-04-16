/**
 * Vercel Zero-Config API Bridge (App Scope)
 * 
 * This file acts as the primary entry point for Vercel functions.
 * It is located inside the app directory to ensure perfect monorepo alignment.
 */
const path = require('path');

// Dynamically resolve the server path to ensure resilience across environments
const serverRoot = path.resolve(__dirname, '../../intelliscan-server/src/app');
const app = require(serverRoot);

// Export the app to be handled as a serverless function by @vercel/node
module.exports = app;
