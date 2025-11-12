const express = require('express');
const yasWebhooks = require('./yas');
const floozWebhooks = require('./flooz');
const bceaoWebhooks = require('./bceao');

const router = express.Router();

// Middleware pour parser le JSON raw (nécessaire pour vérifier les signatures)
router.use('/yas', express.raw({ type: 'application/json' }));
router.use('/flooz', express.raw({ type: 'application/json' }));
router.use('/bceao', express.raw({ type: 'application/json' }));

// Routes webhooks
router.use('/yas', yasWebhooks);
router.use('/flooz', floozWebhooks);
router.use('/bceao', bceaoWebhooks);

// Health check pour les webhooks
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Webhooks service is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/webhooks/yas/payment',
      '/webhooks/yas/withdrawal', 
      '/webhooks/flooz/payment',
      '/webhooks/flooz/withdrawal',
      '/webhooks/bceao/payment'
    ]
  });
});

module.exports = router;