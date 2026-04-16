const express = require('express');
const router = express.Router();
const { dbGetAsync, isPostgres } = require('../utils/db');
const os = require('os');

/**
 * GET /api/system/health
 * Comprehensive diagnostic check for platform health.
 */
router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    system: {
      platform: os.platform(),
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024) + 'MB',
        free: Math.round(os.freemem() / 1024 / 1024) + 'MB'
      }
    },
    services: {
      database: 'unknown',
      ai_engine: 'online',
      messaging: 'online'
    }
  };

  try {
    // 1. Database Check
    await dbGetAsync('SELECT 1');
    health.services.database = isPostgres ? 'PostgreSQL (Active)' : 'SQLite (Active)';
  } catch (err) {
    health.status = 'degraded';
    health.services.database = 'offline: ' + err.message;
  }

  // 2. Env Connectivity Checks
  health.services.ai_engine = process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY ? 'connected' : 'mock_mode';
  health.services.messaging = process.env.TWILIO_ACCOUNT_SID ? 'connected' : 'mock_mode';

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
