const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configuration du transporteur email
    // Utilise les variables d'environnement pour la configuration SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    this.fromName = process.env.SMTP_FROM_NAME || 'ECOM Platform';
  }

  /**
   * Méthode générique pour envoyer un email
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      // Vérifier si les emails sont activés dans les paramètres
      // (cette vérification sera faite par le service de notifications)
      
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Email envoyé:', {
        to,
        subject,
        messageId: info.messageId
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Envoyer un email de vérification
   */
  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue sur ECOM Platform !</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${user.firstName} ${user.lastName}</strong>,</p>
            
            <p>Merci de vous être inscrit sur ECOM Platform. Pour finaliser votre inscription et accéder à toutes les fonctionnalités, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">✅ Vérifier mon email</a>
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p style="background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <p><strong>⏰ Ce lien expirera dans 24 heures.</strong></p>
            
            <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ECOM Platform - Transport & Marketplace au Togo</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '✅ Vérifiez votre adresse email - ECOM Platform',
      html
    });
  }

  /**
   * Envoyer un email de nouvelle commande à l'admin
   */
  async sendNewOrderNotification(order, adminEmail) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #FF9800; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🛒 Nouvelle Commande</h2>
          </div>
          <div class="content">
            <p>Une nouvelle commande vient d'être passée sur la plateforme.</p>
            
            <div class="info-box">
              <p><strong>Commande #:</strong> ${order.id}</p>
              <p><strong>Client:</strong> ${order.user?.firstName} ${order.user?.lastName}</p>
              <p><strong>Montant:</strong> ${order.totalAmount?.toLocaleString('fr-FR')} F CFA</p>
              <p><strong>Service:</strong> ${order.serviceType}</p>
              <p><strong>Statut:</strong> ${order.status}</p>
            </div>
            
            <p>Connectez-vous au panneau admin pour plus de détails.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ECOM Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: '🛒 Nouvelle commande sur ECOM Platform',
      html
    });
  }

  /**
   * Envoyer un email de nouvel utilisateur à l'admin
   */
  async sendNewUserNotification(user, adminEmail) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>👤 Nouvel Utilisateur</h2>
          </div>
          <div class="content">
            <p>Un nouvel utilisateur vient de s'inscrire sur la plateforme.</p>
            
            <div class="info-box">
              <p><strong>Nom:</strong> ${user.firstName} ${user.lastName}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Téléphone:</strong> ${user.phone || 'Non renseigné'}</p>
              <p><strong>Date d'inscription:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: '👤 Nouvel utilisateur inscrit - ECOM Platform',
      html
    });
  }

  /**
   * Envoyer un email de validation d'éco-habitude à l'admin
   */
  async sendEcoHabitNotification(habit, adminEmail) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🌱 Nouvelle Éco-Habitude à Valider</h2>
          </div>
          <div class="content">
            <p>Une nouvelle déclaration d'éco-habitude nécessite votre validation.</p>
            
            <div class="info-box">
              <p><strong>Utilisateur:</strong> ${habit.user?.firstName} ${habit.user?.lastName}</p>
              <p><strong>Type d'habitude:</strong> ${habit.habitType}</p>
              <p><strong>Description:</strong> ${habit.description}</p>
              <p><strong>CO₂ économisé:</strong> ${habit.co2Saved} kg</p>
              <p><strong>Crédits carbone:</strong> ${habit.carbonCreditsEarned}</p>
            </div>
            
            <p>Connectez-vous au panneau admin pour valider ou rejeter cette déclaration.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: '🌱 Nouvelle éco-habitude à valider - ECOM Platform',
      html
    });
  }

  /**
   * Envoyer email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F44336; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #F44336; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .warning { background: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔒 Réinitialisation de mot de passe</h2>
          </div>
          <div class="content">
            <p>Bonjour <strong>${user.firstName}</strong>,</p>
            
            <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important :</strong></p>
              <ul>
                <li>Ce lien expirera dans 1 heure</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Votre mot de passe actuel restera inchangé jusqu'à ce que vous en créiez un nouveau</li>
              </ul>
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez ce lien :</p>
            <p style="background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: '🔒 Réinitialisation de votre mot de passe - ECOM Platform',
      html
    });
  }

  /**
   * Enlever les balises HTML d'une chaîne (fallback pour text brut)
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Vérifier la configuration du service
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Service email prêt');
      return true;
    } catch (error) {
      console.error('❌ Erreur configuration email:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();
