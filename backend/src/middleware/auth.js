const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware d'authentification JWT
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token d\'accès requis',
        message: 'Veuillez vous connecter pour accéder à cette ressource'
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        wallet: true,
        driverProfile: true,
        storeProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        message: 'Ce compte n\'existe plus'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été désactivé. Contactez le support.'
      });
    }

    // Ajouter les infos utilisateur à la requête
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Le token d\'authentification est invalide'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré',
        message: 'Votre session a expiré. Veuillez vous reconnecter.'
      });
    }

    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'authentification'
    });
  }
};

/**
 * Middleware de vérification des rôles
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Vous devez être connecté'
      });
    }

    // Si roles est une chaîne, la convertir en tableau
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès non autorisé',
        message: 'Vous n\'avez pas les permissions nécessaires pour cette action'
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier que l'utilisateur a un profil chauffeur
 */
const requireDriverProfile = (req, res, next) => {
  if (!req.user.driverProfile) {
    return res.status(403).json({
      error: 'Profil chauffeur requis',
      message: 'Vous devez avoir un profil chauffeur pour accéder à cette ressource'
    });
  }
  next();
};

/**
 * Middleware pour vérifier que l'utilisateur a un profil boutique
 */
const requireStoreProfile = (req, res, next) => {
  if (!req.user.storeProfile) {
    return res.status(403).json({
      error: 'Profil boutique requis',
      message: 'Vous devez avoir un profil boutique pour accéder à cette ressource'
    });
  }
  next();
};

/**
 * Middleware pour vérifier que l'utilisateur a un wallet
 */
const requireWallet = (req, res, next) => {
  if (!req.user.wallet) {
    return res.status(403).json({
      error: 'Portefeuille requis',
      message: 'Vous devez avoir un portefeuille pour effectuer cette action'
    });
  }
  next();
};

/**
 * Middleware optionnel d'authentification (pour les routes publiques avec data optionnelle)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          wallet: true,
          driverProfile: true,
          storeProfile: true
        }
      });

      if (user && user.isActive) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur (auth optionnelle)
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireDriverProfile,
  requireStoreProfile,
  requireWallet,
  optionalAuth
};