// api/index.js - ABSOLUTE ZERO BYPASS (X-RAY DIAGNOSTIC MODE)
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const enterpriseUser = { 
    id: 'enterprise-user', 
    name: 'IntelliScan Enterprise', 
    email: 'user@intelliscan.ai',
    role: 'super_admin', 
    tier: 'enterprise',
    status: 'absolute-zero-active' 
  };

  if (req.url.includes('/api/health')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'healthy', bypass: 'x-ray' }));
    return;
  }

  if (req.url.includes('/api/auth/sync')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ token: 'xray-token-' + Date.now(), user: enterpriseUser }));
    return;
  }

  // ── X-RAY DIAGNOSTIC: Reveal why the engine is failing ────────
  try {
    const mainApp = require('../intelliscan-server/src/app');
    // 👤 Identity Anchor: Returns current user info
    if (req.url.startsWith('/api/auth/me')) {
      const user = req.user || { id: 'zero-user', name: 'X-Ray Admin', role: 'super_admin' };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(user));
    }

    // 🚀 REST API Bridge (Legacy Express)
    return mainApp(req, res);
  } catch (err) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    // 🔍 This prints the EXACT error into your network tab response!
    res.end(JSON.stringify({ 
      error: 'Engine Crash Detected', 
      message: err.message,
      stack: err.stack,
      hint: 'Please screenshot this response and send it to me!'
    }));
  }
};