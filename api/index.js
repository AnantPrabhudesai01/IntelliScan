// api/index.js - Vercel Serverless adapter for the Express app
module.exports = (req, res) => {
  // Minimal CORS + preflight handling (Express also applies CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    // Ensure the Express app sees the expected `/api/...` prefix
    if (typeof req.url === 'string' && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }

    const app = require('../intelliscan-server/src/app');
    return app(req, res);
  } catch (err) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Server bootstrap failed',
      message: err?.message || String(err),
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined
    }));
  }
};
