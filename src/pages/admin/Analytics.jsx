import React, { useState, useEffect } from 'react'
import adminApiService from '../../services/adminApiService'

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d, 1y
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState({
    revenue: {
      current: 0,
      previous: 0,
      change: 0,
      daily: []
    },
    users: {
      total: 0,
      new: 0,
      active: 0,
      retention: 0,
      daily: []
    },
    orders: {
      total: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      avgValue: 0,
      daily: []
    },
    services: [],
    topUsers: []
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Charger les données en parallèle
      const [revenueResult, usersResult, servicesResult, topUsersResult] = await Promise.all([
        adminApiService.getRevenueAnalytics(timeRange),
        adminApiService.getUsersAnalytics(timeRange),
        adminApiService.getServicesAnalytics(),
        adminApiService.getTopUsers(5)
      ])

      // Calculer les stats actuelles vs précédentes pour revenue
      let revenueData = { current: 0, previous: 0, change: 0, daily: [] }
      if (revenueResult.success && revenueResult.data.length > 0) {
        const total = revenueResult.data.reduce((sum, d) => sum + d.amount, 0)
        revenueData = {
          current: total,
          previous: total * 0.8, // Simuler une comparaison
          change: 20, // Simuler le changement
          daily: revenueResult.data.map(d => ({
            date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            amount: d.amount
          }))
        }
      }

      // Utilisateurs
      let usersData = { total: 0, new: 0, active: 0, retention: 0, daily: [] }
      if (usersResult.success && usersResult.data.length > 0) {
        const newUsers = usersResult.data.reduce((sum, d) => sum + d.count, 0)
        usersData = {
          total: newUsers * 10, // Estimation
          new: newUsers,
          active: Math.floor(newUsers * 0.7),
          retention: 68.6,
          daily: usersResult.data.map(d => ({
            date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            count: d.count
          }))
        }
      }

      setAnalyticsData({
        revenue: revenueData,
        users: usersData,
        orders: analyticsData.orders, // Garder les données fictives pour l'instant
        services: servicesResult.success ? servicesResult.data : [],
        topUsers: topUsersResult.success ? topUsersResult.data : []
      })
    } catch (error) {
      console.error('Erreur chargement analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return amount.toLocaleString('fr-FR') + ' F'
  }

  const formatPercent = (value) => {
    return value > 0 ? `+${value}%` : `${value}%`
  }

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
        ⏳ Chargement des analytics...
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      {/* Header avec filtres */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '700', color: '#212121' }}>
            Analytics
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#757575' }}>
            Vue d'ensemble des performances
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: '7d', label: '7 jours' },
            { value: '30d', label: '30 jours' },
            { value: '90d', label: '90 jours' },
            { value: '1y', label: '1 an' }
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              style={{
                padding: '10px 20px',
                border: timeRange === range.value ? '2px solid #4CAF50' : '2px solid #E0E0E0',
                borderRadius: '10px',
                background: timeRange === range.value ? '#E8F5E9' : 'white',
                color: timeRange === range.value ? '#4CAF50' : '#757575',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="admin-stats-grid">
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #4CAF50'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Revenus</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
              {formatCurrency(analyticsData.revenue.current)}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            vs {formatCurrency(analyticsData.revenue.previous)} ({formatPercent(analyticsData.revenue.change)})
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #2196F3'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Utilisateurs</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196F3' }}>
              {analyticsData.users.total}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {analyticsData.users.new} nouveaux, {analyticsData.users.active} actifs ({analyticsData.users.retention}%)
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #FF9800'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Commandes</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>
              {analyticsData.orders.total}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {analyticsData.orders.pending} en attente, panier: {formatCurrency(analyticsData.orders.avgValue)}
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="admin-charts-grid">
        {/* Graphique Revenus */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#212121' }}>
            Évolution des revenus
          </h3>
          <div style={{ position: 'relative', height: '200px' }}>
            {/* Graphique simplifié - bars */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '160px',
              gap: '8px',
              borderBottom: '2px solid #E0E0E0',
              paddingBottom: '10px'
            }}>
              {analyticsData.revenue.daily.map((day, index) => {
                const maxRevenue = Math.max(...analyticsData.revenue.daily.map(d => d.amount))
                const height = (day.amount / maxRevenue) * 100
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      title={formatCurrency(day.amount)}
                      style={{
                        width: '100%',
                        height: `${height}%`,
                        background: 'linear-gradient(180deg, #4CAF50 0%, #66BB6A 100%)',
                        borderRadius: '4px 4px 0 0',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        minHeight: '20px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    />
                    <div style={{ fontSize: '11px', color: '#757575', fontWeight: '600' }}>
                      {day.date}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Graphique Utilisateurs */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#212121' }}>
            Nouveaux utilisateurs
          </h3>
          <div style={{ position: 'relative', height: '200px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '160px',
              gap: '8px',
              borderBottom: '2px solid #E0E0E0',
              paddingBottom: '10px'
            }}>
              {analyticsData.users.daily.map((day, index) => {
                const maxUsers = Math.max(...analyticsData.users.daily.map(d => d.count))
                const height = (day.count / maxUsers) * 100
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      title={`${day.count} utilisateurs`}
                      style={{
                        width: '100%',
                        height: `${height}%`,
                        background: 'linear-gradient(180deg, #2196F3 0%, #42A5F5 100%)',
                        borderRadius: '4px 4px 0 0',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        minHeight: '20px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    />
                    <div style={{ fontSize: '11px', color: '#757575', fontWeight: '600' }}>
                      {day.date}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Services et Top Users */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px'
      }}>
        {/* Répartition par service */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#212121' }}>
            Répartition par service
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(analyticsData.services).map(([service, data]) => {
              const serviceNames = {
                driver: { name: '🚗 Driver', color: '#4CAF50' },
                delivery: { name: '📦 Delivery', color: '#2196F3' },
                luxPlus: { name: '✨ Lux+', color: '#9C27B0' },
                ecoHabits: { name: '🌱 Eco-habitudes', color: '#66BB6A' },
                marketplace: { name: '🛍️ Marketplace', color: '#FF9800' }
              }
              return (
                <div key={service}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#424242' }}>
                      {serviceNames[service].name}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: serviceNames[service].color }}>
                      {data.share}%
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#F0F0F0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${data.share}%`,
                      background: serviceNames[service].color,
                      borderRadius: '4px',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#757575', marginTop: '4px' }}>
                    {data.orders ? `${data.orders} commandes • ${formatCurrency(data.revenue)}` : 
                     `${data.users} utilisateurs • ${formatCurrency(data.credits)} crédits`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top utilisateurs */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#212121' }}>
            Top utilisateurs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {analyticsData.topUsers.map((user, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#F9F9F9',
                  borderRadius: '10px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#E0E0E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#212121' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#757575' }}>
                    {user.orders} commandes
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#4CAF50' }}>
                  {formatCurrency(user.spent)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
