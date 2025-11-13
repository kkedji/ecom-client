const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const smsService = require('../services/smsService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Schémas de validation
const phoneSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^(?:\+228|228)?[0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Numéro de téléphone invalide. Format attendu: +22812345678 ou 22812345678'
    })
});

const registerSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^(?:\+228|228)?[0-9]{8}$/)
    .required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().optional(),
  profileImage: Joi.string().uri().optional()
});

const verifyOtpSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^(?:\+228|228)?[0-9]{8}$/)
    .required(),
  code: Joi.string().length(6).required(),
  purpose: Joi.string().valid('REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'PHONE_VERIFICATION').required()
});

// Utilitaire pour normaliser le numéro de téléphone
const normalizePhoneNumber = (phone) => {
  // Supprimer tous les espaces et caractères spéciaux
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Si le numéro commence par +228, le garder tel quel
  if (cleaned.startsWith('+228')) {
    return cleaned;
  }
  
  // Si le numéro commence par 228, ajouter le +
  if (cleaned.startsWith('228')) {
    return '+' + cleaned;
  }
  
  // Si le numéro fait 8 chiffres, ajouter +228
  if (cleaned.length === 8) {
    return '+228' + cleaned;
  }
  
  throw new AppError('Format de numéro de téléphone invalide', 400);
};

// Générer un token JWT
const generateTokens = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET non configuré dans les variables d\'environnement');
  }
  
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Envoyer un code OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Numéro de téléphone (format Togo)
 *               purpose:
 *                 type: string
 *                 enum: [REGISTRATION, LOGIN, PASSWORD_RESET, PHONE_VERIFICATION]
 *     responses:
 *       200:
 *         description: OTP envoyé avec succès
 */
