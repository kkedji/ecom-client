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
 * POST /api/transport/rides/:id/reject
 * Refuser une course
 */
router.post('/rides/:id/reject', requireDriverProfile, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const driverId = req.user.userId;

  // Vérifier que la demande existe
  const rideRequest = await prisma.rideRequest.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!rideRequest) {
    throw new AppError('Demande de course non trouvée', 404);
  }

  if (rideRequest.status !== 'PENDING') {
    throw new AppError('Cette demande ne peut plus être refusée', 400);
  }

  // Logger le refus (optionnel - pour analytics)
  await prisma.rideRequest.update({
    where: { id },
    data: {
      metadata: {
        ...rideRequest.metadata,
        rejectedBy: [...(rideRequest.metadata?.rejectedBy || []), driverId],
        lastRejectionReason: reason || 'Non spécifiée'
      }
    }
  });

  res.json({
    success: true,
    message: 'Course refusée'
  });
}));

/**
 * POST /api/transport/rides/:id/arrive-pickup
 * Signaler l'arrivée au point de départ
 */
router.post('/rides/:id/arrive-pickup', requireDriverProfile, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const driverId = req.user.userId;

  // Vérifier la course
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: { 
      request: { 
        include: { user: true } 
      } 
    }
  });

  if (!ride) {
    throw new AppError('Course non trouvée', 404);
  }

  if (ride.driverId !== driverId) {
    throw new AppError('Cette course ne vous appartient pas', 403);
  }

  if (ride.status !== 'ACCEPTED' && ride.status !== 'DRIVER_ARRIVING') {
    throw new AppError('Statut de course invalide', 400);
  }

  // Mettre à jour le statut
  const updatedRide = await prisma.ride.update({
    where: { id },
    data: { 
      status: 'ARRIVED',
      arrivedAtPickupAt: new Date()
    }
  });

  await prisma.rideRequest.update({
    where: { id: ride.requestId },
    data: { status: 'ARRIVED' }
  });

  // Notifier le passager
  socketService.emitToUser(ride.request.userId, 'driver-arrived', {
    rideId: ride.id,
    message: 'Votre chauffeur est arrivé'
  });

  res.json({
    success: true,
    message: 'Arrivée au point de départ signalée',
    ride: {
      id: updatedRide.id,
      status: updatedRide.status,
      arrivedAt: updatedRide.arrivedAtPickupAt
    }
  });
}));

/**
 * POST /api/transport/rides/:id/start
 * Démarrer la course
 */
router.post('/rides/:id/start', requireDriverProfile, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const driverId = req.user.userId;

  // Vérifier la course
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: { 
      request: { 
        include: { user: true } 
      } 
    }
  });

  if (!ride) {
    throw new AppError('Course non trouvée', 404);
  }

  if (ride.driverId !== driverId) {
    throw new AppError('Cette course ne vous appartient pas', 403);
  }

  if (ride.status !== 'ARRIVED') {
    throw new AppError('Vous devez d\'abord arriver au point de départ', 400);
  }

  // Mettre à jour le statut
  const updatedRide = await prisma.ride.update({
    where: { id },
    data: { 
      status: 'IN_PROGRESS',
      startedAt: new Date()
    }
  });

  await prisma.rideRequest.update({
    where: { id: ride.requestId },
    data: { status: 'IN_PROGRESS' }
  });

  // Notifier le passager
  socketService.emitToUser(ride.request.userId, 'ride-started', {
    rideId: ride.id,
    message: 'La course a démarré'
  });

  res.json({
    success: true,
    message: 'Course démarrée',
    ride: {
      id: updatedRide.id,
      status: updatedRide.status,
      startedAt: updatedRide.startedAt
    }
  });
}));

/**
 * POST /api/transport/rides/:id/arrive-destination
 * Signaler l'arrivée à destination
 */
router.post('/rides/:id/arrive-destination', requireDriverProfile, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const driverId = req.user.userId;

  // Vérifier la course
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: { 
      request: { 
        include: { user: true } 
      } 
    }
  });

  if (!ride) {
    throw new AppError('Course non trouvée', 404);
  }

  if (ride.driverId !== driverId) {
    throw new AppError('Cette course ne vous appartient pas', 403);
  }

  if (ride.status !== 'IN_PROGRESS') {
    throw new AppError('La course doit être en cours', 400);
  }

  // Mettre à jour le statut
  const updatedRide = await prisma.ride.update({
    where: { id },
    data: { 
      arrivedAtDestinationAt: new Date()
    }
  });

  // Notifier le passager
  socketService.emitToUser(ride.request.userId, 'arrived-destination', {
    rideId: ride.id,
    message: 'Vous êtes arrivé à destination'
  });

  res.json({
    success: true,
    message: 'Arrivée à destination signalée',
    ride: {
      id: updatedRide.id,
      status: updatedRide.status,
      arrivedAt: updatedRide.arrivedAtDestinationAt
    }
  });
}));

