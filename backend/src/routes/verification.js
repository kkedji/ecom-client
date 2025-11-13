const express = require('express');
const router = express.Router();
const verificationService = require('../services/verificationService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/verification/send-email
 * Envoyer un email de vérification
 */
router.post('/send-email', asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userId requis'
    });
  }

  const result = await verificationService.sendEmailVerification(userId);
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

/**
 * GET /api/verification/verify-email/:token
 * Vérifier un email avec un token
 */
router.get('/verify-email/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const result = await verificationService.verifyEmail(token);
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

/**
 * POST /api/verification/request-password-reset
 * Demander une réinitialisation de mot de passe
 */
router.post('/request-password-reset', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email requis'
    });
  }

  const result = await verificationService.requestPasswordReset(email);
  res.json(result);
}));

/**
 * POST /api/verification/reset-password
 * Réinitialiser le mot de passe avec un token
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Token et nouveau mot de passe requis'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Le mot de passe doit contenir au moins 8 caractères'
    });
  }

  const result = await verificationService.resetPassword(token, newPassword);
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

/**
 * GET /api/verification/check-token/:token
 * Vérifier si un token de réinitialisation est valide
 */
router.get('/check-token/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const result = await verificationService.verifyPasswordResetToken(token);
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}));

module.exports = router;
