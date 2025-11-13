import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import adminApiService from '../../services/adminApiService'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    totalRevenue: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    activePromoCodes: 0,
    promoUsageToday: 0,
    pendingEcoHabits: 0,
    validatedEcoHabits: 0,
    totalCarbonCredits: 0,
    carbonSavedKg: 0
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setLoading(true)
    try {
      const result = await adminApiService.getDashboardStats()
      if (result.success) {
        const data = result.data
        setStats({
          totalUsers: data.users?.total || 0,
          newUsersToday: data.users?.new7d || 0,
          activeUsers: data.users?.active || 0,
          totalRevenue: data.revenue?.total || 0,
          revenueToday: 0, // Calculer depuis revenue si besoin
          revenueThisMonth: data.revenue?.last30Days || 0,
          pendingDeliveries: data.orders?.pending || 0,
          completedDeliveries: data.orders?.completed || 0,
          activePromoCodes: 0, // À ajouter dans l'API si besoin
          promoUsageToday: 0,
          pendingEcoHabits: 0,
          validatedEcoHabits: 0,
          totalCarbonCredits: 0,
          carbonSavedKg: 0
        })
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, subtitle, color, trend }) => (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>
          {title}
        </span>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: color }}>
          {value}
        </span>
      </div>

      <div style={{ fontSize: '11px', color: '#64748B' }}>
        {subtitle}
        {trend && ` (${trend > 0 ? '+' : ''}${trend}%)`}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: '18px',
        color: '#757575'
      }}>
        ⏳ Chargement des statistiques...
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      {/* Message de bienvenue */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: 'white',
        marginBottom: '32px'
      }}>
        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          Bonjour, {user?.firstName} ! 👋
        </h2>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
          Voici un aperçu de l'activité de la plateforme
        </p>
      </div>

      {/* Statistiques principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '16px',
        marginBottom: '28px',
        alignItems: 'start'
      }}>
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers.toLocaleString('fr-FR')}
          subtitle={`+${stats.newUsersToday} aujourd'hui`}
          trend={0}
          color="#2196F3"
        />

        <StatCard
          title="Revenus"
          value={`${stats.totalRevenue.toLocaleString('fr-FR')} F`}
          subtitle={`${stats.revenueToday.toLocaleString('fr-FR')} F aujourd'hui`}
          trend={0}
          color="#4CAF50"
        />

        <StatCard
          title="Livraisons en cours"
          value={stats.pendingDeliveries}
          subtitle={`${stats.completedDeliveries} terminées ce mois`}
          color="#FF9800"
        />

        <StatCard
          title="Codes Promo actifs"
          value={stats.activePromoCodes}
          subtitle={`${stats.promoUsageToday} utilisations aujourd'hui`}
          color="#9C27B0"
        />
      </div>

      {/* Grille 2 colonnes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'start'
      }}>
        {/* Éco-habitudes en attente */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#212121' }}>
              Éco-habitudes à valider
            </h3>
            <span style={{
              padding: '6px 12px',
              background: '#FF9800',
              color: 'white',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {stats.pendingEcoHabits}
            </span>
          </div>

          <div style={{
            padding: '16px',
            background: '#FFF3E0',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '14px', color: '#F57C00', marginBottom: '8px' }}>
              Action requise
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#E65100' }}>
              {stats.pendingEcoHabits} déclarations
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#757575',
            marginBottom: '12px'
          }}>
            <span>Total validées</span>
            <span style={{ fontWeight: '600', color: '#4CAF50' }}>{stats.validatedEcoHabits}</span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#757575',
            marginBottom: '16px'
          }}>
            <span>CO₂ économisé</span>
            <span style={{ fontWeight: '600', color: '#2E7D32' }}>{stats.carbonSavedKg} kg</span>
          </div>

          <button
            onClick={() => window.location.href = '/admin/eco-habits'}
            style={{
              width: '100%',
              padding: '12px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Voir les déclarations
          </button>
        </div>

        {/* Crédits carbone */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#212121' }}>
            Crédits Carbone
          </h3>

          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', color: '#2E7D32', marginBottom: '8px' }}>
              Total distribué
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1B5E20' }}>
              {stats.totalCarbonCredits.toLocaleString('fr-FR')} F
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div style={{
              padding: '16px',
              background: '#F5F5F5',
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>
                CO₂ évité
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#212121' }}>
                {stats.carbonSavedKg} kg
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: '#F5F5F5',
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '12px', color: '#757575', marginBottom: '4px' }}>
                Taux conversion
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#212121' }}>
                62 F/kg
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#212121' }}>
          Actions rapides
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          <button
            onClick={() => window.location.href = '/admin/promo-codes'}
            style={{
              padding: '16px',
              background: '#E3F2FD',
              border: '2px solid #2196F3',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1976D2' }}>
              Créer un code promo
            </span>
          </button>

          <button
            onClick={() => window.location.href = '/admin/eco-habits'}
            style={{
              padding: '16px',
              background: '#E8F5E9',
              border: '2px solid #4CAF50',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#2E7D32' }}>
              Valider habitudes
            </span>
          </button>

          {user?.role === 'SUPER_ADMIN' && (
            <button
              onClick={() => window.location.href = '/admin/users'}
              style={{
                padding: '16px',
                background: '#F3E5F5',
                border: '2px solid #9C27B0',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9C27B0" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#7B1FA2' }}>
                Gérer utilisateurs
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
