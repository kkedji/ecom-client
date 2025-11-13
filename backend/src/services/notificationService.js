const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');
const socketService = require('./socketService');

const prisma = new PrismaClient();

class NotificationService {
  /**
   * Récupérer les paramètres de notifications
   */
  async getNotificationSettings() {
    try {
      const setting = await prisma.platformSettings.findUnique({
        where: { key: 'notifications' }
      });

      if (setting) {
        return JSON.parse(setting.value);
      }

      // Paramètres par défaut
      return {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: true,
        adminEmailOnNewOrder: true,
        adminEmailOnNewUser: false,
        adminEmailOnEcoHabit: true
      };
    } catch (error) {
      console.error('Erreur getNotificationSettings:', error);
      return null;
    }
  }

  /**
   * Récupérer les emails des admins
   */
  async getAdminEmails() {
    try {
      const admins = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'ADMIN' },
            { role: 'SUPER_ADMIN' }
          ],
          email: { not: null },
          isActive: true
        },
        select: { email: true }
      });

      return admins.map(admin => admin.email).filter(Boolean);
    } catch (error) {
      console.error('Erreur getAdminEmails:', error);
      return [];
    }
  }

  /**
   * Notifier une nouvelle commande
   */
  async notifyNewOrder(order) {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings) return;

      // Notification email aux admins
      if (settings.emailEnabled && settings.adminEmailOnNewOrder) {
        const adminEmails = await this.getAdminEmails();
        
        for (const adminEmail of adminEmails) {
          await emailService.sendNewOrderNotification(order, adminEmail);
        }
      }

      // Notification push via WebSocket
      if (settings.pushEnabled && socketService.io) {
        socketService.io.to('admins').emit('new-order', {
          orderId: order.id,
          amount: order.totalAmount,
          service: order.serviceType,
          user: {
            name: `${order.user?.firstName} ${order.user?.lastName}`
          }
        });
      }

      // Créer notification en BDD
      const admins = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'ADMIN' },
            { role: 'SUPER_ADMIN' }
          ]
        },
        select: { id: true }
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'NEW_ORDER',
            title: 'Nouvelle commande',
            message: `Nouvelle commande #${order.id} - ${order.totalAmount?.toLocaleString('fr-FR')} F`,
            isRead: false,
            isImportant: false,
            data: JSON.stringify({ orderId: order.id })
          }
        });
      }

      console.log('✅ Notifications nouvelle commande envoyées');
    } catch (error) {
      console.error('Erreur notifyNewOrder:', error);
    }
  }

  /**
   * Notifier un nouvel utilisateur
   */
  async notifyNewUser(user) {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings) return;

      // Notification email aux admins
      if (settings.emailEnabled && settings.adminEmailOnNewUser) {
        const adminEmails = await this.getAdminEmails();
        
        for (const adminEmail of adminEmails) {
          await emailService.sendNewUserNotification(user, adminEmail);
        }
      }

      // Notification push
      if (settings.pushEnabled && socketService.io) {
        socketService.io.to('admins').emit('new-user', {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        });
      }

      console.log('✅ Notifications nouvel utilisateur envoyées');
    } catch (error) {
      console.error('Erreur notifyNewUser:', error);
    }
  }

  /**
   * Notifier une nouvelle éco-habitude
   */
  async notifyNewEcoHabit(habit) {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings) return;

      // Notification email aux admins
      if (settings.emailEnabled && settings.adminEmailOnEcoHabit) {
        const adminEmails = await this.getAdminEmails();
        
        for (const adminEmail of adminEmails) {
          await emailService.sendEcoHabitNotification(habit, adminEmail);
        }
      }

      // Notification push
      if (settings.pushEnabled && socketService.io) {
        socketService.io.to('admins').emit('new-eco-habit', {
          habitId: habit.id,
          user: `${habit.user?.firstName} ${habit.user?.lastName}`,
          habitType: habit.habitType,
          co2Saved: habit.co2Saved
        });
      }

      // Créer notification en BDD pour les admins
      const admins = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'ADMIN' },
            { role: 'SUPER_ADMIN' }
          ]
        },
        select: { id: true }
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'ECO_HABIT_PENDING',
            title: 'Nouvelle éco-habitude à valider',
            message: `${habit.user?.firstName} a déclaré une éco-habitude (${habit.co2Saved} kg CO₂)`,
            isRead: false,
            isImportant: true,
            data: JSON.stringify({ habitId: habit.id })
          }
        });
      }

      console.log('✅ Notifications éco-habitude envoyées');
    } catch (error) {
      console.error('Erreur notifyNewEcoHabit:', error);
    }
  }

  /**
   * Notifier la validation d'une éco-habitude à l'utilisateur
   */
  async notifyEcoHabitValidated(habit) {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings) return;

      // Notification push à l'utilisateur
      if (settings.pushEnabled && socketService.io) {
        socketService.io.to(`user-${habit.userId}`).emit('eco-habit-validated', {
          habitId: habit.id,
          carbonCredits: habit.carbonCreditsEarned
        });
      }

      // Créer notification en BDD
      await prisma.notification.create({
        data: {
          userId: habit.userId,
          type: 'ECO_HABIT_VALIDATED',
          title: 'Éco-habitude validée',
          message: `Votre éco-habitude a été validée ! +${habit.carbonCreditsEarned} crédits carbone`,
          isRead: false,
          isImportant: false,
          data: JSON.stringify({ habitId: habit.id })
        }
      });

      console.log('✅ Notification validation éco-habitude envoyée');
    } catch (error) {
      console.error('Erreur notifyEcoHabitValidated:', error);
    }
  }

  /**
   * Notifier le rejet d'une éco-habitude à l'utilisateur
   */
  async notifyEcoHabitRejected(habit) {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings) return;

      // Notification push
      if (settings.pushEnabled && socketService.io) {
        socketService.io.to(`user-${habit.userId}`).emit('eco-habit-rejected', {
          habitId: habit.id
        });
      }

      // Créer notification en BDD
      await prisma.notification.create({
        data: {
          userId: habit.userId,
          type: 'ECO_HABIT_REJECTED',
          title: 'Éco-habitude rejetée',
          message: `Votre éco-habitude a été rejetée. Raison: ${habit.rejectionReason || 'Non spécifiée'}`,
          isRead: false,
          isImportant: false,
          data: JSON.stringify({ habitId: habit.id })
        }
      });

      console.log('✅ Notification rejet éco-habitude envoyée');
    } catch (error) {
      console.error('Erreur notifyEcoHabitRejected:', error);
    }
  }

  /**
   * Envoyer une notification push personnalisée
   */
  async sendPushNotification(userId, notification) {
    try {
      const settings = await this.getNotificationSettings();
      
      if (settings && settings.pushEnabled && socketService.io) {
        socketService.io.to(`user-${userId}`).emit('notification', notification);
      }
    } catch (error) {
      console.error('Erreur sendPushNotification:', error);
    }
  }
}

module.exports = new NotificationService();
