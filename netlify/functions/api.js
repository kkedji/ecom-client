// Netlify Function - Point d'entrée principal API
const express = require('express');
const serverless = require('serverless-http');
const { PrismaClient } = require('@prisma/client');

// Initialiser Prisma
const prisma = new PrismaClient();

// Créer l'app Express
const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Routes de base
app.get('/health', async (req, res) => {
  try {
    // Test de connexion à la base de données
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: 'netlify-demo',
      services: {
        database: 'connected',
        api: 'operational'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

app.get('/info', (req, res) => {
  res.json({
    name: 'Ecom Backend API',
    version: '1.0.0',
    description: 'API Backend pour l\'application Ecom Togo',
    endpoints: {
      auth: '/.netlify/functions/auth/*',
      wallet: '/.netlify/functions/wallet/*',
      transport: '/.netlify/functions/transport/*',
      marketplace: '/.netlify/functions/marketplace/*',
      webhooks: '/.netlify/functions/webhooks/*'
    },
    demo: {
      users: [
        { phone: '+22812345678', role: 'CLIENT', balance: '50,000 F CFA' },
        { phone: '+22812345679', role: 'DRIVER', balance: '25,000 F CFA' },
        { phone: '+22812345680', role: 'STORE_OWNER', balance: '100,000 F CFA' }
      ],
      otp: '123456',
      store: 'Boutique Ama Fashion (3 produits)'
    }
  });
});

// Route pour initialiser la base de données
app.post('/init-db', async (req, res) => {
  try {
    console.log('Initialisation de la base de données...');
    
    // Exécuter les migrations
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec('npx prisma migrate deploy', (error, stdout, stderr) => {
        if (error) {
          console.error('Migration error:', error);
          reject(error);
        } else {
          console.log('Migration stdout:', stdout);
          resolve(stdout);
        }
      });
    });

    // Exécuter le seed
    const seed = require('../../backend/prisma/seed');
    await seed();

    res.json({
      success: true,
      message: 'Base de données initialisée avec succès',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Gestion des erreurs
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint non trouvé',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /info',
      'POST /init-db'
    ]
  });
});

// Nettoyer les connexions à la fermeture
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Exporter pour Netlify Functions
module.exports.handler = serverless(app);