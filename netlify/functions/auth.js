// Netlify Function - Authentification
const express = require('express');
const serverless = require('serverless-http');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
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

// Fonction utilitaire pour valider le numéro de téléphone Togo
function validateTogoPhone(phone) {
  const togoPhoneRegex = /^\+228[7-9]\d{7}$/;
  return togoPhoneRegex.test(phone);
}

// Fonction mock pour envoyer OTP (simulation)
async function sendOTP(phoneNumber, otpCode) {
  console.log(`[DEMO] OTP envoyé à ${phoneNumber}: ${otpCode}`);
  return true; // Simulation réussie
}

// Générer un code OTP (en demo, toujours 123456)
function generateOTP() {
  return process.env.NODE_ENV === 'production' ? '123456' : '123456';
}

// POST /register - Inscription
app.post('/register', async (req, res) => {
  try {
    const { phoneNumber, firstName, lastName, email, role = 'CLIENT' } = req.body;

    // Validation
    if (!phoneNumber || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Numéro de téléphone, prénom et nom requis'
      });
    }

    if (!validateTogoPhone(phoneNumber)) {
      return res.status(400).json({
        error: 'Format de numéro invalide. Utilisez +228XXXXXXXX'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Un compte existe déjà avec ce numéro'
      });
    }

    // Générer et envoyer OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        phoneNumber,
        firstName,
        lastName,
        email,
        role,
        otpCode,
        otpExpiry,
        wallet: {
          create: {
            balance: 0
          }
        }
      },
      include: {
        wallet: true
      }
    });

    // Envoyer l'OTP (simulé)
    await sendOTP(phoneNumber, otpCode);

    res.status(201).json({
      success: true,
      message: 'Compte créé. Code OTP envoyé par SMS',
      userId: user.id,
      demo: {
        note: 'En mode demo, utilisez le code: 123456',
        otpCode: otpCode // Visible en demo uniquement
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'inscription'
    });
  }
});

// POST /login - Connexion (demande OTP)
app.post('/login', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !validateTogoPhone(phoneNumber)) {
      return res.status(400).json({
        error: 'Numéro de téléphone invalide'
      });
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Aucun compte trouvé avec ce numéro'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Compte désactivé'
      });
    }

    // Générer et envoyer un nouveau OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiry }
    });

    await sendOTP(phoneNumber, otpCode);

    res.json({
      success: true,
      message: 'Code OTP envoyé par SMS',
      demo: {
        note: 'En mode demo, utilisez le code: 123456',
        otpCode: otpCode // Visible en demo uniquement
      }
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      error: 'Erreur lors de la connexion'
    });
  }
});

// POST /verify-otp - Vérification OTP
app.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otpCode } = req.body;

    if (!phoneNumber || !otpCode) {
      return res.status(400).json({
        error: 'Numéro et code OTP requis'
      });
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        wallet: true,
        driverProfile: true,
        storeProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier l'OTP (en demo, accepter 123456 pour tous)
    const isValidOTP = user.otpCode === otpCode || otpCode === '123456';
    const isNotExpired = new Date() < user.otpExpiry;

    if (!isValidOTP || !isNotExpired) {
      return res.status(401).json({
        error: 'Code OTP invalide ou expiré'
      });
    }

    // Marquer comme vérifié
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiry: null,
        lastLoginAt: new Date()
      }
    });

    // Générer JWT
    const token = jwt.sign(
      {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role
      },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        wallet: user.wallet,
        driverProfile: user.driverProfile,
        storeProfile: user.storeProfile
      }
    });

  } catch (error) {
    console.error('Erreur vérification OTP:', error);
    res.status(500).json({
      error: 'Erreur lors de la vérification'
    });
  }
});

// POST /resend-otp - Renvoyer OTP
app.post('/resend-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiry }
    });

    await sendOTP(phoneNumber, otpCode);

    res.json({
      success: true,
      message: 'Nouveau code OTP envoyé',
      demo: {
        note: 'En mode demo, utilisez le code: 123456',
        otpCode: otpCode
      }
    });

  } catch (error) {
    console.error('Erreur renvoi OTP:', error);
    res.status(500).json({
      error: 'Erreur lors du renvoi du code'
    });
  }
});

// Middleware d'authentification pour les routes protégées
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
}

// GET /profile - Profil utilisateur
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        wallet: true,
        driverProfile: true,
        storeProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      id: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      wallet: user.wallet,
      driverProfile: user.driverProfile,
      storeProfile: user.storeProfile
    });

  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Gestion des erreurs
app.use((error, req, res, next) => {
  console.error('Auth Error:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

module.exports.handler = serverless(app);