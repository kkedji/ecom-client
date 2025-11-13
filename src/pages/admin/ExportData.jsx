import React, { useState } from 'react'
import adminApiService from '../../services/adminApiService'

export default function ExportData() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const exportQueries = [
    {
      id: 'users',
      name: 'Tous les utilisateurs',
      description: 'Exporter la liste complète des utilisateurs avec leurs informations'
    },
    {
      id: 'orders',
      name: 'Toutes les commandes',
      description: 'Exporter l\'historique des commandes (transport + livraison)',
      requiresDate: true
    },
    {
      id: 'transport',
      name: 'Courses de transport',
      description: 'Exporter uniquement les courses de transport',
      requiresDate: true
    },
    {
      id: 'delivery',
      name: 'Commandes de livraison',
      description: 'Exporter uniquement les commandes de livraison',
      requiresDate: true
    },
    {
      id: 'promo_codes',
      name: 'Codes promo',
      description: 'Exporter tous les codes promo actifs et inactifs'
    },
    {
      id: 'eco_habits',
      name: 'Éco-habitudes',
      description: 'Exporter les éco-habitudes déclarées par les utilisateurs',
      requiresDate: true
    },
    {
      id: 'transactions',
      name: 'Transactions',
      description: 'Exporter l\'historique des transactions financières',
      requiresDate: true
    },
    {
      id: 'revenue_report',
      name: 'Rapport de revenus',
      description: 'Rapport détaillé des revenus par service',
      requiresDate: true
    }
  ]

  const handleExport = async (queryId, requiresDate) => {
    if (requiresDate && (!dateRange.startDate || !dateRange.endDate)) {
      setMessage('❌ Veuillez sélectionner une plage de dates')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setLoading(true)
    setMessage('⏳ Génération du fichier CSV en cours...')

    try {
      const params = requiresDate ? {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      } : {}

      const result = await adminApiService.exportData(queryId, params)
      
      if (result.success) {
        // Créer un lien de téléchargement
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${queryId}_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        setMessage('✅ Fichier CSV téléchargé avec succès !')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ Erreur : ${result.error}`)
        setTimeout(() => setMessage(''), 4000)
      }
    } catch (error) {
      console.error('Erreur export:', error)
      setMessage('❌ Erreur lors de l\'export')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      {/* Sélecteur de dates */}
      <div className="admin-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#1E293B',
          margin: '0 0 16px'
        }}>
          Plage de dates (optionnel pour certains exports)
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '20px'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#475569',
              marginBottom: '8px'
            }}>
              Date de début
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: '2px solid #E2E8F0',
                borderRadius: '10px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#475569',
              marginBottom: '8px'
            }}>
              Date de fin
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: '2px solid #E2E8F0',
                borderRadius: '10px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </div>

      {/* Message de statut */}
      {message && (
        <div style={{
          background: message.includes('✅') ? '#ECFDF5' : message.includes('❌') ? '#FEF2F2' : '#FEF3C7',
          color: message.includes('✅') ? '#059669' : message.includes('❌') ? '#DC2626' : '#D97706',
          padding: '16px 20px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '600',
          marginBottom: '24px',
          border: `2px solid ${message.includes('✅') ? '#D1FAE5' : message.includes('❌') ? '#FEE2E2' : '#FDE68A'}`
        }}>
          {message}
        </div>
      )}

      {/* Grille des exports */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '16px',
        alignItems: 'start'
      }}>
        {exportQueries.map((query) => (
          <div
            key={query.id}
            className="admin-card"
            style={{
              border: '1px solid #E2E8F0',
              height: 'auto'
            }}
          >
            <div>
              <h4 style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#1E293B',
                margin: '0 0 6px'
              }}>
                {query.name}
              </h4>
              <p style={{
                fontSize: '12px',
                color: '#64748B',
                margin: '0 0 16px',
                lineHeight: '1.4',
                minHeight: '34px'
              }}>
                {query.description}
              </p>
            </div>
            <button
              disabled={loading}
              onClick={() => handleExport(query.id, query.requiresDate)}
              style={{
                width: '100%',
                padding: '9px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#45A049')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#4CAF50')}
            >
              {loading ? 'Export en cours...' : 'Télécharger CSV'}
            </button>
          </div>
        ))}
      </div>

      {/* Informations complémentaires */}
      <div className="admin-card" style={{ 
        marginTop: '40px',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0'
      }}>
        <h4 style={{ 
          fontSize: '15px', 
          fontWeight: '600', 
          color: '#1E293B',
          margin: '0 0 12px'
        }}>
          À propos des exports CSV
        </h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px',
          color: '#64748B',
          fontSize: '14px',
          lineHeight: '1.8'
        }}>
          <li>Les fichiers CSV sont encodés en UTF-8 pour compatibilité Excel</li>
          <li>Les exports avec dates incluent uniquement les données de la période sélectionnée</li>
          <li>Les données sensibles (mots de passe) ne sont jamais exportées</li>
          <li>Taille maximale recommandée : 50 000 lignes par export</li>
          <li>Pour des exports personnalisés, contactez l'équipe technique</li>
        </ul>
      </div>
    </div>
  )
}
