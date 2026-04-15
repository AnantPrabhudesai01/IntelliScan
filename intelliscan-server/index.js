const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

// ══════════════════════════════════════════════════════════════════
// MODULE IMPORTS — Database, Utilities, Services
// ══════════════════════════════════════════════════════════════════
const { db, pgPool, dbGetAsync, dbAllAsync, dbRunAsync, isPostgres, sql: sqlDialect } = require('./src/utils/db');
const { logAuditEvent } = require('./src/utils/logger');
const { setIo } = require('./src/services/notificationService');
const { PORT } = require('./src/config/constants');
const { configurePassport } = require('./src/config/passport');
const { seedDefaultAdmin } = require('./src/utils/adminSeeder');

// Modular Routers
const authRouter = require('./src/routes/auth');
const scanRouter = require('./src/routes/scan');
const contactsRouter = require('./src/routes/contacts');
const billingRouter = require('./src/routes/billing');
const userRouter = require('./src/routes/user');
const eventsRouter = require('./src/routes/events');
const draftsRouter = require('./src/routes/drafts');
const routingRulesRouter = require('./src/routes/routingRules');
const chatsRouter = require('./src/routes/chats');
const notificationsRouter = require('./src/routes/notifications');
const crmRouter = require('./src/routes/crm');
const dealsRouter = require('./src/routes/deals');
const aiRouter = require('./src/routes/ai');
const webhooksRouter = require('./src/routes/webhooks');
const adminRouter = require('./src/routes/admin');
const marketingRouter = require('./src/routes/marketing');
const calendarRouter = require('./src/routes/calendar');
const searchRouter = require('./src/routes/search');
const workspaceRouter = require('./src/routes/workspaceRoutes');
const { buildAccessProfile, authenticateToken } = require('./src/middleware/auth');

// Controllers (for background jobs)
const marketingController = require('./src/controllers/marketingController');

// ══════════════════════════════════════════════════════════════════
// EXPRESS APP + HTTP SERVER + SOCKET.IO
// ══════════════════════════════════════════════════════════════════
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()),
    credentials: true
  }
});

// Configure Passport Strategies
configurePassport();

// Pass Socket.IO instance to notification service
setIo(io);

// ══════════════════════════════════════════════════════════════════
// GLOBAL MIDDLEWARE
// ══════════════════════════════════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: false, // Required for complex SPA if served locally
}));
app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Passport Initialization (for SSO strategies)
app.use(passport.initialize());

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);

// ══════════════════════════════════════════════════════════════════
// STATIC ASSETS & FRONTEND SERVING
// ══════════════════════════════════════════════════════════════════
// Serve user uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve production frontend build if available
const clientBuildPath = path.join(__dirname, 'client/dist');
app.use(express.static(clientBuildPath));

// ══════════════════════════════════════════════════════════════════
// MODULAR ROUTE MOUNTING
// ══════════════════════════════════════════════════════════════════
// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db_connected: !!(db || pgPool)
  });
});

