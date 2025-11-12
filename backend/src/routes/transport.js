const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { requireWallet, requireDriverProfile } = require('../middleware/auth');
const socketService = require('../services/socketService');

const router = express.Router();
const prisma = new PrismaClient();

// Schémas de validation
const rideRequestSchema = Joi.object({
  pickupLat: Joi.number().min(-90).max(90).required(),
  pickupLng: Joi.number().min(-180).max(180).required(),
  pickupAddress: Joi.string().min(10).max(255).required(),
  dropoffLat: Joi.number().min(-90).max(90).required(),
  dropoffLng: Joi.number().min(-180).max(180).required(),
  dropoffAddress: Joi.string().min(10).max(255).required(),
  rideType: Joi.string().valid('TAXI', 'LUX_PLUS', 'DRIVER', 'DELIVERY').required()
});

const driverLocationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  isOnline: Joi.boolean().optional()
});

const rideUpdateSchema = Joi.object({
  status: Joi.string().valid('ACCEPTED', 'DRIVER_ARRIVING', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').required(),
  cancelReason: Joi.string().when('status', {
    is: 'CANCELLED',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

// Utilitaires de géolocalisation
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Rayon de la terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance en km
}

function calculatePrice(distance, rideType) {
  const basePrices = {
    TAXI: { base: 500, perKm: 300 },        // 500 F base + 300 F/km
    LUX_PLUS: { base: 1000, perKm: 500 },  // 1000 F base + 500 F/km
    DRIVER: { base: 800, perKm: 400 },     // 800 F base + 400 F/km
    DELIVERY: { base: 600, perKm: 250 }    // 600 F base + 250 F/km
  };

  const pricing = basePrices[rideType];
  const price = pricing.base + (distance * pricing.perKm);
  
  // Arrondir au 25 F près
  return Math.round(price / 25) * 25;
}

function estimateDuration(distance) {
  // Estimation basée sur la vitesse moyenne à Lomé (15 km/h en moyenne)
  const avgSpeed = 15; // km/h
  return Math.round((distance / avgSpeed) * 60); // en minutes
}

/**
 * @swagger
 * /api/transport/request-ride:
 *   post:
 *     summary: Demander une course
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 */
router.post('/request-ride', requireWallet, asyncHandler(async (req, res) => {
  const { error, value } = rideRequestSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { pickupLat, pickupLng, dropoffLat, dropoffLng, pickupAddress, dropoffAddress, rideType } = value;
  const userId = req.userId;

  // Vérifier qu'il n'y a pas déjà une course en cours
  const existingRide = await prisma.rideRequest.findFirst({
    where: {
      userId,
      status: { in: ['PENDING', 'ACCEPTED', 'DRIVER_ARRIVING', 'ARRIVED', 'IN_PROGRESS'] }
    }
  });

  if (existingRide) {
    throw new AppError('Vous avez déjà une course en cours', 400);
  }

  // Calculer la distance et le prix
  const distance = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
  const estimatedPrice = calculatePrice(distance, rideType);
  const estimatedDuration = estimateDuration(distance);

  // Vérifications de sécurité
  if (distance < 0.3) {
    throw new AppError('Distance minimale: 300 mètres', 400);
  }

  if (distance > 50) {
    throw new AppError('Distance maximale: 50 km', 400);
  }

  // Vérifier le solde pour les courses payantes
  if (estimatedPrice > 0) {
    const wallet = req.user.wallet;
    const availableBalance = parseFloat(wallet.balance) - parseFloat(wallet.blockedAmount);
    
    if (availableBalance < estimatedPrice) {
      throw new AppError('Solde insuffisant. Rechargez votre portefeuille.', 400);
    }
  }

  // Créer la demande de course
  const rideRequest = await prisma.rideRequest.create({
    data: {
      userId,
      pickupLat,
      pickupLng,
      pickupAddress,
      dropoffLat,
      dropoffLng,
      dropoffAddress,
      rideType,
      estimatedPrice,
      status: 'PENDING'
    }
  });

  // Bloquer le montant dans le portefeuille
  if (estimatedPrice > 0) {
    await prisma.wallet.update({
      where: { userId },
      data: {
        blockedAmount: { increment: estimatedPrice }
      }
    });
  }

  // Trouver les chauffeurs disponibles dans un rayon de 5 km
  const availableDrivers = await prisma.driverProfile.findMany({
    where: {
      isOnline: true,
      isAvailable: true,
      status: 'ACTIVE',
      vehicleType: rideType === 'DELIVERY' ? { in: ['DELIVERY_VAN', 'MOTO'] } : { not: 'DELIVERY_VAN' },
      currentLat: { not: null },
      currentLng: { not: null }
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true
        }
      }
    }
  });

  // Filtrer les chauffeurs par distance
  const nearbyDrivers = availableDrivers
    .map(driver => ({
      ...driver,
      distance: calculateDistance(
        pickupLat,
        pickupLng,
        parseFloat(driver.currentLat),
        parseFloat(driver.currentLng)
      )
    }))
    .filter(driver => driver.distance <= 5) // 5 km max
    .sort((a, b) => a.distance - b.distance) // Trier par distance
    .slice(0, 10); // Maximum 10 chauffeurs

  if (nearbyDrivers.length === 0) {
    // Libérer le montant bloqué
    if (estimatedPrice > 0) {
      await prisma.wallet.update({
        where: { userId },
        data: {
          blockedAmount: { decrement: estimatedPrice }
        }
      });
    }

    throw new AppError('Aucun chauffeur disponible dans votre zone', 404);
  }

  // Envoyer la demande aux chauffeurs via Socket.IO
  const rideData = {
    requestId: rideRequest.id,
    pickup: { lat: pickupLat, lng: pickupLng, address: pickupAddress },
    dropoff: { lat: dropoffLat, lng: dropoffLng, address: dropoffAddress },
    rideType,
    estimatedPrice,
    estimatedDuration,
    distance,
    passenger: {
      name: `${req.user.firstName} ${req.user.lastName}`,
      phone: req.user.phoneNumber
    }
  };

  nearbyDrivers.forEach(driver => {
    socketService.emitToUser(driver.userId, 'new-ride-request', {
      ...rideData,
      distanceToPickup: driver.distance
    });
  });

  // Programmer l'annulation automatique après 5 minutes
  setTimeout(async () => {
    try {
      const request = await prisma.rideRequest.findUnique({
        where: { id: rideRequest.id }
      });

      if (request && request.status === 'PENDING') {
        await prisma.rideRequest.update({
          where: { id: rideRequest.id },
          data: { status: 'CANCELLED' }
        });

        // Libérer le montant bloqué
        if (estimatedPrice > 0) {
          await prisma.wallet.update({
            where: { userId },
            data: {
              blockedAmount: { decrement: estimatedPrice }
            }
          });
        }

        socketService.emitToUser(userId, 'ride-request-timeout', {
          requestId: rideRequest.id,
          message: 'Aucun chauffeur n\'a accepté votre demande'
        });
      }
    } catch (error) {
      console.error('Erreur annulation automatique:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  res.json({
    success: true,
    message: 'Demande de course envoyée aux chauffeurs',
    rideRequest: {
      id: rideRequest.id,
      estimatedPrice,
      estimatedDuration,
      distance,
      driversNotified: nearbyDrivers.length,
      status: 'PENDING'
    }
  });
}));

/**
 * @swagger
 * /api/transport/accept-ride:
 *   post:
 *     summary: Accepter une course (chauffeur)
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 */
router.post('/accept-ride/:requestId', requireDriverProfile, asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const driverId = req.user.driverProfile.id;
  const userId = req.userId;

  // Vérifier que la demande existe et est toujours en attente
  const rideRequest = await prisma.rideRequest.findUnique({
    where: { id: requestId },
    include: { user: true }
  });

  if (!rideRequest) {
    throw new AppError('Demande de course non trouvée', 404);
  }

  if (rideRequest.status !== 'PENDING') {
    throw new AppError('Cette demande n\'est plus disponible', 400);
  }

  // Vérifier que le chauffeur est disponible
  const driver = req.user.driverProfile;
  if (!driver.isOnline || !driver.isAvailable || driver.status !== 'ACTIVE') {
    throw new AppError('Vous n\'êtes pas disponible pour accepter des courses', 400);
  }

  // Créer la course
  const ride = await prisma.$transaction(async (tx) => {
    // Créer la course
    const newRide = await tx.ride.create({
      data: {
        requestId,
        driverId,
        pickupLat: rideRequest.pickupLat,
        pickupLng: rideRequest.pickupLng,
        pickupAddress: rideRequest.pickupAddress,
        dropoffLat: rideRequest.dropoffLat,
        dropoffLng: rideRequest.dropoffLng,
        dropoffAddress: rideRequest.dropoffAddress,
        rideType: rideRequest.rideType,
        price: rideRequest.estimatedPrice,
        distance: calculateDistance(
          parseFloat(rideRequest.pickupLat),
          parseFloat(rideRequest.pickupLng),
          parseFloat(rideRequest.dropoffLat),
          parseFloat(rideRequest.dropoffLng)
        ),
        status: 'ACCEPTED'
      }
    });

    // Mettre à jour la demande
    await tx.rideRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });

    // Marquer le chauffeur comme non disponible
    await tx.driverProfile.update({
      where: { id: driverId },
      data: { isAvailable: false }
    });

    return newRide;
  });

  // Notifier le passager
  socketService.emitToUser(rideRequest.userId, 'ride-accepted', {
    rideId: ride.id,
    driver: {
      name: `${req.user.firstName} ${req.user.lastName}`,
      phone: req.user.phoneNumber,
      vehicleType: driver.vehicleType,
      vehicleBrand: driver.vehicleBrand,
      vehicleModel: driver.vehicleModel,
      vehicleColor: driver.vehicleColor,
      plateNumber: driver.plateNumber,
      rating: parseFloat(driver.rating)
    },
    estimatedArrival: '5-10 minutes'
  });

  res.json({
    success: true,
    message: 'Course acceptée avec succès',
    ride: {
      id: ride.id,
      passenger: {
        name: `${rideRequest.user.firstName} ${rideRequest.user.lastName}`,
        phone: rideRequest.user.phoneNumber
      },
      pickup: {
        lat: parseFloat(ride.pickupLat),
        lng: parseFloat(ride.pickupLng),
        address: ride.pickupAddress
      },
      dropoff: {
        lat: parseFloat(ride.dropoffLat),
        lng: parseFloat(ride.dropoffLng),
        address: ride.dropoffAddress
      },
      price: parseFloat(ride.price),
      status: ride.status
    }
  });
}));

