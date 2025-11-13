import { getApiUrl, getAuthHeaders } from '../config/api'

/**
 * Service API pour les routes admin
 */
class AdminApiService {
  
  // ==================== DASHBOARD ====================
  async getDashboardStats() {
    try {
      const response = await fetch(getApiUrl('/admin/dashboard/stats'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la récupération des stats')
      }
      
      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Dashboard stats error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==================== ANALYTICS ====================
  async getRevenueAnalytics(timeRange = '7d') {
    try {
      const response = await fetch(getApiUrl(`/admin/analytics/revenue?timeRange=${timeRange}`), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des revenus')
      }
      
      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Revenue analytics error:', error)
      return { success: false, error: error.message }
    }
  }

  async getUsersAnalytics(timeRange = '7d') {
    try {
      const response = await fetch(getApiUrl(`/admin/analytics/users?timeRange=${timeRange}`), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs')
      }
      
      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Users analytics error:', error)
      return { success: false, error: error.message }
    }
  }

  async getServicesAnalytics() {
    try {
      const response = await fetch(getApiUrl('/admin/analytics/services'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des services')
      }
      
      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Services analytics error:', error)
      return { success: false, error: error.message }
    }
  }

  async getTopUsers(limit = 5) {
    try {
      const response = await fetch(getApiUrl(`/admin/analytics/top-users?limit=${limit}`), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du top utilisateurs')
      }
      
      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Top users error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==================== USERS MANAGEMENT ====================
  async getUsersList(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.role) params.append('role', filters.role)
      if (filters.status) params.append('status', filters.status)

      const response = await fetch(getApiUrl(`/admin/users/list?${params.toString()}`), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs')
      }
      
      const data = await response.json()
      return { success: true, data: data.data, total: data.total }
    } catch (error) {
      console.error('Users list error:', error)
      return { success: false, error: error.message }
    }
  }

  async promoteUser(userId, role, isAdmin) {
    try {
      const response = await fetch(getApiUrl(`/admin/users/${userId}/promote`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role, isAdmin })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la promotion')
      }
      
      const data = await response.json()
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error('Promote user error:', error)
      return { success: false, error: error.message }
    }
  }

  async toggleUserStatus(userId) {
    try {
      const response = await fetch(getApiUrl(`/admin/users/${userId}/toggle-status`), {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la modification du statut')
      }
      
      const data = await response.json()
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error('Toggle status error:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteUser(userId) {
    try {
      const response = await fetch(getApiUrl(`/admin/users/${userId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la suppression')
      }
      
      const data = await response.json()
      return { success: true, message: data.message }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==================== WALLET MANAGEMENT ====================
  async creditUserBalance(userId, { amount, reason }) {
    try {
      const response = await fetch(getApiUrl(`/admin/users/${userId}/credit-balance`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, reason })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors du crédit')
      }
      
      const data = await response.json()
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error('Credit balance error:', error)
      return { success: false, error: error.message }
    }
  }

  async debitUserBalance(userId, { amount, reason }) {
    try {
      const response = await fetch(getApiUrl(`/admin/users/${userId}/debit-balance`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, reason })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors du débit')
      }
      
      const data = await response.json()
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error('Debit balance error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==================== PROMO CODES ====================
  async getPromoCodes() {
    try {
      const response = await fetch(getApiUrl('/admin/promo-codes/list'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des codes promo')
      }
      
      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Promo codes error:', error)
      return { success: false, error: error.message }
    }
  }

  async createPromoCode(promoData) {
    try {
      const response = await fetch(getApiUrl('/admin/promo-codes/create'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(promoData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la création')
      }
      
      const data = await response.json()
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error('Create promo code error:', error)
      return { success: false, error: error.message }
    }
  }

  async togglePromoCode(promoId) {
    try {
      const response = await fetch(getApiUrl(`/admin/promo-codes/${promoId}/toggle`), {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la modification du code promo')
      }
      
      const data = await response.json()
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error('Toggle promo code error:', error)
      return { success: false, error: error.message }
    }
  }

  async deletePromoCode(promoId) {
    try {
      const response = await fetch(getApiUrl(`/admin/promo-codes/${promoId}`), {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }
      
      const data = await response.json()
      return { success: true, message: data.message }
    } catch (error) {
      console.error('Delete promo code error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==================== ECO-HABITS ====================
  async getPendingEcoHabits() {
    try {
      const response = await fetch(getApiUrl('/admin/eco-habits/pending'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des éco-habitudes')
      }
      
      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Pending eco-habits error:', error)
      return { success: false, error: error.message }
    }
  }

  async getAllEcoHabits(status = 'all') {
    try {
      const response = await fetch(getApiUrl(`/admin/eco-habits/all?status=${status}`), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des éco-habitudes')
      }
      
      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('All eco-habits error:', error)
      return { success: false, error: error.message }
    }
  }

  async validateEcoHabit(habitId, co2Saved, adminComment) {
    try {
      const response = await fetch(getApiUrl(`/admin/eco-habits/${habitId}/validate`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ co2Saved, adminComment })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la validation')
      }
      
      const data = await response.json()
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error('Validate eco-habit error:', error)
      return { success: false, error: error.message }
    }
  }

  async rejectEcoHabit(habitId, adminComment) {
    try {
      const response = await fetch(getApiUrl(`/admin/eco-habits/${habitId}/reject`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ adminComment })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors du rejet')
      }
      
      const data = await response.json()
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error('Reject eco-habit error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==================== NOTIFICATIONS ====================
  async getNotifications(filter = 'all') {
    try {
      const response = await fetch(getApiUrl(`/admin/notifications?filter=${filter}`), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications')
      }
      
      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Notifications error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==================== SETTINGS ====================
  async getSettings() {
    try {
      const response = await fetch(getApiUrl('/admin/settings'), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des paramètres')
      }
      
      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Settings error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateSettings(settings) {
    try {
      const response = await fetch(getApiUrl('/admin/settings'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la mise à jour')
      }
      
      const data = await response.json()
      return { success: true, data: data.data, message: data.message }
    } catch (error) {
      console.error('Update settings error:', error)
      return { success: false, error: error.message }
    }
  }

  // ==================== EXPORTS CSV ====================
  async exportData(queryId, params = {}) {
    try {
      // Construction de l'URL avec les paramètres de date si présents
      let url = `/admin/export/${queryId}`
      const queryParams = new URLSearchParams()
      
      if (params.startDate) queryParams.append('startDate', params.startDate)
      if (params.endDate) queryParams.append('endDate', params.endDate)
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }

      const response = await fetch(getApiUrl(url), {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'export')
      }
      
      // Récupérer le contenu CSV brut
      const csvData = await response.text()
      return { success: true, data: csvData }
    } catch (error) {
      console.error('Export data error:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new AdminApiService()
