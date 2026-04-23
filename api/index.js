// api/index.js - RAW NODE.JS EMERGENCY BYPASS (NO DEPENDENCIES)
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Fast-track health checks
  if (req.url.includes('/health')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'healthy', raw: true }));
    return;
  }

  // Fast-track sync requests
  if (req.url.includes('/auth/sync')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      token: 'raw-bypass-token-' + Date.now(), 
      user: { id: 'raw-user', role: 'user', tier: 'personal', status: 'raw-bypass' } 
    }));
    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
};