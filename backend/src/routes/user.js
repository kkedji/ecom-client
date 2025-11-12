const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Schémas de validation
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  profileImage: Joi.string().uri().optional()
});

const createDriverProfileSchema = Joi.object({
  licenseNumber: Joi.string().min(5).max(50).required(),
  vehicleType: Joi.string().valid('TAXI', 'MOTO', 'TRICYCLE', 'DELIVERY_VAN').required(),
  vehicleBrand: Joi.string().min(2).max(50).required(),
  vehicleModel: Joi.string().min(2).max(50).required(),
  vehicleYear: Joi.number().min(1990).max(new Date().getFullYear() + 1).required(),
  vehicleColor: Joi.string().min(2).max(30).required(),
  plateNumber: Joi.string().min(3).max(20).required(),
  insuranceNumber: Joi.string().min(5).max(50).required()
});

const createStoreProfileSchema = Joi.object({
  storeName: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  category: Joi.string().valid('FOOD', 'FASHION', 'ELECTRONICS', 'HEALTH', 'HOME', 'BOOKS', 'SPORTS', 'OTHER').required(),
  address: Joi.string().min(10).max(255).required(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  phoneNumber: Joi.string().pattern(/^(?:\+228|228)?[0-9]{8}$/).required(),
  email: Joi.string().email().optional(),
  logo: Joi.string().uri().optional(),
  banner: Joi.string().uri().optional()
});

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Récupérer le profil utilisateur
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', asyncHandler(async (req, res) => {
  // req.user contient déjà toutes les infos (voir middleware auth)
  const user = req.user;

  res.json({
    success: true,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      role: user.role,
      wallet: user.wallet,
      hasDriverProfile: !!user.driverProfile,
      hasStoreProfile: !!user.storeProfile,
      createdAt: user.createdAt
    }
  });
}));

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Mettre à jour le profil utilisateur
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile', asyncHandler(async (req, res) => {
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const userId = req.userId;
  const updateData = { ...value };

  // Vérifier l'unicité de l'email si fourni
  if (value.email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: value.email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé par un autre compte', 409);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      phoneNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      role: true,
      isVerified: true,
      createdAt: true
    }
  });

  res.json({
    success: true,
    message: 'Profil mis à jour avec succès',
    user: updatedUser
  });
}));

