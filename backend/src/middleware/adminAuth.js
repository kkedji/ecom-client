const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('./errorHandler');

const prisma = new PrismaClient();

/**
 * Middleware pour vérifier qu'un utilisateur est authentifié ET admin
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token d\'accès requis',
        message: 'Veuillez vous connecter en tant qu\'administrateur'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        isAdmin: true,
        role: true,
        isActive: true
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
        message: 'Votre compte a été désactivé'
      });
    }

    // Vérifier que l'utilisateur est admin
    if (!user.isAdmin) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Vous devez être administrateur pour accéder à cette ressource'
      });
    }

    // Ajouter les infos admin à la requête
    req.user = user;
    req.userId = user.id;
    req.adminRole = user.role;

    // Logger l'action admin (facultatif mais recommandé)
    await prisma.adminLog.create({
      data: {
        adminId: user.id,
        action: `${req.method} ${req.originalUrl}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      }
    }).catch(err => console.error('Erreur log admin:', err));

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Votre session est invalide'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré',
        message: 'Votre session a expiré. Reconnectez-vous'
      });
    }
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la vérification admin'
    });
  }
};

/**
 * Middleware pour vérifier qu'un utilisateur est SUPER_ADMIN
 */
const verifySuperAdmin = async (req, res, next) => {
  try {
    // D'abord vérifier qu'il est admin
    await verifyAdmin(req, res, () => {});

    // Vérifier le rôle SUPER_ADMIN
    if (req.adminRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Seul le SUPER_ADMIN peut accéder à cette ressource'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la vérification SUPER_ADMIN'
    });
  }
};

module.exports = {
  verifyAdmin,
  verifySuperAdmin
};
