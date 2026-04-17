// api/index.js
try {
  const app = require('../intelliscan-server/src/app');
  module.exports = app;
} catch (err) {
  module.exports = (req, res) => {
    console.error('[Vercel Boot Error]', err);
    res.status(500).json({
      error: 'Vercel Boot Failure',
      message: err.message,
      stack: err.stack,
      hint: 'Check if all dependencies in intelliscan-server are matched in the root package.json'
    });
  };
}