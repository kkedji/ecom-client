const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');

const prisma = new PrismaClient();

class VerificationService {
  /**
   * Générer un token de vérification email
   */
  generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Générer un token de réinitialisation de mot de passe
   */
  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Envoyer un email de vérification à un utilisateur
   */
  async sendEmailVerification(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return { success: false, error: 'Utilisateur introuvable' };
      }

      if (user.emailVerified) {
        return { success: false, error: 'Email déjà vérifié' };
      }

      if (!user.email) {
        return { success: false, error: 'Aucun email associé à ce compte' };
      }

      // Générer le token
      const verificationToken = this.generateEmailVerificationToken();
      const expires = new Date();
      expires.setHours(expires.getHours() + 24); // Expire dans 24h

      // Sauvegarder le token
      await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerificationToken: verificationToken,
          emailVerificationExpires: expires
        }
      });

      // Envoyer l'email
      const emailResult = await emailService.sendVerificationEmail(user, verificationToken);

      if (!emailResult.success) {
        return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
      }

      return {
        success: true,
        message: 'Email de vérification envoyé'
      };
    } catch (error) {
      console.error('Erreur sendEmailVerification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Vérifier un token d'email
   */
  async verifyEmail(token) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: {
            gt: new Date() // Token non expiré
          }
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'Token invalide ou expiré'
        };
      }

      // Marquer l'email comme vérifié
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        }
      });

      return {
        success: true,
        message: 'Email vérifié avec succès',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      console.error('Erreur verifyEmail:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Demander une réinitialisation de mot de passe
   */
  async requestPasswordReset(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Pour la sécurité, on ne dit pas si l'email existe ou non
        return {
          success: true,
          message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
        };
      }

      // Générer le token
      const resetToken = this.generatePasswordResetToken();
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // Expire dans 1h

      // Sauvegarder le token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: expires
        }
      });

      // Envoyer l'email
      await emailService.sendPasswordResetEmail(user, resetToken);

      return {
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
      };
    } catch (error) {
      console.error('Erreur requestPasswordReset:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Vérifier un token de réinitialisation de mot de passe
   */
  async verifyPasswordResetToken(token) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'Token invalide ou expiré'
        };
      }

      return {
        success: true,
        userId: user.id
      };
    } catch (error) {
      console.error('Erreur verifyPasswordResetToken:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Réinitialiser le mot de passe avec un token valide
   */
  async resetPassword(token, newPassword) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'Token invalide ou expiré'
        };
      }

      // Hash du nouveau mot de passe
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mettre à jour le mot de passe et supprimer le token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null
        }
      });

      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      };
    } catch (error) {
      console.error('Erreur resetPassword:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Vérifier si l'email est requis selon les paramètres
   */
  async isEmailVerificationRequired() {
    try {
      const setting = await prisma.platformSettings.findUnique({
        where: { key: 'security' }
      });

      if (setting) {
        const securitySettings = JSON.parse(setting.value);
        return securitySettings.requireEmailVerification === true;
      }

      // Par défaut, pas requis
      return false;
    } catch (error) {
      console.error('Erreur isEmailVerificationRequired:', error);
      return false;
    }
  }
}

module.exports = new VerificationService();
