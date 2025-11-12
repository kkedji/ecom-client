const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { requireWallet } = require('../middleware/auth');
const paymentService = require('../services/paymentService');

const router = express.Router();
const prisma = new PrismaClient();

// Schémas de validation
const addFundsSchema = Joi.object({
  amount: Joi.number().positive().max(1000000).required(),
  paymentMethod: Joi.string().valid('YAS', 'FLOOZ', 'VISA', 'MASTERCARD', 'PI_SPI_BCEAO').required(),
  phoneNumber: Joi.string().when('paymentMethod', {
    is: Joi.string().valid('YAS', 'FLOOZ'),
    then: Joi.string().pattern(/^(?:\+228|228)?[0-9]{8}$/).required(),
    otherwise: Joi.optional()
  }),
  cardToken: Joi.string().when('paymentMethod', {
    is: Joi.string().valid('VISA', 'MASTERCARD'),
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

const withdrawSchema = Joi.object({
  amount: Joi.number().positive().max(1000000).required(),
  paymentMethod: Joi.string().valid('YAS', 'FLOOZ').required(),
  phoneNumber: Joi.string().pattern(/^(?:\+228|228)?[0-9]{8}$/).required()
});

const transferSchema = Joi.object({
  amount: Joi.number().positive().max(100000).required(),
  recipientPhone: Joi.string().pattern(/^(?:\+228|228)?[0-9]{8}$/).required(),
  description: Joi.string().max(200).optional()
});

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     summary: Obtenir le solde du portefeuille
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 */
router.get('/balance', requireWallet, asyncHandler(async (req, res) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: req.userId },
    include: {
      transactions: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          description: true,
          createdAt: true
        }
      }
    }
  });

  res.json({
    success: true,
    wallet: {
      balance: parseFloat(wallet.balance),
      blockedAmount: parseFloat(wallet.blockedAmount),
      availableBalance: parseFloat(wallet.balance) - parseFloat(wallet.blockedAmount),
      isActive: wallet.isActive,
      recentTransactions: wallet.transactions
    }
  });
}));

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Obtenir l'historique des transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 */
router.get('/transactions', requireWallet, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const type = req.query.type; // DEPOSIT, WITHDRAWAL, PAYMENT, etc.
  const status = req.query.status; // PENDING, COMPLETED, FAILED, etc.
  
  const skip = (page - 1) * limit;

  const where = {
    wallet: { userId: req.userId }
  };

  if (type) where.type = type;
  if (status) where.status = status;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        ride: {
          select: {
            id: true,
            pickupAddress: true,
            dropoffAddress: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            store: {
              select: {
                storeName: true
              }
            }
          }
        }
      }
    }),
    prisma.transaction.count({ where })
  ]);

  res.json({
    success: true,
    transactions: transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      fees: parseFloat(t.fees),
      status: t.status,
      paymentMethod: t.paymentMethod,
      description: t.description,
      createdAt: t.createdAt,
      processedAt: t.processedAt,
      ride: t.ride,
      order: t.order
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * @swagger
 * /api/wallet/add-funds:
 *   post:
 *     summary: Ajouter des fonds au portefeuille
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 */
router.post('/add-funds', requireWallet, asyncHandler(async (req, res) => {
  const { error, value } = addFundsSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { amount, paymentMethod, phoneNumber, cardToken } = value;
  const userId = req.userId;

  // Vérifier les limites
  const dailyLimit = 500000; // 500,000 F CFA par jour
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDeposits = await prisma.transaction.aggregate({
    where: {
      wallet: { userId },
      type: 'DEPOSIT',
      status: 'COMPLETED',
      createdAt: { gte: today }
    },
    _sum: { amount: true }
  });

  const totalToday = parseFloat(todayDeposits._sum.amount || 0);
  
  if (totalToday + amount > dailyLimit) {
    throw new AppError(`Limite quotidienne dépassée. Vous pouvez encore déposer ${dailyLimit - totalToday} F CFA aujourd'hui.`, 400);
  }

  // Créer la transaction en attente
  const transaction = await prisma.transaction.create({
    data: {
      walletId: req.user.wallet.id,
      type: 'DEPOSIT',
      amount,
      paymentMethod,
      status: 'PENDING',
      description: `Dépôt via ${paymentMethod}`,
      metadata: {
        phoneNumber,
        cardToken
      }
    }
  });

  try {
    // Traitement du paiement selon la méthode
    let paymentResult;
    
    switch (paymentMethod) {
      case 'YAS':
        paymentResult = await paymentService.processYASPayment({
          transactionId: transaction.id,
          amount,
          phoneNumber,
          description: `Recharge Ecom - ${amount} F CFA`
        });
        break;

      case 'FLOOZ':
        paymentResult = await paymentService.processFLOOZPayment({
          transactionId: transaction.id,
          amount,
          phoneNumber,
          description: `Recharge Ecom - ${amount} F CFA`
        });
        break;

      case 'VISA':
      case 'MASTERCARD':
        paymentResult = await paymentService.processCardPayment({
          transactionId: transaction.id,
          amount,
          cardToken,
          description: `Recharge Ecom - ${amount} F CFA`
        });
        break;

      case 'PI_SPI_BCEAO':
        paymentResult = await paymentService.processBCEAOPayment({
          transactionId: transaction.id,
          amount,
          description: `Recharge Ecom - ${amount} F CFA`
        });
        break;

      default:
        throw new AppError('Méthode de paiement non supportée', 400);
    }

    // Mettre à jour la transaction avec la référence externe
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        externalRef: paymentResult.externalRef,
        status: paymentResult.status,
        metadata: {
          ...transaction.metadata,
          paymentResult
        }
      }
    });

    res.json({
      success: true,
      message: 'Demande de recharge initiée',
      transaction: {
        id: transaction.id,
        status: paymentResult.status,
        amount,
        paymentMethod,
        externalRef: paymentResult.externalRef,
        approvalUrl: paymentResult.approvalUrl, // Pour les paiements qui nécessitent une approbation
        instructions: paymentResult.instructions // Instructions pour l'utilisateur
      }
    });

  } catch (paymentError) {
    // Marquer la transaction comme échouée
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FAILED' }
    });

    throw new AppError(`Erreur de paiement: ${paymentError.message}`, 400);
  }
}));

