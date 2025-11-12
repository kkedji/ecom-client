const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Webhook PI-SPI BCEAO
 */
router.post('/bceao/payment', asyncHandler(async (req, res) => {
  const signature = req.headers['x-bceao-signature'];
  const payload = req.body;

  // Vérifier la signature BCEAO (plus complexe, utilise certificats)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.BCEAO_API_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new AppError('Signature BCEAO invalide', 401);
  }

  const {
    merchantId,
    transactionId,
    paymentToken,
    responseCode,
    responseMessage,
    amount,
    currency,
    cardType,
    maskedPan,
    timestamp
  } = payload;

  // Trouver la transaction
  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { id: transactionId },
        { externalRef: paymentToken }
      ]
    },
    include: {
      wallet: {
        include: { user: true }
      }
    }
  });

  if (!transaction) {
    console.error('Transaction BCEAO non trouvée:', transactionId);
    return res.status(404).json({ error: 'Transaction non trouvée' });
  }

  // Codes de réponse BCEAO standard
  switch (responseCode) {
    case '00': // Succès
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'COMPLETED',
            processedAt: new Date(timestamp),
            metadata: {
              ...transaction.metadata,
              bceaoResponse: payload,
              cardType,
              maskedPan
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
              message: `Votre compte a été crédité de ${amount} F CFA via ${cardType}`,
              type: 'PAYMENT'
            }
          });
        }
      });

      console.log(`✅ Paiement BCEAO complété: ${transactionId} - ${amount} F CFA`);
      break;

    case '01': // Référer à l'émetteur
    case '05': // Ne pas honorer
    case '12': // Transaction invalide
    case '13': // Montant invalide
    case '14': // Numéro de carte invalide
    case '30': // Erreur de format
    case '51': // Provision insuffisante
    case '54': // Carte expirée
    case '55': // Code PIN incorrect
    case '61': // Montant limite dépassé
    case '62': // Carte restreinte
    case '65': // Limite de fréquence dépassée
    case '75': // PIN saisi trop de fois
    case '91': // Émetteur indisponible
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            metadata: {
              ...transaction.metadata,
              bceaoResponse: payload,
              failureReason: responseMessage,
              responseCode
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
              message: `Votre recharge de ${amount} F CFA a échoué: ${responseMessage}`,
              type: 'PAYMENT'
            }
          });
        }
      });

      console.log(`❌ Paiement BCEAO échoué: ${transactionId} - Code: ${responseCode}, Message: ${responseMessage}`);
      break;

    default:
      console.warn(`Code réponse BCEAO inconnu: ${responseCode} pour transaction ${transactionId}`);
      
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'PROCESSING',
          metadata: {
            ...transaction.metadata,
            bceaoResponse: payload
          }
        }
      });
  }

  // Réponse au format BCEAO
  res.json({
    merchantId: merchantId,
    transactionId: transactionId,
    responseCode: '00',
    responseMessage: 'Webhook traité avec succès'
  });
}));

module.exports = router;