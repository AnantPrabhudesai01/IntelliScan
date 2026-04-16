// api/index.js
const app = require('../intelliscan-server/src/app');

// Vercel handles the request by passing it to the exported Express app
module.exports = app;