app.use('/api/auth', authRouter);
app.use('/api/billing', billingRouter);
app.use('/api/scan', scanRouter);
// Explicitly map /api/scan-multi to the group scan controller method
const scanController = require('./src/controllers/scanController');
app.post('/api/scan-multi', authenticateToken, scanController.scanGroupCards);
app.use('/api/contacts', contactsRouter);
app.use('/api/user', userRouter);
app.use('/api/access', userRouter); // Mount at /api/access as well for /me
app.use('/api/events', eventsRouter);
app.use('/api/drafts', draftsRouter);
app.use('/api/routing-rules', routingRulesRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/crm', crmRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/email-sequences', marketingRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/admin', adminRouter);
app.use('/api/marketing', marketingRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/coach', require('./src/routes/coach'));
app.use('/api/workspaces', workspaceRouter);
app.use('/api/workspace', workspaceRouter);
const cardRouter = require('./src/routes/cardRouter');
const cardController = require('./src/controllers/cardController');
app.use('/api/cards', cardRouter);
app.get('/api/my-card', authenticateToken, cardController.getMyCard);
// Analytics Logging — Consolidated to prevent proxy timeouts
const analyticsRouter = express.Router();
analyticsRouter.post('/analytics/log', (req, res) => res.status(200).json({ success: true }));
app.use('/api', analyticsRouter);
app.post('/api/user/analytics/log', (req, res) => res.json({ success: true }));

// Explicitly handle the frontend's preferred access path
app.get('/api/access/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await dbGetAsync('SELECT role, tier FROM users WHERE id = ?', [req.user.id]);
    const profile = buildAccessProfile(userResult?.role || req.user.role || 'user', userResult?.tier || req.user.tier || 'personal');
    res.json(profile);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('*splat', (req, res) => {
  if (!req.url.startsWith('/api/')) {
    res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
      if (err) res.status(404).json({ error: 'Endpoint not found' });
    });
  } else {
    // If it's an API route that didn't match anything above, return 404 instead of hanging
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

// ══════════════════════════════════════════════════════════════════
// BACKGROUND SCHEDULERS
// ══════════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'test') {
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
      const upcoming = await dbAllAsync(isPostgres ? `
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

// ══════════════════════════════════════════════════════════════════
// ERROR HANDLING & SERVER START
// ══════════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Startup Bootstrapping
httpServer.listen(PORT, async () => {
  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created missing uploads directory');
  }

  console.log(`\n🚀 IntelliScan Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready | Env: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize Database Connectivity Check & Seed Default Admin
  try {
    const dbStatus = await dbAllAsync('SELECT 1');
    if (dbStatus) {
      console.log('✅ Base Database connection verified.');
      
      // Automatic Schema Sync for missing columns
      try {
        await dbRunAsync("ALTER TABLE user_quotas ADD COLUMN IF NOT EXISTS group_limit_amount INTEGER DEFAULT 1");
        
        // Ensure billing tables exist for Pro upgrades
        if (isPostgres) {
          await dbRunAsync(`
            CREATE TABLE IF NOT EXISTS billing_orders (
              id SERIAL PRIMARY KEY,
              user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
              workspace_id VARCHAR(255),
              plan_id VARCHAR(50),
              amount_paise INTEGER,
              currency VARCHAR(10),
              razorpay_order_id VARCHAR(100),
              razorpay_payment_id VARCHAR(100),
              razorpay_signature TEXT,
              status VARCHAR(50),
              simulated INTEGER DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await dbRunAsync(`
            CREATE TABLE IF NOT EXISTS billing_invoices (
              id SERIAL PRIMARY KEY,
              workspace_id VARCHAR(255),
              invoice_number VARCHAR(100),
              amount_cents INTEGER,
              currency VARCHAR(10),
              status VARCHAR(50),
              issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await dbRunAsync(`
            CREATE TABLE IF NOT EXISTS digital_cards (
              id SERIAL PRIMARY KEY,
              user_id INTEGER UNIQUE,
              url_slug TEXT UNIQUE,
              bio TEXT,
              headline TEXT,
              design_json JSONB,
              views INTEGER DEFAULT 0,
              saves INTEGER DEFAULT 0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
        }
        
        console.log('✅ Schema Synchronized: user_quotas & billing updated.');
      } catch (schemaErr) {
        console.warn('⚠️  Schema sync warning:', schemaErr.message);
      }

      await seedDefaultAdmin();
      
      // Ensure 'openrouter' exists in ai_models
      const orCheck = await dbGetAsync("SELECT id FROM ai_models WHERE type = 'openrouter'");
      if (!orCheck) {
        await dbRunAsync("INSERT INTO ai_models (name, type, status) VALUES ('OpenRouter Free', 'openrouter', 'deployed')");
        console.log('🤖 Seeded OpenRouter fallback engine.');
      }
      
      const existingModels = await dbAllAsync('SELECT id FROM ai_models LIMIT 1');
      if (!existingModels || existingModels.length === 0) {
        await dbRunAsync("INSERT INTO ai_models (name, type, status) VALUES ('Gemini 1.5 Flash', 'gemini', 'deployed')");
        await dbRunAsync("INSERT INTO ai_models (name, type, status) VALUES ('GPT-4o Mini', 'openai', 'deployed')");
        await dbRunAsync("INSERT INTO ai_models (name, type, status) VALUES ('Tesseract OCR', 'tesseract', 'deployed')");
        console.log('🤖 Seeded default AI models.');
      }
    }
  } catch (dbErr) {
    console.warn('⚠️  Database bootstrap warning:', dbErr.message);
  }
  console.log('\n----------------------------------------\n');
});

module.exports = { app, httpServer, io };