router.post('/send-otp', asyncHandler(async (req, res) => {
  const { error, value } = phoneSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { phoneNumber, purpose = 'LOGIN' } = value;
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  // Vérifier si l'utilisateur existe pour LOGIN
  if (purpose === 'LOGIN') {
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone }
    });
    
    if (!existingUser) {
      throw new AppError('Aucun compte associé à ce numéro. Veuillez créer un compte.', 404);
    }
    
    if (!existingUser.isActive) {
      throw new AppError('Ce compte a été désactivé. Contactez le support.', 403);
    }
  }

  // Vérifier si l'utilisateur existe déjà pour REGISTRATION
  if (purpose === 'REGISTRATION') {
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone }
    });
    
    if (existingUser) {
      throw new AppError('Un compte existe déjà avec ce numéro. Connectez-vous plutôt.', 409);
    }
  }

  // Supprimer les anciens codes OTP non utilisés pour ce numéro
  await prisma.otpCode.deleteMany({
    where: {
      user: {
        phoneNumber: normalizedPhone
      },
      purpose,
      isUsed: false
    }
  });

  // Générer un nouveau code OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Pour REGISTRATION, créer un utilisateur temporaire si nécessaire
  let user;
  if (purpose === 'REGISTRATION') {
    user = await prisma.user.upsert({
      where: { phoneNumber: normalizedPhone },
      update: {},
      create: {
        phoneNumber: normalizedPhone,
        firstName: 'Utilisateur',
        lastName: 'Temporaire',
        isVerified: false,
        isActive: false
      }
    });
  } else {
    user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone }
    });
  }

  // Enregistrer le code OTP
  await prisma.otpCode.create({
    data: {
      userId: user.id,
      code,
      purpose,
      expiresAt
    }
  });

  // Envoyer le SMS
  try {
    const message = `Votre code Ecom: ${code}. Valable 10 minutes. Ne partagez pas ce code.`;
    await smsService.sendSMS(normalizedPhone, message);
    
    res.json({
      success: true,
      message: 'Code OTP envoyé avec succès',
      phoneNumber: normalizedPhone,
      expiresIn: 600 // 10 minutes en secondes
    });
  } catch (smsError) {
    console.error('Erreur envoi SMS:', smsError);
    throw new AppError('Impossible d\'envoyer le SMS. Vérifiez votre numéro.', 500);
  }
}));

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Vérifier un code OTP et se connecter
 *     tags: [Auth]
 */
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { error, value } = verifyOtpSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { phoneNumber, code, purpose } = value;
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  // Trouver l'utilisateur et le code OTP
  const user = await prisma.user.findUnique({
    where: { phoneNumber: normalizedPhone },
    include: {
      otpCodes: {
        where: {
          purpose,
          isUsed: false,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      },
      wallet: true,
      driverProfile: true,
      storeProfile: true
    }
  });

  if (!user) {
    throw new AppError('Utilisateur non trouvé', 404);
  }

  const otpCode = user.otpCodes[0];
  if (!otpCode) {
    throw new AppError('Code OTP invalide ou expiré', 400);
  }

  if (otpCode.code !== code) {
    throw new AppError('Code OTP incorrect', 400);
  }

  // Marquer le code comme utilisé
  await prisma.otpCode.update({
    where: { id: otpCode.id },
    data: { isUsed: true }
  });

  // Pour LOGIN, activer l'utilisateur et vérifier
  if (purpose === 'LOGIN' || purpose === 'PHONE_VERIFICATION') {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        isActive: true
      }
    });
  }

  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Créer un wallet si l'utilisateur n'en a pas
  if (!user.wallet) {
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0
      }
    });
  }

  // Récupérer l'utilisateur complet avec wallet
  const completeUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      wallet: true,
      driverProfile: true,
      storeProfile: true
    }
  });

  res.json({
    success: true,
    message: 'Connexion réussie',
    user: {
      id: completeUser.id,
      phoneNumber: completeUser.phoneNumber,
      firstName: completeUser.firstName,
      lastName: completeUser.lastName,
      email: completeUser.email,
      profileImage: completeUser.profileImage,
      role: completeUser.role,
      isVerified: completeUser.isVerified,
      wallet: completeUser.wallet,
      hasDriverProfile: !!completeUser.driverProfile,
      hasStoreProfile: !!completeUser.storeProfile
    },
    tokens: {
      accessToken,
      refreshToken
    }
  });
}));

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Finaliser l'inscription après vérification OTP
 *     tags: [Auth]
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { phoneNumber, firstName, lastName, email, profileImage } = value;
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  // Vérifier que l'utilisateur existe et est vérifié
  const user = await prisma.user.findUnique({
    where: { phoneNumber: normalizedPhone }
  });

  if (!user) {
    throw new AppError('Utilisateur non trouvé. Commencez par vérifier votre numéro.', 404);
  }

  if (!user.isVerified) {
    throw new AppError('Numéro de téléphone non vérifié. Vérifiez d\'abord votre numéro.', 400);
  }

  // Mettre à jour les informations utilisateur et créer le wallet avec crédit initial
  const result = await prisma.$transaction(async (tx) => {
    // Mettre à jour l'utilisateur
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        email,
        profileImage,
        isActive: true
      },
      include: {
        wallet: true
      }
    });

    // Créer un wallet avec crédit initial de 50,000 F si nécessaire
    let wallet = updatedUser.wallet;
    const initialBalance = 50000;

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId: updatedUser.id,
          balance: initialBalance
        }
      });

      // Créer la transaction de crédit initial
      await tx.transaction.create({
        data: {
          userId: updatedUser.id,
          walletId: wallet.id,
          type: 'CREDIT',
          amount: initialBalance,
          balanceBefore: 0,
          balanceAfter: initialBalance,
          status: 'COMPLETED',
          description: 'Crédit initial de bienvenue',
          metadata: {
            source: 'system',
            reason: 'welcome_bonus'
          }
        }
      });
    }

    return { ...updatedUser, wallet };
  });

  const updatedUser = result;

  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(updatedUser.id);

  res.status(201).json({
    success: true,
    message: 'Inscription terminée avec succès',
    user: {
      id: updatedUser.id,
      phoneNumber: updatedUser.phoneNumber,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      wallet: updatedUser.wallet
    },
    tokens: {
      accessToken,
      refreshToken
    }
  });
}));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir le token d'accès
 *     tags: [Auth]
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token requis', 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      throw new AppError('Utilisateur non valide', 401);
    }

    // Générer de nouveaux tokens
    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      tokens
    });
  } catch (error) {
    throw new AppError('Refresh token invalide', 401);
  }
}));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtenir les informations de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      phoneNumber: req.user.phoneNumber,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      profileImage: req.user.profileImage,
      role: req.user.role,
      isVerified: req.user.isVerified,
      wallet: req.user.wallet,
      hasDriverProfile: !!req.user.driverProfile,
      hasStoreProfile: !!req.user.storeProfile
    }
  });
}));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion simple (pour tests)
 *     tags: [Auth]
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { phone, password, firstName, lastName, email } = req.body;
  
  if (!phone) {
    throw new AppError('Numéro de téléphone requis', 400);
  }
  
  // Normaliser le numéro
  const normalizedPhone = normalizePhoneNumber(phone);
  
  // Chercher l'utilisateur (inclure isAdmin et role)
  const user = await prisma.user.findUnique({
    where: { phoneNumber: normalizedPhone },
    include: { 
      wallet: true 
    }
  });
  
  // Pour les tests, créer un utilisateur si inexistant
  if (!user) {
    // Générer un mot de passe par défaut hashé
    const defaultPassword = await bcrypt.hash('password123', 12);
    
    const newUser = await prisma.user.create({
      data: {
        phoneNumber: normalizedPhone,
        firstName: firstName || 'Test',
        lastName: lastName || 'User',
        email: email || null,
        password: defaultPassword,
        isVerified: true,
        wallet: {
          create: {
            balance: 50000
          }
        }
      },
      include: { wallet: true }
    });
    
    const tokens = generateTokens(newUser.id);
    
    return res.json({
      success: true,
      message: 'Utilisateur créé et connecté',
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: newUser.id,
        phoneNumber: newUser.phoneNumber,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        isAdmin: newUser.isAdmin || false,
        role: newUser.role || 'USER',
        wallet: newUser.wallet
      }
    });
  }
  
  // Générer les tokens
  const tokens = generateTokens(user.id);
  
  res.json({
    success: true,
    message: 'Connexion réussie',
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin || false,
      role: user.role || 'USER',
      wallet: user.wallet
    }
  });
}));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Se déconnecter (invalider les tokens côté client)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // Dans une implémentation complète, on pourrait maintenir une blacklist de tokens
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
}));