/**
 * POST /api/transport/rides/:id/complete
 * Terminer la course
 */
router.post('/rides/:id/complete', requireDriverProfile, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const driverId = req.user.userId;
  const { finalPrice } = req.body;

  // Vérifier la course
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: { 
      request: { 
        include: { user: true } 
      } 
    }
  });

  if (!ride) {
    throw new AppError('Course non trouvée', 404);
  }

  if (ride.driverId !== driverId) {
    throw new AppError('Cette course ne vous appartient pas', 403);
  }

  if (ride.status !== 'IN_PROGRESS') {
    throw new AppError('La course doit être en cours', 400);
  }

  const priceToCharge = finalPrice || parseFloat(ride.price);

  // Transaction pour terminer la course et créditer le driver
  const result = await prisma.$transaction(async (tx) => {
    // Terminer la course
    const completedRide = await tx.ride.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        completedAt: new Date(),
        price: priceToCharge
      }
    });

    await tx.rideRequest.update({
      where: { id: ride.requestId },
      data: { 
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Créditer le portefeuille du driver (commission de 85% par exemple)
    const driverEarnings = priceToCharge * 0.85;
    const platformFee = priceToCharge * 0.15;

    const driverWallet = await tx.wallet.findUnique({
      where: { userId: driverId }
    });

    if (!driverWallet) {
      throw new AppError('Portefeuille du driver non trouvé', 404);
    }

    const updatedWallet = await tx.wallet.update({
      where: { userId: driverId },
      data: { balance: { increment: driverEarnings } }
    });

    // Créer la transaction
    await tx.transaction.create({
      data: {
        userId: driverId,
        walletId: driverWallet.id,
        type: 'RIDE_EARNINGS',
        amount: driverEarnings,
        balanceBefore: driverWallet.balance,
        balanceAfter: updatedWallet.balance,
        status: 'COMPLETED',
        description: `Gains course #${ride.id.substring(0, 8)}`,
        metadata: {
          rideId: ride.id,
          totalPrice: priceToCharge,
          platformFee: platformFee,
          earnings: driverEarnings
        }
      }
    });

    // Rendre le driver disponible
    await tx.driverProfile.update({
      where: { userId: driverId },
      data: { isAvailable: true }
    });

    return { completedRide, updatedWallet, driverEarnings };
  });

  // Notifier le passager
  socketService.emitToUser(ride.request.userId, 'ride-completed', {
    rideId: ride.id,
    message: 'Course terminée avec succès',
    price: priceToCharge
  });

  res.json({
    success: true,
    message: 'Course terminée avec succès',
    ride: {
      id: result.completedRide.id,
      status: result.completedRide.status,
      completedAt: result.completedRide.completedAt,
      finalPrice: priceToCharge,
      earnings: result.driverEarnings,
      newBalance: result.updatedWallet.balance
    }
  });
}));

/**
 * POST /api/transport/rides/:id/cancel
 * Annuler la course
 */
