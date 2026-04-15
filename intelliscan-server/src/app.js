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

// ══════════════════════════════════════════════════════════════════
// MODULE IMPORTS — Database, Utilities, Config
// ══════════════════════════════════════════════════════════════════
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

// Controllers
const scanController = require('./controllers/scanController');
const cardController = require('./controllers/cardController');

// ══════════════════════════════════════════════════════════════════
// EXPRESS APP INITIALIZATION
// ══════════════════════════════════════════════════════════════════
const app = express();
app.set('trust proxy', 1);

// Configuration
configurePassport();

// ══════════════════════════════════════════════════════════════════
// GLOBAL MIDDLEWARE
// ══════════════════════════════════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(passport.initialize());

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);

// ══════════════════════════════════════════════════════════════════
// STATIC ASSETS
// ══════════════════════════════════════════════════════════════════
// Note: __dirname in src/app.js is intelliscan-server/src
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// WhatsApp Bot Integration (Modular Toggle)
if (process.env.ENABLE_WHATSAPP === 'true') {
  const whatsappRouter = require('./routes/whatsapp');
  app.use('/api/webhooks/whatsapp', (req, res, next) => {
    try {
      const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | From: ${req.body?.From || 'N/A'} | Body: ${req.body?.Body || ''}\n`;
      fs.appendFileSync(path.join(__dirname, '../webhook_debug.log'), logEntry);
    } catch (e) { console.error('Logging Error:', e); }
    next();
  }, whatsappRouter);
}

app.get('/api/my-card', authenticateToken, cardController.getMyCard);

// Analytics 
app.post('/api/user/analytics/log', (req, res) => res.json({ success: true }));

// Error Handling
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