/**
 * @swagger
 * /api/wallet/withdraw:
 *   post:
 *     summary: Retirer des fonds du portefeuille
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 */
router.post('/withdraw', requireWallet, asyncHandler(async (req, res) => {
  const { error, value } = withdrawSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { amount, paymentMethod, phoneNumber } = value;
  const wallet = req.user.wallet;

  // Vérifier le solde disponible
  const availableBalance = parseFloat(wallet.balance) - parseFloat(wallet.blockedAmount);
  const fees = amount * 0.02; // 2% de frais de retrait
  const totalDeduction = amount + fees;

  if (availableBalance < totalDeduction) {
    throw new AppError('Solde insuffisant pour effectuer ce retrait', 400);
  }

  // Vérifier les limites de retrait
  const minWithdraw = 1000; // 1,000 F CFA minimum
  const maxWithdraw = 200000; // 200,000 F CFA maximum par transaction

  if (amount < minWithdraw) {
    throw new AppError(`Montant minimum de retrait: ${minWithdraw} F CFA`, 400);
  }

  if (amount > maxWithdraw) {
    throw new AppError(`Montant maximum de retrait: ${maxWithdraw} F CFA par transaction`, 400);
  }

  // Créer la transaction de retrait
  const transaction = await prisma.transaction.create({
    data: {
      walletId: wallet.id,
      type: 'WITHDRAWAL',
      amount: -amount, // Montant négatif pour retrait
      fees,
      paymentMethod,
      status: 'PENDING',
      description: `Retrait vers ${paymentMethod} - ${phoneNumber}`,
      metadata: { phoneNumber }
    }
  });

  try {
    // Traitement du retrait selon la méthode
    let withdrawalResult;
    
    switch (paymentMethod) {
      case 'YAS':
        withdrawalResult = await paymentService.processYASWithdrawal({
          transactionId: transaction.id,
          amount,
          phoneNumber,
          description: `Retrait Ecom - ${amount} F CFA`
        });
        break;

      case 'FLOOZ':
        withdrawalResult = await paymentService.processFLOOZWithdrawal({
          transactionId: transaction.id,
          amount,
          phoneNumber,
          description: `Retrait Ecom - ${amount} F CFA`
        });
        break;

      default:
        throw new AppError('Méthode de retrait non supportée', 400);
    }

    // Mettre à jour le solde et la transaction
    await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: totalDeduction }
        }
      }),
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          externalRef: withdrawalResult.externalRef,
          status: withdrawalResult.status,
          processedAt: new Date()
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Retrait traité avec succès',
      transaction: {
        id: transaction.id,
        amount,
        fees,
        paymentMethod,
        status: withdrawalResult.status,
        externalRef: withdrawalResult.externalRef
      }
    });

  } catch (withdrawalError) {
    // Marquer la transaction comme échouée
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'FAILED' }
    });

    throw new AppError(`Erreur de retrait: ${withdrawalError.message}`, 400);
  }
}));

