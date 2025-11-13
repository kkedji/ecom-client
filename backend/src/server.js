const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const transportRoutes = require('./routes/transport');
const marketplaceRoutes = require('./routes/marketplace');
const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notifications');
const webhookRoutes = require('./routes/webhooks');
const adminRoutes = require('./routes/admin');
const verificationRoutes = require('./routes/verification');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Import services
const socketService = require('./services/socketService');

const app = express();
const server = createServer(app);

// Socket.IO CORS configuration
const socketOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://ecomapp-client.netlify.app',
      'https://ecomapp-driver.netlify.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ] 
  : ['http://localhost:3000', 'http://localhost:5173'];

const io = new Server(server, {
  cors: {
    origin: socketOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Basic middleware
app.use(helmet());
app.use(compression());

// CORS Configuration
// Autoriser localhost:3000 (Driver App) et localhost:5173 (Client App) en développement
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://ecomapp-client.netlify.app', 
      'https://ecomapp-driver.netlify.app',
      'http://localhost:3000',  // Pour les tests en développement contre la prod
      'http://localhost:5173'    // Pour les tests en développement contre la prod
    ] 
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Trop de requêtes de cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Socket.IO
socketService.init(io);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', authenticateToken, walletRoutes);
app.use('/api/transport', authenticateToken, transportRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);

// Swagger documentation (in development)
if (process.env.NODE_ENV !== 'production') {
  const swaggerJsdoc = require('swagger-jsdoc');
  const swaggerUi = require('swagger-ui-express');
  
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Ecom API',
        version: '1.0.0',
        description: 'API pour l\'application Ecom - Transport et Marketplace au Togo',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 5000}`,
          description: 'Serveur de développement',
        },
      ],
    },
    apis: ['./src/routes/*.js'],
  };
  
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint non trouvé',
    message: `L'endpoint ${req.method} ${req.originalUrl} n'existe pas`
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Serveur Ecom démarré sur le port ${PORT}`);
  console.log(`📖 Documentation API: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Mode développement activé');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('💤 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

module.exports = app;