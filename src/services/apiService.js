import API_CONFIG, { getApiUrl, getAuthHeaders } from '../config/api'

// Service pour tester la connexion backend
class ApiService {
  
  // Test de santé du backend
  async healthCheck() {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
        method: 'GET',
        headers: API_CONFIG.HEADERS
      })
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Health check error:', error)
      return { success: false, error: error.message }
    }
  }

  // Connexion utilisateur
  async login(phone, password, additionalData = {}) {
    let response
    try {
      response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ phone, password, ...additionalData })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion')
      }
      
      // Sauvegarder le token
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Login error:', error)
      
      // Messages d'erreur en français plus explicites
      let errorMessage = 'Impossible de se connecter au serveur'
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Erreur réseau. Veuillez réessayer.'
      } else if (error.message.includes('502') || response?.status === 502) {
        errorMessage = 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Inscription utilisateur
  async register(userData) {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REGISTER), {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(userData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur d\'inscription')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer le solde du portefeuille
  async getWalletBalance() {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.WALLET_BALANCE), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération du solde')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get wallet balance error:', error)
      return { success: false, error: error.message }
    }
  }

  // Ajouter des fonds au portefeuille
  async addFunds(amount, method, description) {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADD_FUNDS), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, method, description })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur d\'ajout de fonds')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Add funds error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer les transactions
  async getTransactions(limit = 10, offset = 0) {
    try {
      const response = await fetch(
        `${getApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS)}?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération des transactions')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get transactions error:', error)
      return { success: false, error: error.message }
    }
  }

  // Demander une course
  async requestRide(rideData) {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REQUEST_RIDE), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(rideData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de demande de course')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Request ride error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer le profil utilisateur
  async getProfile() {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PROFILE), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération du profil')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get profile error:', error)
      return { success: false, error: error.message }
    }
  }

  // Mettre à jour le profil
  async updateProfile(profileData) {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_PROFILE), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de mise à jour du profil')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer les courses de transport
  async getTransportOrders() {
    try {
      const response = await fetch(getApiUrl('/api/orders/transport'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération des courses')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get transport orders error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer les commandes de livraison
  async getDeliveryOrders() {
    try {
      const response = await fetch(getApiUrl('/api/orders/delivery'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération des commandes')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get delivery orders error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer les codes promo
  async getPromoCodes() {
    try {
      const response = await fetch(getApiUrl('/api/promo-codes'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération des codes promo')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get promo codes error:', error)
      return { success: false, error: error.message }
    }
  }

  // Appliquer un code promo
  async applyPromoCode(code) {
    try {
      const response = await fetch(getApiUrl('/api/promo-codes/apply'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Code promo invalide')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Apply promo code error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer les boutiques du marketplace
  async getShops(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (filters.category && filters.category !== 'all') {
        queryParams.append('category', filters.category)
      }
      if (filters.search) {
        queryParams.append('search', filters.search)
      }

      const url = queryParams.toString() 
        ? `${getApiUrl('/api/shops')}?${queryParams}` 
        : getApiUrl('/api/shops')

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération des boutiques')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get shops error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer les éco-habitudes
  async getEcoHabits() {
    try {
      const response = await fetch(getApiUrl('/api/eco-habits'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération des éco-habitudes')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get eco habits error:', error)
      return { success: false, error: error.message }
    }
  }

  // Déclarer une éco-habitude
  async submitEcoHabit(habitData) {
    try {
      const response = await fetch(getApiUrl('/api/eco-habits'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(habitData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de déclaration de l\'éco-habitude')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Submit eco habit error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer le profil carbone
  async getCarbonProfile() {
    try {
      const response = await fetch(getApiUrl('/api/eco-habits/profile'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération du profil carbone')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get carbon profile error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer les notifications
  async getNotifications() {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération des notifications')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get notifications error:', error)
      return { success: false, error: error.message }
    }
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`), {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de mise à jour de la notification')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Mark notification as read error:', error)
      return { success: false, error: error.message }
    }
  }

  // Récupérer les lieux favoris
  async getFavoritePlaces() {
    try {
      const response = await fetch(getApiUrl('/api/user/favorites'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de récupération des lieux favoris')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Get favorite places error:', error)
      return { success: false, error: error.message }
    }
  }

  // Ajouter un lieu favori
  async addFavoritePlace(placeData) {
    try {
      const response = await fetch(getApiUrl('/api/user/favorites'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(placeData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur d\'ajout du lieu favori')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Add favorite place error:', error)
      return { success: false, error: error.message }
    }
  }

  // Supprimer un lieu favori
  async deleteFavoritePlace(placeId) {
    try {
      const response = await fetch(getApiUrl(`/api/user/favorites/${placeId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur de suppression du lieu favori')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Delete favorite place error:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new ApiService()