router.post('/rides/:id/cancel', requireDriverProfile, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const driverId = req.user.userId;

  if (!reason || reason.trim().length === 0) {
    throw new AppError('Une raison d\'annulation est requise', 400);
  }

  // Vérifier la course
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: { 
      request: { 
        include: { user: true } 
      } 
    }
  });

  if (!ride) {
    throw new AppError('Course non trouvée', 404);
  }

  if (ride.driverId !== driverId) {
    throw new AppError('Cette course ne vous appartient pas', 403);
  }

  if (ride.status === 'COMPLETED' || ride.status === 'CANCELLED') {
    throw new AppError('Cette course ne peut plus être annulée', 400);
  }

  // Annuler la course
  await prisma.$transaction(async (tx) => {
    await tx.ride.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason,
        cancelledBy: 'DRIVER'
      }
    });

    await tx.rideRequest.update({
      where: { id: ride.requestId },
      data: { 
        status: 'CANCELLED',
        cancelReason: reason
      }
    });

    // Rendre le driver disponible
    await tx.driverProfile.update({
      where: { userId: driverId },
      data: { isAvailable: true }
    });
  });

  // Notifier le passager
  socketService.emitToUser(ride.request.userId, 'ride-cancelled-by-driver', {
    rideId: ride.id,
    message: 'Le chauffeur a annulé la course',
    reason: reason
  });

  res.json({
    success: true,
    message: 'Course annulée',
    data: {
      rideId: id,
      reason: reason
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

// ==================== ENDPOINTS DRIVERS ====================

/**
 * GET /api/transport/available-rides
 * Récupérer les courses disponibles pour un driver
 */
router.get('/available-rides', requireDriverProfile, asyncHandler(async (req, res) => {
  const driverId = req.user.userId;

  // Récupérer le profil driver avec sa localisation
  const driverProfile = await prisma.driverProfile.findUnique({
    where: { userId: driverId }
  });

  if (!driverProfile) {
    throw new AppError('Profil driver non trouvé', 404);
  }

  if (!driverProfile.isOnline) {
    return res.json({
      success: true,
      rides: [],
      message: 'Vous devez être en ligne pour voir les courses disponibles'
    });
  }

  // Récupérer les courses en attente dans un rayon de 10km
  const pendingRides = await prisma.rideRequest.findMany({
    where: {
      status: 'PENDING',
      driverId: null
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          profileImage: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Filtrer par distance si le driver a une position
  let availableRides = pendingRides;
  if (driverProfile.currentLat && driverProfile.currentLng) {
    availableRides = pendingRides.filter(ride => {
      const distance = calculateDistance(
        driverProfile.currentLat,
        driverProfile.currentLng,
        ride.pickupLat,
        ride.pickupLng
      );
      return distance <= 10; // 10km de rayon
    });
  }

  const formattedRides = availableRides.map(ride => ({
    id: ride.id,
    passenger: {
      id: ride.user.id,
      name: `${ride.user.firstName} ${ride.user.lastName}`,
      phone: ride.user.phoneNumber,
      image: ride.user.profileImage
    },
    pickup: {
      address: ride.pickupAddress,
      lat: ride.pickupLat,
      lng: ride.pickupLng
    },
    dropoff: {
      address: ride.dropoffAddress,
      lat: ride.dropoffLat,
      lng: ride.dropoffLng
    },
    rideType: ride.rideType,
    estimatedPrice: ride.estimatedPrice,
    distance: ride.distance,
    estimatedDuration: ride.estimatedDuration,
    createdAt: ride.createdAt,
    distanceFromDriver: driverProfile.currentLat && driverProfile.currentLng 
      ? calculateDistance(
          driverProfile.currentLat,
          driverProfile.currentLng,
          ride.pickupLat,
          ride.pickupLng
        )
      : null
  }));

  // Trier par distance du driver
  if (driverProfile.currentLat && driverProfile.currentLng) {
    formattedRides.sort((a, b) => a.distanceFromDriver - b.distanceFromDriver);
  }

  res.json({
    success: true,
    rides: formattedRides,
    driverLocation: {
      lat: driverProfile.currentLat,
      lng: driverProfile.currentLng
    }
  });
}));

/**
 * GET /api/transport/driver-stats
 * Statistiques du driver
 */
router.get('/driver-stats', requireDriverProfile, asyncHandler(async (req, res) => {
  const driverId = req.user.userId;

  // Récupérer le profil driver
  const driverProfile = await prisma.driverProfile.findUnique({
    where: { userId: driverId }
  });

  if (!driverProfile) {
    throw new AppError('Profil driver non trouvé', 404);
  }

  // Statistiques des courses
  const totalRides = await prisma.rideRequest.count({
    where: {
      driverId: driverId,
      status: 'COMPLETED'
    }
  });

  const todayRides = await prisma.rideRequest.count({
    where: {
      driverId: driverId,
      status: 'COMPLETED',
      completedAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  });

  // Calcul des gains
  const completedRides = await prisma.rideRequest.findMany({
    where: {
      driverId: driverId,
      status: 'COMPLETED'
    },
    select: {
      estimatedPrice: true,
      completedAt: true
    }
  });

  const totalEarnings = completedRides.reduce((sum, ride) => sum + ride.estimatedPrice, 0);
  
  const todayEarnings = completedRides
    .filter(ride => ride.completedAt >= new Date(new Date().setHours(0, 0, 0, 0)))
    .reduce((sum, ride) => sum + ride.estimatedPrice, 0);

  // Récupérer le solde du portefeuille
  const wallet = await prisma.wallet.findUnique({
    where: { userId: driverId }
  });

  // Courses en cours
  const activeRide = await prisma.rideRequest.findFirst({
    where: {
      driverId: driverId,
      status: {
        in: ['ACCEPTED', 'DRIVER_ARRIVING', 'ARRIVED', 'IN_PROGRESS']
      }
    },
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

  res.json({
    success: true,
    stats: {
      totalRides,
      todayRides,
      totalEarnings,
      todayEarnings,
      averageRating: driverProfile.averageRating || 0,
      totalRatings: driverProfile.totalRatings || 0,
      isOnline: driverProfile.isOnline,
      walletBalance: wallet?.balance || 0
    },
    activeRide: activeRide ? {
      id: activeRide.id,
      status: activeRide.status,
      passenger: {
        name: `${activeRide.user.firstName} ${activeRide.user.lastName}`,
        phone: activeRide.user.phoneNumber,
        image: activeRide.user.profileImage
      },
      pickup: {
        address: activeRide.pickupAddress,
        lat: activeRide.pickupLat,
        lng: activeRide.pickupLng
      },
      dropoff: {
        address: activeRide.dropoffAddress,
        lat: activeRide.dropoffLat,
        lng: activeRide.dropoffLng
      },
      estimatedPrice: activeRide.estimatedPrice,
      createdAt: activeRide.createdAt
    } : null
  });
}));

/**
 * POST /api/transport/driver-status
 * Changer le statut du driver (online/offline)
 */
router.post('/driver-status', requireDriverProfile, asyncHandler(async (req, res) => {
  const driverId = req.user.userId;
  const { isOnline, latitude, longitude } = req.body;

  if (typeof isOnline !== 'boolean') {
    throw new AppError('Le statut isOnline est requis', 400);
  }

  // Vérifier qu'il n'y a pas de course en cours avant de passer offline
  if (!isOnline) {
    const activeRide = await prisma.rideRequest.findFirst({
      where: {
        driverId: driverId,
        status: {
          in: ['ACCEPTED', 'DRIVER_ARRIVING', 'ARRIVED', 'IN_PROGRESS']
        }
      }
    });

    if (activeRide) {
      throw new AppError('Impossible de passer hors ligne avec une course en cours', 400);
    }
  }

  // Mettre à jour le statut
  const updateData = {
    isOnline,
    lastSeen: new Date()
  };

  // Mettre à jour la position si fournie
  if (latitude && longitude) {
    updateData.currentLat = latitude;
    updateData.currentLng = longitude;
  }

  const driverProfile = await prisma.driverProfile.update({
    where: { userId: driverId },
    data: updateData
  });

  // Notifier via Socket.io
  socketService.emitToUser(driverId, 'driverStatusChanged', {
    isOnline: driverProfile.isOnline,
    timestamp: new Date()
  });

  res.json({
    success: true,
    message: `Vous êtes maintenant ${isOnline ? 'en ligne' : 'hors ligne'}`,
    data: {
      isOnline: driverProfile.isOnline,
      lastSeen: driverProfile.lastSeen,
      currentLocation: driverProfile.currentLat && driverProfile.currentLng ? {
        lat: driverProfile.currentLat,
        lng: driverProfile.currentLng
      } : null
    }
  });
}));

/**
 * GET /api/transport/driver-earnings
 * Détails des gains du driver par période
 */
router.get('/driver-earnings', requireDriverProfile, asyncHandler(async (req, res) => {
  const driverId = req.user.userId;
  const { period = 'week' } = req.query; // 'today', 'week', 'month', 'all'

  let startDate;
  const now = new Date();

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      startDate = null;
  }

  const whereClause = {
    driverId: driverId,
    status: 'COMPLETED'
  };

  if (startDate) {
    whereClause.completedAt = { gte: startDate };
  }

  const completedRides = await prisma.rideRequest.findMany({
    where: whereClause,
    select: {
      id: true,
      estimatedPrice: true,
      distance: true,
      rideType: true,
      completedAt: true,
      pickupAddress: true,
      dropoffAddress: true
    },
    orderBy: {
      completedAt: 'desc'
    }
  });

  const totalEarnings = completedRides.reduce((sum, ride) => sum + ride.estimatedPrice, 0);
  const totalDistance = completedRides.reduce((sum, ride) => sum + ride.distance, 0);

  // Grouper par jour
  const earningsByDay = {};
  completedRides.forEach(ride => {
    const day = ride.completedAt.toISOString().split('T')[0];
    if (!earningsByDay[day]) {
      earningsByDay[day] = {
        date: day,
        rides: 0,
        earnings: 0
      };
    }
    earningsByDay[day].rides++;
    earningsByDay[day].earnings += ride.estimatedPrice;
  });

  res.json({
    success: true,
    period,
    summary: {
      totalRides: completedRides.length,
      totalEarnings,
      totalDistance: Math.round(totalDistance * 100) / 100,
      averageEarningsPerRide: completedRides.length > 0 
        ? Math.round((totalEarnings / completedRides.length) * 100) / 100 
        : 0
    },
    earningsByDay: Object.values(earningsByDay),
    recentRides: completedRides.slice(0, 10).map(ride => ({
      id: ride.id,
      price: ride.estimatedPrice,
      distance: ride.distance,
      type: ride.rideType,
      from: ride.pickupAddress,
      to: ride.dropoffAddress,
      completedAt: ride.completedAt
    }))
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