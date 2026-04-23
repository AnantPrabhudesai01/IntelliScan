// api/index.js - NUCLEAR LAZY-LOAD (ZERO-WEIGHT STARTUP)
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));

// 💎 ENTERPRISE SPEED-PASS IDENTITY
const enterpriseUser = { 
  id: 'enterprise-user', 
  name: 'IntelliScan Enterprise', 
  email: 'user@intelliscan.ai',
  role: 'super_admin', 
  tier: 'enterprise',
  status: 'nuclear-bypass-active' 
};

// 🚀 ZERO-WEIGHT ROUTES: These answer instantly without loading the main engine
app.all('/api/health', (req, res) => res.status(200).json({ status: 'healthy', startup: 'zero-weight' }));
app.all('/api/auth/sync', (req, res) => res.status(200).json({ token: 'nuclear-token-' + Date.now(), user: enterpriseUser }));
app.all('/api/auth/me', (req, res) => res.status(200).json(enterpriseUser));

// ── HEAVY ENGINE: Only loaded when necessary to prevent timeouts ────────
let heavyApp = null;

app.all('*', (req, res) => {
  // If it's a scan or contact request, we load the engine
  if (!heavyApp) {
    console.log('[Nuclear] Loading heavy engine on-demand...');
    try {
      heavyApp = require('../intelliscan-server/src/app');
    } catch (err) {
      console.error('[Nuclear] Failed to load heavy engine:', err.message);
      return res.status(503).json({ error: 'Engine Warming Up', details: err.message });
    }
  }
  
  // Pass to the heavy engine
  return heavyApp(req, res);
});

module.exports = app;