/**
 * @swagger
 * /api/wallet/transfer:
 *   post:
 *     summary: Transférer des fonds vers un autre utilisateur
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 */
router.post('/transfer', requireWallet, asyncHandler(async (req, res) => {
  const { error, value } = transferSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { amount, recipientPhone, description } = value;
  const senderWallet = req.user.wallet;

  // Normaliser le numéro du destinataire
  const normalizedPhone = recipientPhone.startsWith('+228') 
    ? recipientPhone 
    : `+228${recipientPhone.replace(/^228/, '')}`;

  // Trouver le destinataire
  const recipient = await prisma.user.findUnique({
    where: { phoneNumber: normalizedPhone },
    include: { wallet: true }
  });

  if (!recipient) {
    throw new AppError('Destinataire non trouvé', 404);
  }

  if (!recipient.wallet) {
    throw new AppError('Le destinataire n\'a pas de portefeuille actif', 400);
  }

  if (recipient.id === req.userId) {
    throw new AppError('Vous ne pouvez pas vous transférer de l\'argent à vous-même', 400);
  }

  // Vérifier le solde
  const availableBalance = parseFloat(senderWallet.balance) - parseFloat(senderWallet.blockedAmount);
  const fees = amount > 5000 ? amount * 0.01 : 0; // 1% de frais pour transferts > 5000 F CFA
  const totalDeduction = amount + fees;

  if (availableBalance < totalDeduction) {
    throw new AppError('Solde insuffisant pour effectuer ce transfert', 400);
  }

  // Effectuer le transfert dans une transaction
  const result = await prisma.$transaction(async (tx) => {
    // Transaction de débit pour l'expéditeur
    const debitTransaction = await tx.transaction.create({
      data: {
        walletId: senderWallet.id,
        type: 'TRANSFER',
        amount: -amount,
        fees,
        paymentMethod: 'WALLET',
        status: 'COMPLETED',
        description: description || `Transfert vers ${recipient.firstName} ${recipient.lastName}`,
        metadata: { recipientId: recipient.id, recipientPhone: normalizedPhone }
      }
    });

    // Transaction de crédit pour le destinataire
    const creditTransaction = await tx.transaction.create({
      data: {
        walletId: recipient.wallet.id,
        type: 'TRANSFER',
        amount: amount,
        fees: 0,
        paymentMethod: 'WALLET',
        status: 'COMPLETED',
        description: `Transfert de ${req.user.firstName} ${req.user.lastName}`,
        metadata: { senderId: req.userId, senderPhone: req.user.phoneNumber }
      }
    });

    // Mettre à jour les soldes
    await tx.wallet.update({
      where: { id: senderWallet.id },
      data: { balance: { decrement: totalDeduction } }
    });

    await tx.wallet.update({
      where: { id: recipient.wallet.id },
      data: { balance: { increment: amount } }
    });

    return { debitTransaction, creditTransaction };
  });

  res.json({
    success: true,
    message: 'Transfert effectué avec succès',
    transfer: {
      id: result.debitTransaction.id,
      amount,
      fees,
      recipient: {
        name: `${recipient.firstName} ${recipient.lastName}`,
        phone: normalizedPhone
      },
      description: description || `Transfert vers ${recipient.firstName} ${recipient.lastName}`
    }
  });
}));

/**
 * @swagger
 * /api/wallet/payment-methods:
 *   get:
 *     summary: Obtenir les méthodes de paiement disponibles
 *     tags: [Wallet]
 */
router.get('/payment-methods', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    paymentMethods: [
      {
        id: 'YAS',
        name: 'YAS Mobile Money',
        type: 'mobile_money',
        provider: 'Togocel',
        fees: '2%',
        limits: {
          min: 500,
          max: 500000,
          daily: 1000000
        },
        available: true
      },
      {
        id: 'FLOOZ',
        name: 'FLOOZ',
        type: 'mobile_money',
        provider: 'Moov',
        fees: '2%',
        limits: {
          min: 500,
          max: 500000,
          daily: 1000000
        },
        available: true
      },
      {
        id: 'VISA',
        name: 'Visa',
        type: 'card',
        provider: 'International',
        fees: '2.5%',
        limits: {
          min: 1000,
          max: 1000000,
          daily: 2000000
        },
        available: true
      },
      {
        id: 'MASTERCARD',
        name: 'Mastercard',
        type: 'card',
        provider: 'International',
        fees: '2.5%',
        limits: {
          min: 1000,
          max: 1000000,
          daily: 2000000
        },
        available: true
      },
      {
        id: 'PI_SPI_BCEAO',
        name: 'PI-SPI BCEAO',
        type: 'bank_transfer',
        provider: 'BCEAO',
        fees: '1%',
        limits: {
          min: 1000,
          max: 2000000,
          daily: 5000000
        },
        available: true
      }
    ]
  });
}));

module.exports = router;