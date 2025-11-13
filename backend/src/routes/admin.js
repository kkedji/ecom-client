const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyAdmin, verifySuperAdmin } = require('../middleware/adminAuth');

const router = express.Router();
const prisma = new PrismaClient();

// ==================== DASHBOARD STATS ====================
/**
 * GET /api/admin/dashboard/stats
 * Statistiques principales du dashboard admin
 */
router.get('/dashboard/stats', verifyAdmin, asyncHandler(async (req, res) => {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Utilisateurs
  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({
    where: { isActive: true }
  });
  const newUsersLast7Days = await prisma.user.count({
    where: {
      createdAt: { gte: last7Days }
    }
  });

  // Commandes (Orders)
  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({
    where: { status: 'PENDING' }
  });
  const completedOrders = await prisma.order.count({
    where: { status: 'COMPLETED' }
  });

  // Revenus (somme des commandes COMPLETED)
  const revenueResult = await prisma.order.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { totalAmount: true }
  });
  const totalRevenue = revenueResult._sum.totalAmount || 0;

  const revenueLast30Days = await prisma.order.aggregate({
    where: {
      status: 'COMPLETED',
      createdAt: { gte: last30Days }
    },
    _sum: { totalAmount: true }
  });
  const revenue30d = revenueLast30Days._sum.totalAmount || 0;

  // Admins
  const totalAdmins = await prisma.user.count({
    where: { isAdmin: true }
  });

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        new7d: newUsersLast7Days,
        admins: totalAdmins
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders
      },
      revenue: {
        total: totalRevenue,
        last30Days: revenue30d
      },
      timestamp: now
    }
  });
}));

// ==================== ANALYTICS ====================
/**
 * GET /api/admin/analytics/revenue
 * Évolution des revenus par jour
 */
router.get('/analytics/revenue', verifyAdmin, asyncHandler(async (req, res) => {
  const { timeRange = '7d' } = req.query;
  
  const now = new Date();
  let startDate;
  
  switch(timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Récupérer toutes les commandes COMPLETED dans la période
  const orders = await prisma.order.findMany({
    where: {
      status: 'COMPLETED',
      createdAt: { gte: startDate }
    },
    select: {
      totalAmount: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

  // Grouper par jour
  const dailyRevenue = {};
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!dailyRevenue[date]) {
      dailyRevenue[date] = 0;
    }
    dailyRevenue[date] += Number(order.totalAmount);
  });

  // Convertir en tableau
  const revenueData = Object.keys(dailyRevenue).map(date => ({
    date,
    amount: dailyRevenue[date]
  }));

  res.json({
    success: true,
    data: revenueData
  });
}));

/**
 * GET /api/admin/analytics/users
 * Évolution des nouveaux utilisateurs par jour
 */
router.get('/analytics/users', verifyAdmin, asyncHandler(async (req, res) => {
  const { timeRange = '7d' } = req.query;
  
  const now = new Date();
  let startDate;
  
  switch(timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: startDate }
    },
    select: {
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  });

  // Grouper par jour
  const dailyUsers = {};
  users.forEach(user => {
    const date = user.createdAt.toISOString().split('T')[0];
    if (!dailyUsers[date]) {
      dailyUsers[date] = 0;
    }
    dailyUsers[date]++;
  });

  const userData = Object.keys(dailyUsers).map(date => ({
    date,
    count: dailyUsers[date]
  }));

  res.json({
    success: true,
    data: userData
  });
}));

/**
 * GET /api/admin/analytics/services
 * Distribution par type de service
 */
router.get('/analytics/services', verifyAdmin, asyncHandler(async (req, res) => {
  // Compter les commandes par service
  const ordersByService = await prisma.order.groupBy({
    by: ['serviceType'],
    _count: { id: true },
    _sum: { totalAmount: true }
  });

  const services = ordersByService.map(service => ({
    type: service.serviceType,
    count: service._count.id,
    revenue: service._sum.totalAmount || 0
  }));

  res.json({
    success: true,
    data: services
  });
}));

/**
 * GET /api/admin/analytics/top-users
 * Top utilisateurs par dépenses
 */
router.get('/analytics/top-users', verifyAdmin, asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  // Récupérer les utilisateurs avec leurs commandes
  const users = await prisma.user.findMany({
    include: {
      orders: {
        where: { status: 'COMPLETED' }
      }
    }
  });

  // Calculer les dépenses totales
  const usersWithSpending = users.map(user => {
    const totalSpent = user.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      phoneNumber: user.phoneNumber,
      totalSpent,
      orderCount: user.orders.length
    };
  });

  // Trier par dépenses et prendre le top
  const topUsers = usersWithSpending
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, Number(limit));

  res.json({
    success: true,
    data: topUsers
  });
}));

