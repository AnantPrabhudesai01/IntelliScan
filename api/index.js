// api/index.js (Production Gateway)
const app = require('../intelliscan-server/src/app');

// Standard Vercel Serverless Export
module.exports = (req, res) => {
  return app(req, res);
};
