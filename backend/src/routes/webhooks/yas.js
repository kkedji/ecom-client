const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../../middleware/errorHandler');
const paymentService = require('../../services/paymentService');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Webhook YAS Mobile Money
 * Reçoit les notifications de statut des paiements YAS
 */
router.post('/yas/payment', asyncHandler(async (req, res) => {
  const signature = req.headers['x-yas-signature'];
  const payload = req.body;

  // Vérifier la signature
  const isValid = paymentService.validateWebhookSignature(
    payload,
    signature,
    process.env.YAS_WEBHOOK_SECRET
  );

  if (!isValid) {
    throw new AppError('Signature webhook invalide', 401);
  }

  const { 
    transaction_id, 
    payment_token, 
    status, 
    amount, 
    fees, 
    phone_number,
    timestamp 
  } = payload;

  // Trouver la transaction dans notre base
  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { id: transaction_id },
        { externalRef: payment_token }
      ]
    },
    include: {
      wallet: {
        include: { user: true }
      }
    }
  });

  if (!transaction) {
    console.error('Transaction YAS non trouvée:', transaction_id);
    return res.status(404).json({ error: 'Transaction non trouvée' });
  }

  // Traitement selon le statut
  switch (status) {
    case 'COMPLETED':
    case 'SUCCESS':
      await prisma.$transaction(async (tx) => {
        // Mettre à jour la transaction
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            fees: fees || transaction.fees,
            processedAt: new Date(timestamp),
            metadata: {
              ...transaction.metadata,
              yasResponse: payload
            }
          }
        });

        // Si c'est un dépôt, créditer le wallet
        if (transaction.type === 'DEPOSIT') {
          await tx.wallet.update({
            where: { id: transaction.walletId },
            data: {
              balance: { increment: parseFloat(amount) },
              blockedAmount: { decrement: parseFloat(amount) }
            }
          });

          // Créer notification
          await tx.notification.create({
            data: {
              userId: transaction.wallet.userId,
              title: 'Recharge réussie',
              message: `Votre compte a été crédité de ${amount} F CFA via YAS`,
              type: 'PAYMENT'
            }
          });
        }
      });

      console.log(`✅ Paiement YAS complété: ${transaction_id} - ${amount} F CFA`);
      break;

    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
      await prisma.$transaction(async (tx) => {
        // Mettre à jour la transaction
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            metadata: {
              ...transaction.metadata,
              yasResponse: payload,
              failureReason: payload.error_message || 'Paiement échoué'
            }
          }
        });

        // Si c'est un dépôt, libérer le montant bloqué
        if (transaction.type === 'DEPOSIT') {
          await tx.wallet.update({
            where: { id: transaction.walletId },
            data: {
              blockedAmount: { decrement: parseFloat(amount) }
            }
          });

          // Créer notification
          await tx.notification.create({
            data: {
              userId: transaction.wallet.userId,
              title: 'Recharge échouée',
              message: `Votre recharge de ${amount} F CFA via YAS a échoué`,
              type: 'PAYMENT'
            }
          });
        }
      });

      console.log(`❌ Paiement YAS échoué: ${transaction_id} - ${payload.error_message}`);
      break;

    case 'PENDING':
    case 'PROCESSING':
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'PROCESSING',
          metadata: {
            ...transaction.metadata,
            yasResponse: payload
          }
        }
      });
      break;

    default:
      console.warn(`Statut YAS inconnu: ${status} pour transaction ${transaction_id}`);
  }

  res.json({ success: true, message: 'Webhook traité' });
}));

/**
 * Webhook YAS Withdrawal
 */
router.post('/yas/withdrawal', asyncHandler(async (req, res) => {
  const signature = req.headers['x-yas-signature'];
  const payload = req.body;

  const isValid = paymentService.validateWebhookSignature(
    payload,
    signature,
    process.env.YAS_WEBHOOK_SECRET
  );

  if (!isValid) {
    throw new AppError('Signature webhook invalide', 401);
  }

  const { 
    transaction_id, 
    withdrawal_token, 
    status, 
    amount, 
    fees, 
    phone_number 
  } = payload;

  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { id: transaction_id },
        { externalRef: withdrawal_token }
      ]
    },
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
    case 'COMPLETED':
    case 'SUCCESS':
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
            message: `Retrait de ${Math.abs(amount)} F CFA vers YAS effectué`,
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

        // Recréditer le wallet en cas d'échec
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