// ==================== USERS MANAGEMENT (SUPER_ADMIN ONLY) ====================
/**
 * GET /api/admin/users/list
 * Liste de tous les utilisateurs avec leurs statistiques
 */
router.get('/users/list', verifySuperAdmin, asyncHandler(async (req, res) => {
  const { search, role, status } = req.query;

  const where = {};

  // Filtre par recherche (nom, email, téléphone)
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search } }
    ];
  }

  // Filtre par rôle
  if (role && role !== 'all') {
    where.role = role;
  }

  // Filtre par statut
  if (status === 'active') {
    where.isActive = true;
  } else if (status === 'inactive') {
    where.isActive = false;
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      orders: {
        where: { status: 'COMPLETED' }
      },
      wallet: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculer les stats pour chaque utilisateur
  const usersWithStats = users.map(user => {
    const totalSpent = user.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      isVerified: user.isVerified,
      orderCount: user.orders.length,
      totalSpent,
      walletBalance: user.wallet?.balance || 0,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
  });

  res.json({
    success: true,
    data: usersWithStats,
    total: usersWithStats.length
  });
}));

/**
 * POST /api/admin/users/:id/promote
 * Promouvoir un utilisateur (changer son rôle)
 */
router.post('/users/:id/promote', verifySuperAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, isAdmin } = req.body;

  if (!['USER', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(role)) {
    return res.status(400).json({
      error: 'Rôle invalide',
      message: 'Le rôle doit être USER, ADMIN, SUPER_ADMIN ou MODERATOR'
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      role,
      isAdmin: isAdmin !== undefined ? isAdmin : (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MODERATOR')
    },
    select: {
      id: true,
      phoneNumber: true,
      firstName: true,
      lastName: true,
      role: true,
      isAdmin: true
    }
  });

  res.json({
    success: true,
    message: `Utilisateur promu au rôle ${role}`,
    data: updatedUser
  });
}));

/**
 * PUT /api/admin/users/:id/toggle-status
 * Activer/désactiver un utilisateur
 */
router.put('/users/:id/toggle-status', verifySuperAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { isActive: true, role: true }
  });

  if (!user) {
    return res.status(404).json({
      error: 'Utilisateur non trouvé',
      message: 'Cet utilisateur n\'existe pas'
    });
  }

  // Protection: ne pas désactiver un SUPER_ADMIN
  if (user.role === 'SUPER_ADMIN') {
    return res.status(403).json({
      error: 'Action interdite',
      message: 'Impossible de désactiver un SUPER_ADMIN'
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      phoneNumber: true,
      firstName: true,
      lastName: true,
      isActive: true
    }
  });

  res.json({
    success: true,
    message: `Utilisateur ${updatedUser.isActive ? 'activé' : 'désactivé'}`,
    data: updatedUser
  });
}));

/**
 * DELETE /api/admin/users/:id
 * Supprimer un utilisateur (SUPER_ADMIN uniquement)
 */
router.delete('/users/:id', verifySuperAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true }
  });

  if (!user) {
    return res.status(404).json({
      error: 'Utilisateur non trouvé'
    });
  }

  // Protection: ne pas supprimer un SUPER_ADMIN
  if (user.role === 'SUPER_ADMIN') {
    return res.status(403).json({
      error: 'Action interdite',
      message: 'Impossible de supprimer un SUPER_ADMIN'
    });
  }

  await prisma.user.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Utilisateur supprimé avec succès'
  });
}));

// ==================== WALLET MANAGEMENT ====================
/**
 * POST /api/admin/users/:userId/credit-balance
 * Créditer le portefeuille d'un utilisateur (ADMIN ou SUPER_ADMIN)
 */