/**
 * @swagger
 * /api/transport/update-driver-location:
 *   post:
 *     summary: Mettre à jour la position du chauffeur
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 */
router.post('/update-driver-location', requireDriverProfile, asyncHandler(async (req, res) => {
  const { error, value } = driverLocationSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { latitude, longitude, isOnline } = value;
  const driverId = req.user.driverProfile.id;

  const updateData = {
    currentLat: latitude,
    currentLng: longitude,
    updatedAt: new Date()
  };

  if (typeof isOnline === 'boolean') {
    updateData.isOnline = isOnline;
    if (!isOnline) {
      updateData.isAvailable = false;
    }
  }

  await prisma.driverProfile.update({
    where: { id: driverId },
    data: updateData
  });

  // Notifier les courses en cours de la nouvelle position
  const activeRide = await prisma.ride.findFirst({
    where: {
      driverId,
      status: { in: ['ACCEPTED', 'DRIVER_ARRIVING', 'ARRIVED', 'IN_PROGRESS'] }
    },
    include: { request: { include: { user: true } } }
  });

  if (activeRide) {
    socketService.emitToUser(activeRide.request.userId, 'driver-location-update', {
      rideId: activeRide.id,
      driverLocation: { lat: latitude, lng: longitude }
    });
  }

  res.json({
    success: true,
    message: 'Position mise à jour',
    location: { latitude, longitude, isOnline }
  });
}));

