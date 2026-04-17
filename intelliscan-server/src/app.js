const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

/**
 * Express App Configuration
 * 
 * Global Crash Recovery — ensures every "Shadow Crash" is logged
 */
process.on('uncaughtException', (err) => {
  console.error('🔥 FATAL UNCAUGHT EXCEPTION:', err.stack);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 FATAL UNHANDLED REJECTION:', reason);
});

const { db, pgPool } = require('./utils/db');
const { configurePassport } = require('./config/passport');
const { authenticateToken } = require('./middleware/auth');

// Modular Routers
const authRouter = require('./routes/auth');
const scanRouter = require('./routes/scan');
const contactsRouter = require('./routes/contacts');
const billingRouter = require('./routes/billing');
const userRouter = require('./routes/user');
const eventsRouter = require('./routes/events');
const draftsRouter = require('./routes/drafts');
const routingRulesRouter = require('./routes/routingRules');
const chatsRouter = require('./routes/chats');
const notificationsRouter = require('./routes/notifications');
const crmRouter = require('./routes/crm');
const dealsRouter = require('./routes/deals');
const aiRouter = require('./routes/ai');
const webhooksRouter = require('./routes/webhooks');
const adminRouter = require('./routes/admin');
const marketingRouter = require('./routes/marketing');
const calendarRouter = require('./routes/calendar');
const workspaceRouter = require('./routes/workspaceRoutes');
const cronRouter = require('./routes/cron');
const cardRouter = require('./routes/cardRouter');
const coachRouter = require('./routes/coach');
const analyticsRouter = require('./routes/analytics');
const systemRouter = require('./routes/system');
const publicRouter = require('./routes/public');
const integrationsRouter = require('./routes/integrations');

// Controllers
const scanController = require('./controllers/scanController');
const cardController = require('./controllers/cardController');

const app = express();
app.set('trust proxy', 1);

// Passport Auth Config
configurePassport();

// ══════════════════════════════════════════════════════════════════
// SERVERLESS SELF-HEALING BOOT (fixes Vercel missing tables)
// ══════════════════════════════════════════════════════════════════
const { bootstrap } = require('./boot');
let isBootstrapped = false;
let bootPromise = null;

app.use(async (req, res, next) => {
  // ⚡ Bypassing bootstrap for diagnostic routes to keep status visible
  const isDiagnostic = req.path.includes('/health') || req.path.includes('/public');
  if (isBootstrapped || isDiagnostic) return next();
  
  // Prevent parallel boot calls
  if (!bootPromise) {
    console.log('[System] Triggering cold-start database bootstrap...');
    bootPromise = bootstrap().then(() => {
      isBootstrapped = true;
      bootPromise = null;
      console.log('[System] Bootstrap complete. Ready for traffic.');
    }).catch(err => {
      bootPromise = null;
      console.error('❌ Critical Boot Failure:', err.message);
      // We don't throw here to avoid crashing the whole process; 
      // let the route handler decide what to do if tables are missing.
    });
  }
  
  // If we're not a diagnostic route, wait for the boot to finish
  if (bootPromise) {
    await Promise.race([
      bootPromise,
      new Promise(resolve => setTimeout(resolve, 8000)) // Don't block for more than 8s (Vercel limit)
    ]);
  }
  next();
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Request Parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(passport.initialize());

// API Rate Limiting (Prevents abuse)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);

// Static Asset Serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ══════════════════════════════════════════════════════════════════
// API ROUTE MOUNTING
// ══════════════════════════════════════════════════════════════════

// Health Check & System Diagnostics
app.use('/api/system', systemRouter);
app.use('/api/public', publicRouter); // Standardized Public Gateway
app.get('/api/health', (req, res) => res.redirect('/api/system/health')); // Compatibility redirect

app.use('/api/auth', authRouter);
app.use('/api/billing', billingRouter);
app.use('/api/scan', scanRouter);
app.post('/api/scan-multi', authenticateToken, scanController.scanGroupCards);
app.use('/api/contacts', contactsRouter);
app.use('/api/user', userRouter);
app.use('/api/access', userRouter); 
app.use('/api/events', eventsRouter);
app.use('/api/drafts', draftsRouter);
app.use('/api/routing-rules', routingRulesRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/crm', crmRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/email', marketingRouter);
app.use('/api/email-sequences', marketingRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/admin', adminRouter);
app.use('/api/marketing', marketingRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/coach', coachRouter);
app.use('/api/workspaces', workspaceRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/cron', cronRouter);
app.use('/api/cards', cardRouter);

// WhatsApp Integration (Healthy by Default for Diagnostics)
const whatsappRouter = require('./routes/whatsapp');
app.use('/api/whatsapp', whatsappRouter);

app.get('/api/my-card', authenticateToken, cardController.getMyCard);

app.use('/api/analytics', analyticsRouter);
app.use('/api/signals', analyticsRouter);
app.use('/api/integrations', integrationsRouter);

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