router.post('/users/:userId/credit-balance', verifyAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { amount, reason } = req.body;
  const adminId = req.user.userId;

  // Validation
  if (!amount || amount <= 0) {
    return res.status(400).json({
      error: 'Montant invalide',
      message: 'Le montant doit être supérieur à 0'
    });
  }

  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({
      error: 'Raison requise',
      message: 'Vous devez fournir une raison pour ce crédit'
    });
  }

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  });

  if (!user) {
    return res.status(404).json({
      error: 'Utilisateur non trouvé'
    });
  }

  // Effectuer la transaction
  const result = await prisma.$transaction(async (tx) => {
    // Créer le wallet si nécessaire
    let wallet = user.wallet;
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          balance: 0
        }
      });
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Mettre à jour le solde
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: balanceAfter }
    });

    // Créer la transaction
    const transaction = await tx.transaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        type: 'ADMIN_CREDIT',
        amount: amount,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        status: 'COMPLETED',
        description: reason,
        metadata: {
          adminId: adminId,
          source: 'admin_manual'
        }
      }
    });

    // Logger l'action admin
    await tx.adminLog.create({
      data: {
        adminId: adminId,
        action: 'CREDIT_USER_WALLET',
        entityType: 'WALLET',
        entityId: wallet.id,
        details: {
          userId: user.id,
          amount: amount,
          reason: reason,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter
        }
      }
    });

    return { wallet: updatedWallet, transaction };
  });

  res.json({
    success: true,
    message: `Portefeuille crédité de ${amount} F avec succès`,
    data: {
      walletId: result.wallet.id,
      newBalance: result.wallet.balance,
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        type: result.transaction.type,
        status: result.transaction.status,
        description: result.transaction.description,
        createdAt: result.transaction.createdAt
      }
    }
  });
}));

/**
 * POST /api/admin/users/:userId/debit-balance
 * Débiter le portefeuille d'un utilisateur (ADMIN ou SUPER_ADMIN)
 */
router.post('/users/:userId/debit-balance', verifyAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { amount, reason } = req.body;
  const adminId = req.user.userId;

  // Validation
  if (!amount || amount <= 0) {
    return res.status(400).json({
      error: 'Montant invalide',
      message: 'Le montant doit être supérieur à 0'
    });
  }

  if (!reason || reason.trim().length === 0) {
    return res.status(400).json({
      error: 'Raison requise',
      message: 'Vous devez fournir une raison pour ce débit'
    });
  }

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true }
  });

  if (!user) {
    return res.status(404).json({
      error: 'Utilisateur non trouvé'
    });
  }

  if (!user.wallet) {
    return res.status(400).json({
      error: 'Portefeuille introuvable',
      message: 'Cet utilisateur n\'a pas de portefeuille'
    });
  }

  // Vérifier le solde suffisant
  if (user.wallet.balance < amount) {
    return res.status(400).json({
      error: 'Solde insuffisant',
      message: `Le solde actuel est de ${user.wallet.balance} F, impossible de débiter ${amount} F`
    });
  }

  // Effectuer la transaction
  const result = await prisma.$transaction(async (tx) => {
    const balanceBefore = user.wallet.balance;
    const balanceAfter = balanceBefore - amount;

    // Mettre à jour le solde
    const updatedWallet = await tx.wallet.update({
      where: { id: user.wallet.id },
      data: { balance: balanceAfter }
    });

    // Créer la transaction
    const transaction = await tx.transaction.create({
      data: {
        userId: user.id,
        walletId: user.wallet.id,
        type: 'ADMIN_DEBIT',
        amount: amount,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        status: 'COMPLETED',
        description: reason,
        metadata: {
          adminId: adminId,
          source: 'admin_manual'
        }
      }
    });

    // Logger l'action admin
    await tx.adminLog.create({
      data: {
        adminId: adminId,
        action: 'DEBIT_USER_WALLET',
        entityType: 'WALLET',
        entityId: user.wallet.id,
        details: {
          userId: user.id,
          amount: amount,
          reason: reason,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter
        }
      }
    });

    return { wallet: updatedWallet, transaction };
  });

  res.json({
    success: true,
    message: `Portefeuille débité de ${amount} F avec succès`,
    data: {
      walletId: result.wallet.id,
      newBalance: result.wallet.balance,
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        type: result.transaction.type,
        status: result.transaction.status,
        description: result.transaction.description,
        createdAt: result.transaction.createdAt
      }
    }
  });
}));

// ==================== PROMO CODES ====================
/**
 * GET /api/admin/promo-codes/list
 * Liste de tous les codes promo
 */
router.get('/promo-codes/list', verifyAdmin, asyncHandler(async (req, res) => {
  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: promoCodes
  });
}));

/**
 * POST /api/admin/promo-codes/create
 * Créer un nouveau code promo
 */
