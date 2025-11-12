const jwt = require('jsonwebtoken');

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Map userId -> socketId
    this.socketUsers = new Map(); // Map socketId -> userId
  }

  init(io) {
    this.io = io;
    
    // Middleware d'authentification pour Socket.IO
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
          return next(new Error('Token manquant'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ici, vous pourriez vérifier l'utilisateur en base de données
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Token invalide'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`🔌 Utilisateur connecté: ${socket.userId} (Socket: ${socket.id})`);
      
      // Enregistrer la connexion
      this.userSockets.set(socket.userId, socket.id);
      this.socketUsers.set(socket.id, socket.userId);

      // Rejoindre une room personnelle
      socket.join(`user:${socket.userId}`);

      // Événements spécifiques

      // Chauffeur : Mise à jour de position
      socket.on('driver:location-update', (data) => {
        this.handleDriverLocationUpdate(socket, data);
      });

      // Chauffeur : Statut en ligne/hors ligne
      socket.on('driver:status-change', (data) => {
        this.handleDriverStatusChange(socket, data);
      });

      // Course : Mise à jour de statut
      socket.on('ride:status-update', (data) => {
        this.handleRideStatusUpdate(socket, data);
      });

      // Chat : Message
      socket.on('chat:message', (data) => {
        this.handleChatMessage(socket, data);
      });

      // Marketplace : Nouveau produit/commande
      socket.on('store:new-order', (data) => {
        this.handleNewOrder(socket, data);
      });

      // Déconnexion
      socket.on('disconnect', () => {
        console.log(`🔌 Utilisateur déconnecté: ${socket.userId} (Socket: ${socket.id})`);
        this.userSockets.delete(socket.userId);
        this.socketUsers.delete(socket.id);
      });

      // Erreur
      socket.on('error', (error) => {
        console.error(`❌ Erreur Socket pour ${socket.userId}:`, error);
      });
    });

    console.log('🚀 Service Socket.IO initialisé');
  }

  /**
   * Envoyer un message à un utilisateur spécifique
   */
  emitToUser(userId, event, data) {
    if (!this.io) {
      console.warn('Socket.IO non initialisé');
      return false;
    }

    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Envoyer un message à plusieurs utilisateurs
   */
  emitToUsers(userIds, event, data) {
    if (!this.io) {
      console.warn('Socket.IO non initialisé');
      return false;
    }

    userIds.forEach(userId => {
      this.emitToUser(userId, event, data);
    });

    return true;
  }

  /**
   * Envoyer un message à tous les utilisateurs connectés
   */
  broadcast(event, data) {
    if (!this.io) {
      console.warn('Socket.IO non initialisé');
      return false;
    }

    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Envoyer un message à une room spécifique
   */
  emitToRoom(room, event, data) {
    if (!this.io) {
      console.warn('Socket.IO non initialisé');
      return false;
    }

    this.io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * Vérifier si un utilisateur est connecté
   */
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  /**
   * Obtenir le nombre d'utilisateurs connectés
   */
  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  /**
   * Obtenir la liste des utilisateurs connectés
   */
  getConnectedUsers() {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Gérer les mises à jour de position des chauffeurs
   */
  handleDriverLocationUpdate(socket, data) {
    const { latitude, longitude, heading, speed } = data;
    
    // Valider les données
    if (!latitude || !longitude) {
      socket.emit('error', { message: 'Coordonnées manquantes' });
      return;
    }

    // Ici, vous pourriez sauvegarder en base de données
    // ou mettre à jour un cache Redis

    // Notifier les passagers en attente dans la zone
    socket.broadcast.emit('driver:location-broadcast', {
      driverId: socket.userId,
      location: { latitude, longitude, heading, speed },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Gérer les changements de statut des chauffeurs
   */
  handleDriverStatusChange(socket, data) {
    const { isOnline, isAvailable } = data;
    
    // Ici, vous pourriez mettre à jour la base de données
    
    socket.broadcast.emit('driver:status-broadcast', {
      driverId: socket.userId,
      isOnline,
      isAvailable,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Gérer les mises à jour de statut des courses
   */
  handleRideStatusUpdate(socket, data) {
    const { rideId, status, targetUserId } = data;
    
    if (targetUserId) {
      this.emitToUser(targetUserId, 'ride:status-updated', {
        rideId,
        status,
        updatedBy: socket.userId
      });
    }
  }

  /**
   * Gérer les messages de chat
   */
  handleChatMessage(socket, data) {
    const { rideId, message, targetUserId } = data;
    
    if (!message || !targetUserId) {
      socket.emit('error', { message: 'Message ou destinataire manquant' });
      return;
    }

    // Envoyer le message au destinataire
    this.emitToUser(targetUserId, 'chat:new-message', {
      rideId,
      message,
      senderId: socket.userId,
      timestamp: new Date().toISOString()
    });

    // Confirmer l'envoi à l'expéditeur
    socket.emit('chat:message-sent', {
      rideId,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Gérer les nouvelles commandes pour les boutiques
   */
  handleNewOrder(socket, data) {
    const { orderId, storeOwnerId } = data;
    
    if (storeOwnerId) {
      this.emitToUser(storeOwnerId, 'store:order-received', {
        orderId,
        customerId: socket.userId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Joindre un utilisateur à une room spécifique
   */
  joinRoom(userId, room) {
    const socketId = this.userSockets.get(userId);
    if (socketId && this.io) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(room);
        return true;
      }
    }
    return false;
  }

  /**
   * Faire quitter un utilisateur d'une room
   */
  leaveRoom(userId, room) {
    const socketId = this.userSockets.get(userId);
    if (socketId && this.io) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(room);
        return true;
      }
    }
    return false;
  }

  /**
   * Déconnecter un utilisateur spécifique
   */
  disconnectUser(userId, reason = 'Déconnexion forcée') {
    const socketId = this.userSockets.get(userId);
    if (socketId && this.io) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('force-disconnect', { reason });
        socket.disconnect(true);
        return true;
      }
    }
    return false;
  }

  /**
   * Envoyer une notification push simulée
   */
  sendNotification(userId, notification) {
    const { title, message, type, data } = notification;
    
    this.emitToUser(userId, 'notification', {
      title,
      message,
      type,
      data,
      id: `notif_${Date.now()}`,
      read: false
    });

    // Ici, vous pourriez également intégrer avec un service
    // de notifications push mobile (Firebase, OneSignal, etc.)
  }

  /**
   * Obtenir des statistiques en temps réel
   */
  getStats() {
    return {
      connectedUsers: this.getConnectedUsersCount(),
      totalRooms: this.io ? this.io.sockets.adapter.rooms.size : 0,
      uptime: process.uptime()
    };
  }
}

// Export singleton
module.exports = new SocketService();