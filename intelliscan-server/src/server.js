const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { bootstrap } = require('./boot');
const { setIo } = require('./services/notificationService');
const { PORT } = require('./config/constants');
const marketingController = require('./controllers/marketingController');
const { dbAllAsync, dbRunAsync, isPostgres, sql: sqlDialect } = require('./utils/db');

/**
 * ══════════════════════════════════════════════════════════════════
 * SERVER INITIALIZATION (HTTP + Socket.IO)
 * ══════════════════════════════════════════════════════════════════
 */
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()),
    credentials: true
  }
});

// Pass Socket.IO instance to notification service
setIo(io);

/**
 * ══════════════════════════════════════════════════════════════════
 * BACKGROUND SCHEDULERS (Disabled for Vercel/Serverless)
 * ══════════════════════════════════════════════════════════════════
 */
function startSchedulers() {
  if (process.env.NODE_ENV === 'test' || process.env.VERCEL) return;

  console.log('⏰ Production Schedulers Active');

  // Sequence Scheduler (every 15 min)
  setInterval(() => marketingController.processPendingSequences(), 15 * 60 * 1000);
  
  // Scheduled Campaign Sender (every 60s)
  setInterval(async () => {
    try {
      const now = new Date().toISOString();
      const campaigns = await dbAllAsync(`SELECT id FROM email_campaigns WHERE status = 'scheduled' AND scheduled_at <= ?`, [now]);
      for (const c of campaigns) {
        await dbRunAsync("UPDATE email_campaigns SET status = 'sending' WHERE id = ?", [c.id]);
        marketingController.processCampaignSending(c.id);
      }
    } catch (err) {
      console.error("[Campaign Job Error]", err.message);
    }
  }, 60000);

  // Calendar Reminders (every 5 min)
  setInterval(async () => {
    try {
      await dbAllAsync(isPostgres ? `
        SELECT r.*, e.title, e.start_datetime, u.email as user_email
        FROM event_reminders r
        JOIN calendar_events e ON r.event_id = e.id
        JOIN users u ON r.user_id = u.id
        WHERE r.sent_at IS NULL
        AND (e.start_datetime - (r.minutes_before || ' minutes')::interval) <= CURRENT_TIMESTAMP
        AND e.start_datetime > CURRENT_TIMESTAMP
      ` : `
        SELECT r.*, e.title, e.start_datetime, u.email as user_email
        FROM event_reminders r
        JOIN calendar_events e ON r.event_id = e.id
        JOIN users u ON r.user_id = u.id
        WHERE r.sent_at IS NULL
        AND ${sqlDialect.now} >= datetime(e.start_datetime, '-' || r.minutes_before || ' minutes')
      `);
    } catch (err) {
      console.error("[Reminder Job Error]", err.message);
    }
  }, 5 * 60 * 1000);
}

/**
 * ══════════════════════════════════════════════════════════════════
 * PORT LISTENER & BOOTSTRAP
 * ══════════════════════════════════════════════════════════════════
 */
httpServer.listen(PORT, async () => {
  console.log(`\n🚀 IntelliScan Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready | Env: ${process.env.NODE_ENV || 'development'}`);
  
  // Trigger Boot Sequence
  await bootstrap();
  
  // Initialize background tasks
  startSchedulers();
  
  console.log('\n----------------------------------------\n');
});

module.exports = { httpServer, io };
