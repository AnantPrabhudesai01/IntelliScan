const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { bootstrap } = require('./boot');
const { setIo } = require('./services/notificationService');
const { PORT } = require('./config/constants');
const marketingController = require('./controllers/marketingController');
const { dbAllAsync, dbRunAsync, isPostgres, sql: sqlDialect } = require('./utils/db');

/**
 * Server Lifecycle Manager
 * 
 * This is the main entry point for the backend. It initializes the HTTP server,
 * sets up the real-time Socket.IO communication, and triggers the startup
 * boot sequence (DB checks, seeding, etc).
 */

const server = http.createServer(app);

// Initialize Socket.IO with standard CORS
const io = new Server(server, {
  cors: {
    origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()),
    methods: ['GET', 'POST']
  }
});

// Pass the IO instance to our notification service
setIo(io);

io.on('connection', (socket) => {
  console.debug('[Socket] New client connected:', socket.id);
  
  socket.on('join-workspace', (workspaceId) => {
    socket.join(`workspace:${workspaceId}`);
    console.debug(`[Socket] Client ${socket.id} joined workspace ${workspaceId}`);
  });

  socket.on('disconnect', () => {
    console.debug('[Socket] Client disconnected:', socket.id);
  });
});

/**
 * Start the application
 */
const startServer = async () => {
  try {
    // 1. Run the boot sequence (DB connectivity, auto-migrations, etc)
    await bootstrap();

    // 2. Start the HTTP server
    server.listen(PORT, () => {
      console.log('--------------------------------------------------');
      console.log(`🚀 IntelliScan Server running on port ${PORT}`);
      console.log(`🔗 Origin: ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}`);
      console.log(`📡 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log('--------------------------------------------------');
    });

    // 3. Initialize background tasks (if not in Vercel environment)
    if (!process.env.VERCEL) {
      console.log('[Scheduler] Initializing automated marketing workers...');
      marketingController.initWorkers();
    }

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
