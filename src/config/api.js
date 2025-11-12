// Configuration de l'API backend
const API_CONFIG = {
  // En production, utiliser les routes relatives (Netlify Functions)
  // En dev, utiliser localhost:5000
  BASE_URL: import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000',
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_OTP: '/api/auth/verify-otp',
    
    // User
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    
    // Wallet
    WALLET_BALANCE: '/api/wallet/balance',
    ADD_FUNDS: '/api/wallet/add-funds',
    TRANSACTIONS: '/api/wallet/transactions',
    
    // Transport
    REQUEST_RIDE: '/api/transport/request',
    RIDE_STATUS: '/api/transport/status',
    RIDE_HISTORY: '/api/transport/history',
    
    // Marketplace
    PRODUCTS: '/api/marketplace/products',
    CATEGORIES: '/api/marketplace/categories',
    ORDER: '/api/marketplace/order',
    
    // Notifications
    NOTIFICATIONS: '/api/notifications',
    
    // Health check
    HEALTH: '/health'
  },
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
}

// Fonction helper pour construire l'URL complète
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Fonction pour ajouter le token d'authentification
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    ...API_CONFIG.HEADERS,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export default API_CONFIG
