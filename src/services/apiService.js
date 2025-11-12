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
  async login(phone, password) {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ phone, password })
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
      return { success: false, error: error.message }
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
}

export default new ApiService()