router.post('/promo-codes/create', verifyAdmin, asyncHandler(async (req, res) => {
  const { code, type, value, usageLimit, minAmount, expiresAt } = req.body;

  if (!code || !type || !value) {
    return res.status(400).json({
      error: 'Données manquantes',
      message: 'Code, type et valeur sont requis'
    });
  }

  // Vérifier que le code n'existe pas déjà
  const existing = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (existing) {
    return res.status(400).json({
      error: 'Code existant',
      message: 'Ce code promo existe déjà'
    });
  }

  const promoCode = await prisma.promoCode.create({
    data: {
      code: code.toUpperCase(),
      type,
      value: Number(value),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      minAmount: minAmount ? Number(minAmount) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true,
      usageCount: 0
    }
  });

  res.json({
    success: true,
    message: 'Code promo créé avec succès',
    data: promoCode
  });
}));

/**
 * PUT /api/admin/promo-codes/:id/toggle
 * Activer/désactiver un code promo
 */
router.put('/promo-codes/:id/toggle', verifyAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promoCode = await prisma.promoCode.findUnique({
    where: { id }
  });

  if (!promoCode) {
    return res.status(404).json({
      error: 'Code promo non trouvé'
    });
  }

  const updated = await prisma.promoCode.update({
    where: { id },
    data: { isActive: !promoCode.isActive }
  });

  res.json({
    success: true,
    message: `Code promo ${updated.isActive ? 'activé' : 'désactivé'}`,
    data: updated
  });
}));

/**
 * DELETE /api/admin/promo-codes/:id
 * Supprimer un code promo
 */
router.delete('/promo-codes/:id', verifyAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.promoCode.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Code promo supprimé'
  });
}));

// ==================== ECO-HABITS ====================
/**
 * GET /api/admin/eco-habits/pending
 * Liste des éco-habitudes en attente de validation
 */
router.get('/eco-habits/pending', verifyAdmin, asyncHandler(async (req, res) => {
  const habits = await prisma.ecoHabit.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  res.json({
    success: true,
    data: habits
  });
}));

/**
 * GET /api/admin/eco-habits/all
 * Toutes les éco-habitudes (avec filtres)
 */
router.get('/eco-habits/all', verifyAdmin, asyncHandler(async (req, res) => {
  const { status } = req.query;

  const where = {};
  if (status && status !== 'all') {
    where.status = status;
  }

  const habits = await prisma.ecoHabit.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: habits
  });
}));

/**
 * POST /api/admin/eco-habits/:id/validate
 * Valider une éco-habitude et créer des crédits carbone
 */
router.post('/eco-habits/:id/validate', verifyAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { co2Saved, adminComment } = req.body;

  if (!co2Saved || co2Saved <= 0) {
    return res.status(400).json({
      error: 'CO2 économisé requis',
      message: 'Veuillez indiquer la quantité de CO2 économisée (kg)'
    });
  }

  const habit = await prisma.ecoHabit.findUnique({
    where: { id }
  });

  if (!habit) {
    return res.status(404).json({
      error: 'Éco-habitude non trouvée'
    });
  }

  if (habit.status !== 'PENDING') {
    return res.status(400).json({
      error: 'Statut invalide',
      message: 'Cette éco-habitude a déjà été traitée'
    });
  }

  // Calculer les crédits carbone (62 FCFA par kg de CO2)
  const creditAmount = Math.floor(Number(co2Saved) * 62);

  // Transaction: valider l'habitude + créer crédit + créditer le wallet
  const result = await prisma.$transaction(async (tx) => {
    // 1. Valider l'éco-habitude
    const validated = await tx.ecoHabit.update({
      where: { id },
      data: {
        status: 'VALIDATED',
        validatedAt: new Date(),
        adminComment
      }
    });

    // 2. Créer le crédit carbone (expire dans 1 an)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const credit = await tx.carbonCredit.create({
      data: {
        userId: habit.userId,
        habitId: id,
        amount: creditAmount,
        co2Saved: Number(co2Saved),
        status: 'AVAILABLE',
        expiresAt
      }
    });

    // 3. Créditer le wallet de l'utilisateur
    await tx.wallet.update({
      where: { userId: habit.userId },
      data: {
        balance: { increment: creditAmount }
      }
    });

    // 4. Créer une transaction wallet
    await tx.transaction.create({
      data: {
        userId: habit.userId,
        type: 'CREDIT',
        amount: creditAmount,
        status: 'COMPLETED',
        description: `Crédit carbone - ${co2Saved} kg CO2 économisés`
      }
    });

    return { validated, credit };
  });

  res.json({
    success: true,
    message: `Éco-habitude validée. ${creditAmount} FCFA crédités`,
    data: result
  });
}));

