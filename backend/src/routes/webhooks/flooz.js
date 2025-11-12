const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../../middleware/errorHandler');
const paymentService = require('../../services/paymentService');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Webhook FLOOZ Mobile Money
 */
router.post('/flooz/payment', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const payload = req.body;

  // Vérifier l'autorisation FLOOZ
  if (authHeader !== process.env.FLOOZ_API_KEY) {
    throw new AppError('Autorisation webhook invalide', 401);
  }

  const { 
    reference, 
    token, 
    status, 
    amount, 
    fees, 
    phone, 
    message,
    transaction_id 
  } = payload;

  // Trouver la transaction
  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { id: reference },
        { externalRef: token }
      ]
    },
    include: {
      wallet: {
        include: { user: true }
      }
    }
  });

  if (!transaction) {
    console.error('Transaction FLOOZ non trouvée:', reference);
    return res.status(404).json({ error: 'Transaction non trouvée' });
  }

  switch (status) {
    case 'SUCCESS':
    case 'COMPLETED':
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            fees: fees || transaction.fees,
            processedAt: new Date(),
            metadata: {
              ...transaction.metadata,
              floozResponse: payload
            }
          }
        });

        if (transaction.type === 'DEPOSIT') {
          await tx.wallet.update({
            where: { id: transaction.walletId },
            data: {
              balance: { increment: parseFloat(amount) },
              blockedAmount: { decrement: parseFloat(amount) }
            }
          });

          await tx.notification.create({
            data: {
              userId: transaction.wallet.userId,
              title: 'Recharge réussie',
              message: `Votre compte a été crédité de ${amount} F CFA via FLOOZ`,
              type: 'PAYMENT'
            }
          });
        }
      });

      console.log(`✅ Paiement FLOOZ complété: ${reference} - ${amount} F CFA`);
      break;

    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            metadata: {
              ...transaction.metadata,
              floozResponse: payload,
              failureReason: message || 'Paiement échoué'
            }
          }
        });

        if (transaction.type === 'DEPOSIT') {
          await tx.wallet.update({
            where: { id: transaction.walletId },
            data: {
              blockedAmount: { decrement: parseFloat(amount) }
            }
          });

          await tx.notification.create({
            data: {
              userId: transaction.wallet.userId,
              title: 'Recharge échouée',
              message: `Votre recharge de ${amount} F CFA via FLOOZ a échoué`,
              type: 'PAYMENT'
            }
          });
        }
      });

      console.log(`❌ Paiement FLOOZ échoué: ${reference} - ${message}`);
      break;

    case 'PENDING':
    case 'PROCESSING':
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'PROCESSING',
          metadata: {
            ...transaction.metadata,
            floozResponse: payload
          }
        }
      });
      break;

    default:
      console.warn(`Statut FLOOZ inconnu: ${status} pour transaction ${reference}`);
  }

  res.json({ success: true, message: 'Webhook FLOOZ traité' });
}));

/**
 * Webhook FLOOZ Withdrawal
 */
router.post('/flooz/withdrawal', asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const payload = req.body;

  if (authHeader !== process.env.FLOOZ_API_KEY) {
    throw new AppError('Autorisation webhook invalide', 401);
  }

  const { 
    reference, 
    status, 
    amount, 
    fees, 
    phone, 
    message 
  } = payload;

  const transaction = await prisma.transaction.findFirst({
    where: { id: reference },
    include: {
      wallet: {
        include: { user: true }
      }
    }
  });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction non trouvée' });
  }

  switch (status) {
    case 'SUCCESS':
    case 'COMPLETED':
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            fees: fees || transaction.fees,
            processedAt: new Date()
          }
        });

        await tx.notification.create({
          data: {
            userId: transaction.wallet.userId,
            title: 'Retrait réussi',
            message: `Retrait de ${Math.abs(amount)} F CFA vers FLOOZ effectué`,
            type: 'PAYMENT'
          }
        });
      });
      break;

    case 'FAILED':
    case 'CANCELLED':
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED' }
        });

        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: {
            balance: { increment: Math.abs(parseFloat(amount)) }
          }
        });

        await tx.notification.create({
          data: {
            userId: transaction.wallet.userId,
            title: 'Retrait échoué',
            message: `Votre retrait de ${Math.abs(amount)} F CFA a échoué. Fonds recrédités.`,
            type: 'PAYMENT'
          }
        });
      });
      break;
  }

  res.json({ success: true });
}));

module.exports = router;