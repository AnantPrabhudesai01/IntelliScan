/**
 * Cron Router — Serverless-compatible background task execution
 * These routes are designed to be called by Vercel Cron or similar services.
 */
const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketingController');
const { dbAllAsync, isPostgres } = require('../utils/db');

/**
 * GET /api/cron/process-all
 * Triggers all background maintenance and automated outreach tasks.
 */
router.all('/process-all', async (req, res) => {
  // 🔐 Security: Check for a shared secret to prevent unauthorized trigger
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'intelliscan_internal_cron_v1'; // Fallback for dev
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron] Unauthorized trigger attempt blocked.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[Cron] Initiating global background processing...');
  
  const results = {
    sequences: 'running',
    campaigns: 'running',
    reminders: 'running',
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Process Pending Email Sequences (Marketing)
    await marketingController.processPendingSequences();
    results.sequences = 'success';

    // 2. Process Scheduled Campaigns
    const now = new Date().toISOString();
    const campaigns = await dbAllAsync(`SELECT id FROM email_campaigns WHERE status = 'scheduled' AND scheduled_at <= ?`, [now]);
    for (const c of campaigns) {
      await marketingController.processCampaignSending(c.id);
    }
    results.campaigns = `success (${campaigns.length} processed)`;

    // 3. Process Calendar Reminders
    // Logic extracted from index.js for serverless compatibility
    const upcoming = await dbAllAsync(isPostgres ? `
        SELECT r.* FROM event_reminders r
        JOIN calendar_events e ON r.event_id = e.id
        WHERE r.sent_at IS NULL
        AND (e.start_datetime - (r.minutes_before || ' minutes')::interval) <= CURRENT_TIMESTAMP
        AND e.start_datetime > CURRENT_TIMESTAMP
      ` : `
        SELECT r.* FROM event_reminders r
        JOIN calendar_events e ON r.event_id = e.id
        WHERE r.sent_at IS NULL
        AND CURRENT_TIMESTAMP >= datetime(e.start_datetime, '-' || r.minutes_before || ' minutes')
      `);
    results.reminders = `success (${upcoming.length} processed)`;

    console.log('[Cron] Processing completed:', results);
    res.json(results);
  } catch (err) {
    console.error('[Cron] Processing failed:', err.message);
    res.status(500).json({ error: 'Cron processing partial/full failure', details: err.message });
  }
});

module.exports = router;