/**
 * POST /api/admin/eco-habits/:id/reject
 * Rejeter une éco-habitude
 */
router.post('/eco-habits/:id/reject', verifyAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminComment } = req.body;

  const habit = await prisma.ecoHabit.findUnique({
    where: { id }
  });

  if (!habit) {
    return res.status(404).json({
      error: 'Éco-habitude non trouvée'
    });
  }

  if (habit.status !== 'PENDING') {
    return res.status(400).json({
      error: 'Statut invalide',
      message: 'Cette éco-habitude a déjà été traitée'
    });
  }

  const rejected = await prisma.ecoHabit.update({
    where: { id },
    data: {
      status: 'REJECTED',
      validatedAt: new Date(),
      adminComment: adminComment || 'Rejeté par l\'administrateur'
    }
  });

  res.json({
    success: true,
    message: 'Éco-habitude rejetée',
    data: rejected
  });
}));

// ==================== NOTIFICATIONS ====================
/**
 * GET /api/admin/notifications
 * Récupérer les notifications admin (logs récents)
 */
router.get('/notifications', verifyAdmin, asyncHandler(async (req, res) => {
  const { filter = 'all' } = req.query;

  // Pour cette première version, on retourne les logs admin récents
  const logs = await prisma.adminLog.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Formater en notifications
  const notifications = logs.map(log => ({
    id: log.id,
    type: 'system',
    title: log.action,
    message: `Action effectuée par ${log.admin.firstName} ${log.admin.lastName}`,
    createdAt: log.createdAt,
    isRead: true, // Par défaut, les logs sont considérés comme lus
    important: false
  }));

  res.json({
    success: true,
    data: notifications
  });
}));

// ==================== SETTINGS ====================
/**
 * GET /api/admin/settings
 * Récupérer les paramètres de la plateforme
 */
router.get('/settings', verifyAdmin, asyncHandler(async (req, res) => {
  // Récupérer les paramètres depuis la base de données
  const categories = ['platform', 'fees', 'limits', 'notifications', 'security'];
  const settings = {};

  for (const category of categories) {
    const setting = await prisma.platformSettings.findUnique({
      where: { key: category }
    });

    if (setting) {
      settings[category] = JSON.parse(setting.value);
    } else {
      // Valeurs par défaut si pas encore en BDD
      settings[category] = getDefaultSettings(category);
    }
  }

  res.json({
    success: true,
    data: settings
  });
}));

// Fonction helper pour les valeurs par défaut
function getDefaultSettings(category) {
  const defaults = {
    platform: {
      name: 'ECOM Platform',
      currency: 'FCFA',
      language: 'fr',
      timezone: 'Africa/Lome',
      maintenanceMode: false
    },
    fees: {
      driverCommission: 15,
      deliveryCommission: 10,
      luxPlusCommission: 20,
      marketplaceCommission: 5,
      carbonCreditRate: 62
    },
    limits: {
      maxPromoUsage: 100,
      maxOrderValue: 5000000,
      minOrderValue: 500,
      maxCarbonCreditPerMonth: 50000
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      adminEmailOnNewOrder: true,
      adminEmailOnNewUser: false,
      adminEmailOnEcoHabit: true
    },
    security: {
      requireEmailVerification: false,
      requirePhoneVerification: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8
    }
  };

  return defaults[category] || {};
}

/**
 * PUT /api/admin/settings
 * Mettre à jour les paramètres
 */
router.put('/settings', verifySuperAdmin, asyncHandler(async (req, res) => {
  const settings = req.body;
  const adminId = req.user.id;

  // Sauvegarder chaque catégorie de paramètres
  for (const [category, value] of Object.entries(settings)) {
    await prisma.platformSettings.upsert({
      where: { key: category },
      update: {
        value: JSON.stringify(value),
        updatedBy: adminId
      },
      create: {
        key: category,
        value: JSON.stringify(value),
        category: category,
        updatedBy: adminId
      }
    });
  }

  // Log de l'action admin
  await prisma.adminLog.create({
    data: {
      userId: adminId,
      action: 'UPDATE_SETTINGS',
      details: `Mise à jour des paramètres plateforme`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }
  });

  res.json({
    success: true,
    message: 'Paramètres mis à jour avec succès',
    data: settings
  });
}));

module.exports = router;