/**
 * @swagger
 * /api/transport/update-ride-status:
 *   patch:
 *     summary: Mettre à jour le statut d'une course
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/update-ride-status/:rideId', asyncHandler(async (req, res) => {
  const { rideId } = req.params;
  const { error, value } = rideUpdateSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { status, cancelReason } = value;
  const userId = req.userId;

  // Trouver la course
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      request: { include: { user: true } },
      driver: { include: { user: true } }
    }
  });

  if (!ride) {
    throw new AppError('Course non trouvée', 404);
  }

  // Vérifier les permissions
  const isPassenger = ride.request.userId === userId;
  const isDriver = ride.driver.userId === userId;

  if (!isPassenger && !isDriver) {
    throw new AppError('Vous n\'êtes pas autorisé à modifier cette course', 403);
  }

  // Logique de mise à jour selon le statut
  const updateData = { status };
  const now = new Date();

  switch (status) {
    case 'DRIVER_ARRIVING':
      if (!isDriver) throw new AppError('Seul le chauffeur peut indiquer qu\'il arrive', 403);
      break;

    case 'ARRIVED':
      if (!isDriver) throw new AppError('Seul le chauffeur peut indiquer qu\'il est arrivé', 403);
      break;

    case 'IN_PROGRESS':
      if (!isDriver) throw new AppError('Seul le chauffeur peut démarrer la course', 403);
      updateData.startedAt = now;
      break;

    case 'COMPLETED':
      if (!isDriver) throw new AppError('Seul le chauffeur peut terminer la course', 403);
      updateData.completedAt = now;
      break;

    case 'CANCELLED':
      updateData.cancelledAt = now;
      updateData.cancelReason = cancelReason;
      break;

    default:
      throw new AppError('Statut invalide', 400);
  }

  // Mettre à jour la course
  const updatedRide = await prisma.$transaction(async (tx) => {
    const updated = await tx.ride.update({
      where: { id: rideId },
      data: updateData
    });

    // Actions spécifiques selon le statut
    if (status === 'COMPLETED') {
      // Traiter le paiement
      await tx.transaction.create({
        data: {
          walletId: ride.request.user.wallet?.id,
          type: 'PAYMENT',
          amount: -parseFloat(ride.price),
          paymentMethod: 'WALLET',
          status: 'COMPLETED',
          description: `Paiement course - ${ride.pickupAddress} vers ${ride.dropoffAddress}`,
          rideId: ride.id,
          processedAt: now
        }
      });

      // Débloquer et débiter le montant
      await tx.wallet.update({
        where: { userId: ride.request.userId },
        data: {
          balance: { decrement: parseFloat(ride.price) },
          blockedAmount: { decrement: parseFloat(ride.price) }
        }
      });

      // Rendre le chauffeur disponible
      await tx.driverProfile.update({
        where: { id: ride.driverId },
        data: {
          isAvailable: true,
          totalRides: { increment: 1 }
        }
      });

    } else if (status === 'CANCELLED') {
      // Libérer le montant bloqué
      if (ride.request.user.wallet) {
        await tx.wallet.update({
          where: { userId: ride.request.userId },
          data: {
            blockedAmount: { decrement: parseFloat(ride.price) }
          }
        });
      }

      // Rendre le chauffeur disponible
      await tx.driverProfile.update({
        where: { id: ride.driverId },
        data: { isAvailable: true }
      });
    }

    return updated;
  });

  // Notifications en temps réel
  const notification = {
    rideId: updatedRide.id,
    status: updatedRide.status,
    message: getStatusMessage(status),
    timestamp: now
  };

  if (isDriver) {
    socketService.emitToUser(ride.request.userId, 'ride-status-update', notification);
  } else {
    socketService.emitToUser(ride.driver.userId, 'ride-status-update', notification);
  }

  res.json({
    success: true,
    message: 'Statut de la course mis à jour',
    ride: {
      id: updatedRide.id,
      status: updatedRide.status,
      completedAt: updatedRide.completedAt,
      cancelledAt: updatedRide.cancelledAt,
      cancelReason: updatedRide.cancelReason
    }
  });
}));

/**
 * @swagger
 * /api/transport/my-rides:
 *   get:
 *     summary: Obtenir mes courses (passager ou chauffeur)
 *     tags: [Transport]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-rides', asyncHandler(async (req, res) => {
  const userId = req.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const status = req.query.status;
  
  const skip = (page - 1) * limit;

  // Construire les filtres
  const whereClause = {
    OR: [
      { request: { userId } }, // Courses en tant que passager
      { driver: { userId } }   // Courses en tant que chauffeur
    ]
  };

  if (status) {
    whereClause.status = status;
  }

  const [rides, total] = await Promise.all([
    prisma.ride.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        request: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true
              }
            }
          }
        },
        driver: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneNumber: true
              }
            }
          }
        },
        review: true
      }
    }),
    prisma.ride.count({ where: whereClause })
  ]);

  const formattedRides = rides.map(ride => ({
    id: ride.id,
    status: ride.status,
    rideType: ride.rideType,
    price: parseFloat(ride.price),
    distance: parseFloat(ride.distance || 0),
    duration: ride.duration,
    pickup: {
      lat: parseFloat(ride.pickupLat),
      lng: parseFloat(ride.pickupLng),
      address: ride.pickupAddress
    },
    dropoff: {
      lat: parseFloat(ride.dropoffLat),
      lng: parseFloat(ride.dropoffLng),
      address: ride.dropoffAddress
    },
    passenger: ride.request.user,
    driver: ride.driver.user,
    isMyRideAsPassenger: ride.request.userId === userId,
    isMyRideAsDriver: ride.driver.userId === userId,
    startedAt: ride.startedAt,
    completedAt: ride.completedAt,
    cancelledAt: ride.cancelledAt,
    cancelReason: ride.cancelReason,
    createdAt: ride.createdAt,
    hasReview: !!ride.review
  }));

  res.json({
    success: true,
    rides: formattedRides,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Utilitaire pour les messages de statut
function getStatusMessage(status) {
  const messages = {
    ACCEPTED: 'Votre chauffeur a accepté la course',
    DRIVER_ARRIVING: 'Votre chauffeur arrive',
    ARRIVED: 'Votre chauffeur est arrivé',
    IN_PROGRESS: 'Course en cours',
    COMPLETED: 'Course terminée avec succès',
    CANCELLED: 'Course annulée'
  };
  return messages[status] || 'Statut mis à jour';
}

module.exports = router;