/**
 * POST /api/auth/register-driver
 * Inscription complète d'un driver (données personnelles + véhicule)
 */
router.post('/register-driver', asyncHandler(async (req, res) => {
  // Validation du schéma
  const driverSchema = Joi.object({
    // Informations d'authentification
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string()
      .pattern(/^(?:\+228|228)?[0-9]{8}$/)
      .required(),
    
    // Informations personnelles
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    address: Joi.string().min(5).max(255).required(),
    gender: Joi.string().valid('MALE', 'FEMALE').required(),
    
    // Informations du véhicule
    vehicleType: Joi.string().valid('BERLINE', 'SUV', 'VAN', 'MOTO').required(),
    vehicleBrand: Joi.string().min(2).max(50).required(),
    vehicleModel: Joi.string().min(2).max(50).required(),
    vehicleYear: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1).required(),
    licensePlate: Joi.string().min(2).max(20).required(),
    licenseNumber: Joi.string().min(5).max(50).required()
  });

  const { error, value } = driverSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const {
    email,
    password,
    phone,
    firstName,
    lastName,
    address,
    gender,
    vehicleType,
    vehicleBrand,
    vehicleModel,
    vehicleYear,
    licensePlate,
    licenseNumber
  } = value;

  // Normaliser le numéro de téléphone
  const normalizedPhone = normalizePhoneNumber(phone);

  // Vérifier si l'email existe déjà
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUserByEmail) {
    throw new AppError('Cet email est déjà utilisé', 400);
  }

  // Vérifier si le téléphone existe déjà
  const existingUserByPhone = await prisma.user.findUnique({
    where: { phoneNumber: normalizedPhone }
  });

  if (existingUserByPhone) {
    throw new AppError('Ce numéro de téléphone est déjà utilisé', 400);
  }

  // Vérifier si la plaque d'immatriculation existe déjà
  const existingPlate = await prisma.driverProfile.findUnique({
    where: { plateNumber: licensePlate.toUpperCase() }
  });

  if (existingPlate) {
    throw new AppError('Cette plaque d\'immatriculation est déjà enregistrée', 400);
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12);

  // Créer l'utilisateur, le profil driver et le wallet dans une transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Créer l'utilisateur
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        phoneNumber: normalizedPhone,
        firstName,
        lastName,
        role: 'DRIVER', // Rôle spécifique pour les drivers
        isVerified: true, // Auto-vérifié pour les drivers
        isActive: true
      }
    });

    // 2. Créer le profil driver
    const driverProfile = await tx.driverProfile.create({
      data: {
        userId: user.id,
        vehicleType,
        vehicleBrand,
        vehicleModel,
        vehicleYear,
        vehicleColor: 'Non spécifié', // Peut être ajouté plus tard
        plateNumber: licensePlate.toUpperCase(),
        licenseNumber,
        address,
        gender,
        isOnline: false,
        isAvailable: true,
        status: 'PENDING_VERIFICATION', // En attente de vérification admin
        rating: 0,
        totalRides: 0
      }
    });

    // 3. Créer le wallet avec crédit initial de 50,000 F
    const initialBalance = 50000;
    const wallet = await tx.wallet.create({
      data: {
        userId: user.id,
        balance: initialBalance
      }
    });

    // 4. Créer la transaction de crédit initial
    await tx.transaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        type: 'CREDIT',
        amount: initialBalance,
        balanceBefore: 0,
        balanceAfter: initialBalance,
        status: 'COMPLETED',
        description: 'Crédit initial de bienvenue',
        metadata: {
          source: 'system',
          reason: 'welcome_bonus',
          userType: 'driver'
        }
      }
    });

    return { user, driverProfile, wallet };
  });

  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(result.user.id);

  // Réponse
  res.status(201).json({
    success: true,
    message: 'Inscription driver réussie',
    token: accessToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      phoneNumber: result.user.phoneNumber,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      role: result.user.role,
      driverProfile: {
        id: result.driverProfile.id,
        vehicleType: result.driverProfile.vehicleType,
        vehicleBrand: result.driverProfile.vehicleBrand,
        vehicleModel: result.driverProfile.vehicleModel,
        vehicleYear: result.driverProfile.vehicleYear,
        licensePlate: result.driverProfile.plateNumber,
        licenseNumber: result.driverProfile.licenseNumber,
        status: result.driverProfile.status,
        rating: result.driverProfile.rating
      },
      wallet: {
        id: result.wallet.id,
        balance: result.wallet.balance
      }
    },
    tokens: {
      accessToken,
      refreshToken
    }
  });
}));

module.exports = router;