/**
 * @swagger
 * /api/user/create-driver-profile:
 *   post:
 *     summary: Créer un profil chauffeur
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.post('/create-driver-profile', asyncHandler(async (req, res) => {
  const { error, value } = createDriverProfileSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const userId = req.userId;

  // Vérifier que l'utilisateur n'a pas déjà un profil chauffeur
  const existingProfile = await prisma.driverProfile.findUnique({
    where: { userId }
  });

  if (existingProfile) {
    throw new AppError('Vous avez déjà un profil chauffeur', 409);
  }

  // Vérifier l'unicité du numéro de permis et de plaque
  const [existingLicense, existingPlate] = await Promise.all([
    prisma.driverProfile.findUnique({
      where: { licenseNumber: value.licenseNumber }
    }),
    prisma.driverProfile.findUnique({
      where: { plateNumber: value.plateNumber }
    })
  ]);

  if (existingLicense) {
    throw new AppError('Ce numéro de permis est déjà enregistré', 409);
  }

  if (existingPlate) {
    throw new AppError('Cette plaque d\'immatriculation est déjà enregistrée', 409);
  }

  // Créer le profil chauffeur
  const driverProfile = await prisma.$transaction(async (tx) => {
    const profile = await tx.driverProfile.create({
      data: {
        userId,
        ...value,
        status: 'INACTIVE' // En attente de validation
      }
    });

    // Mettre à jour le rôle de l'utilisateur
    await tx.user.update({
      where: { id: userId },
      data: { role: 'DRIVER' }
    });

    return profile;
  });

  res.status(201).json({
    success: true,
    message: 'Profil chauffeur créé. En attente de validation.',
    driverProfile: {
      id: driverProfile.id,
      licenseNumber: driverProfile.licenseNumber,
      vehicleType: driverProfile.vehicleType,
      vehicleBrand: driverProfile.vehicleBrand,
      vehicleModel: driverProfile.vehicleModel,
      vehicleColor: driverProfile.vehicleColor,
      plateNumber: driverProfile.plateNumber,
      status: driverProfile.status
    }
  });
}));

/**
 * @swagger
 * /api/user/create-store-profile:
 *   post:
 *     summary: Créer un profil boutique
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.post('/create-store-profile', asyncHandler(async (req, res) => {
  const { error, value } = createStoreProfileSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const userId = req.userId;

  // Vérifier que l'utilisateur n'a pas déjà un profil boutique
  const existingProfile = await prisma.storeProfile.findUnique({
    where: { userId }
  });

  if (existingProfile) {
    throw new AppError('Vous avez déjà un profil boutique', 409);
  }

  // Normaliser le numéro de téléphone
  let normalizedPhone = value.phoneNumber;
  if (!normalizedPhone.startsWith('+228')) {
    normalizedPhone = '+228' + normalizedPhone.replace(/^228/, '');
  }

  // Créer le profil boutique
  const storeProfile = await prisma.$transaction(async (tx) => {
    const profile = await tx.storeProfile.create({
      data: {
        userId,
        ...value,
        phoneNumber: normalizedPhone
      }
    });

    // Mettre à jour le rôle de l'utilisateur
    await tx.user.update({
      where: { id: userId },
      data: { role: 'STORE_OWNER' }
    });

    return profile;
  });

  res.status(201).json({
    success: true,
    message: 'Profil boutique créé avec succès',
    storeProfile: {
      id: storeProfile.id,
      storeName: storeProfile.storeName,
      category: storeProfile.category,
      address: storeProfile.address,
      phoneNumber: storeProfile.phoneNumber,
      isActive: storeProfile.isActive
    }
  });
}));

/**
 * @swagger
 * /api/user/driver-profile:
 *   get:
 *     summary: Obtenir le profil chauffeur
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.get('/driver-profile', asyncHandler(async (req, res) => {
  const userId = req.userId;

  const driverProfile = await prisma.driverProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          profileImage: true
        }
      }
    }
  });

  if (!driverProfile) {
    throw new AppError('Profil chauffeur non trouvé', 404);
  }

  res.json({
    success: true,
    driverProfile: {
      id: driverProfile.id,
      user: driverProfile.user,
      licenseNumber: driverProfile.licenseNumber,
      vehicleType: driverProfile.vehicleType,
      vehicleBrand: driverProfile.vehicleBrand,
      vehicleModel: driverProfile.vehicleModel,
      vehicleYear: driverProfile.vehicleYear,
      vehicleColor: driverProfile.vehicleColor,
      plateNumber: driverProfile.plateNumber,
      insuranceNumber: driverProfile.insuranceNumber,
      isOnline: driverProfile.isOnline,
      isAvailable: driverProfile.isAvailable,
      status: driverProfile.status,
      rating: parseFloat(driverProfile.rating),
      totalRides: driverProfile.totalRides,
      currentLocation: driverProfile.currentLat && driverProfile.currentLng ? {
        lat: parseFloat(driverProfile.currentLat),
        lng: parseFloat(driverProfile.currentLng)
      } : null
    }
  });
}));

/**
 * @swagger
 * /api/user/store-profile:
 *   get:
 *     summary: Obtenir le profil boutique
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.get('/store-profile', asyncHandler(async (req, res) => {
  const userId = req.userId;

  const storeProfile = await prisma.storeProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          profileImage: true
        }
      },
      products: {
        where: { isActive: true },
        take: 5,
        select: {
          id: true,
          name: true,
          price: true,
          images: true
        }
      },
      _count: {
        select: {
          products: true,
          orders: true
        }
      }
    }
  });

  if (!storeProfile) {
    throw new AppError('Profil boutique non trouvé', 404);
  }

  res.json({
    success: true,
    storeProfile: {
      id: storeProfile.id,
      user: storeProfile.user,
      storeName: storeProfile.storeName,
      description: storeProfile.description,
      category: storeProfile.category,
      address: storeProfile.address,
      location: storeProfile.latitude && storeProfile.longitude ? {
        lat: parseFloat(storeProfile.latitude),
        lng: parseFloat(storeProfile.longitude)
      } : null,
      phoneNumber: storeProfile.phoneNumber,
      email: storeProfile.email,
      logo: storeProfile.logo,
      banner: storeProfile.banner,
      isActive: storeProfile.isActive,
      rating: parseFloat(storeProfile.rating),
      totalOrders: storeProfile.totalOrders,
      stats: {
        totalProducts: storeProfile._count.products,
        totalOrders: storeProfile._count.orders
      },
      recentProducts: storeProfile.products
    }
  });
}));

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     summary: Obtenir les statistiques utilisateur
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.userId;

  // Récupérer les statistiques selon le rôle
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      driverProfile: true,
      storeProfile: true
    }
  });

  const stats = {
    wallet: user.wallet ? {
      balance: parseFloat(user.wallet.balance),
      blockedAmount: parseFloat(user.wallet.blockedAmount)
    } : null
  };

  // Statistiques chauffeur
  if (user.driverProfile) {
    const [rideStats, earnings] = await Promise.all([
      prisma.ride.groupBy({
        by: ['status'],
        where: { driverId: user.driverProfile.id },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          wallet: { userId },
          type: 'PAYMENT',
          status: 'COMPLETED',
          ride: { driverId: user.driverProfile.id }
        },
        _sum: { amount: true }
      })
    ]);

    stats.driver = {
      totalRides: user.driverProfile.totalRides,
      rating: parseFloat(user.driverProfile.rating),
      totalEarnings: Math.abs(parseFloat(earnings._sum.amount || 0)),
      ridesByStatus: rideStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {})
    };
  }

  // Statistiques boutique
  if (user.storeProfile) {
    const [orderStats, revenue] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: { storeId: user.storeProfile.id },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          order: { storeId: user.storeProfile.id },
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      })
    ]);

    stats.store = {
      totalOrders: user.storeProfile.totalOrders,
      rating: parseFloat(user.storeProfile.rating),
      totalRevenue: Math.abs(parseFloat(revenue._sum.amount || 0)),
      ordersByStatus: orderStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {})
    };
  }

  res.json({
    success: true,
    stats
  });
}));

module.exports = router;