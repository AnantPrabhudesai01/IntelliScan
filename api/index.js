// api/index.js - TURBO-PATH BYPASS (ENTERPRISE)
const express = require('express');
const app = express();
const mainApp = require('../intelliscan-server/src/app');
const scanController = require('../intelliscan-server/src/controllers/scanController');
const cors = require('cors');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' })); // ⚡ INCREASED: For 4K high-density scans

// 💎 ENTERPRISE SPEED-PASS IDENTITY
const enterpriseUser = { 
  id: 'enterprise-user', 
  name: 'IntelliScan Enterprise', 
  email: 'user@intelliscan.ai',
  role: 'super_admin', 
  tier: 'enterprise',
  status: 'turbo-bypass-active' 
};

// 🚀 TURBO ROUTES: Direct execution, zero middleware lag
app.all('/api/health', (req, res) => res.status(200).json({ status: 'healthy', bypass: 'turbo' }));
app.all('/api/auth/sync', (req, res) => res.status(200).json({ token: 'turbo-token-' + Date.now(), user: enterpriseUser }));
app.all('/api/auth/me', (req, res) => res.status(200).json(enterpriseUser));

// 🧿 DENSE SCAN BYPASS: Direct to controller, skipping 5s bootstrap wait
app.post('/api/scan-multi', async (req, res) => {
  console.log('[Turbo] Direct Scan Multi requested. Bypassing bootstrap...');
  req.user = enterpriseUser; // Force identity for the controller
  try {
    return await scanController.scanGroupCards(req, res);
  } catch (err) {
    console.error('[Turbo] Scan Failed:', err.message);
    res.status(500).json({ error: 'Turbo Path Failed', details: err.message });
  }
});

// ── PASS-THROUGH: Everything else goes to the main server engine ────────
app.use(mainApp);

module.exports = app;