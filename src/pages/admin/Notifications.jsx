import React, { useState, useEffect } from 'react'
import adminApiService from '../../services/adminApiService'

export default function Notifications() {
  const [filter, setFilter] = useState('all') // all, unread, important
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const result = await adminApiService.getNotifications()
      if (result.success) {
        setNotifications(result.data.map(notif => ({
          id: notif.id,
          type: notif.action,
          title: getNotificationTitle(notif.action),
          message: notif.description,
          isRead: false,
          isImportant: notif.action.includes('eco_habit') || notif.action.includes('order'),
          timestamp: new Date(notif.createdAt),
          icon: getNotificationIcon(notif.action),
          color: getNotificationColor(notif.action)
        })))
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationTitle = (action) => {
    const titles = {
      user_created: 'Nouvel utilisateur',
      user_promoted: 'Promotion utilisateur',
      order_created: 'Nouvelle commande',
      order_completed: 'Commande terminée',
      eco_habit_submitted: 'Éco-habitude soumise',
      eco_habit_validated: 'Éco-habitude validée',
      promo_created: 'Code promo créé',
      promo_used: 'Code promo utilisé'
    }
    return titles[action] || 'Notification'
  }

  const getNotificationIcon = (action) => {
    const icons = {
      user_created: '👤',
      user_promoted: '⭐',
      order_created: '🚗',
      order_completed: '✅',
      eco_habit_submitted: '🌱',
      eco_habit_validated: '🌍',
      promo_created: '🎫',
      promo_used: '💳'
    }
    return icons[action] || '📢'
  }

  const getNotificationColor = (action) => {
    if (action.includes('user')) return '#2196F3'
    if (action.includes('order')) return '#4CAF50'
    if (action.includes('eco')) return '#66BB6A'
    if (action.includes('promo')) return '#FF9800'
    return '#9E9E9E'
  }

  const formatTimestamp = (date) => {
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const handleMarkAsRead = (notifId) => {
    setNotifications(notifications.map(n =>
      n.id === notifId ? { ...n, isRead: true } : n
    ))

    // TODO: API call
    // await apiService.put(`/api/admin/notifications/${notifId}/read`)
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    alert('✅ Toutes les notifications marquées comme lues')

    // TODO: API call
    // await apiService.put('/api/admin/notifications/read-all')
  }

  const handleDeleteNotif = (notifId) => {
    setNotifications(notifications.filter(n => n.id !== notifId))

    // TODO: API call
    // await apiService.delete(`/api/admin/notifications/${notifId}`)
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'important') return n.isImportant
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: '16px', color: '#757575' }}>
          Chargement des notifications...
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      {/* Header */}
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
            Notifications
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#757575' }}>
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications sont lues'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              padding: '12px 24px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
            }}
          >
            ✓ Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Stats rapides */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '16px',
        marginBottom: '20px',
        alignItems: 'start'
      }}>
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #FF9800'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Non lues</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>
              {unreadCount}
            </span>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #F44336'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Importantes</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#F44336' }}>
              {notifications.filter(n => n.isImportant).length}
            </span>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #2196F3'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Total</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196F3' }}>
              {notifications.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {[
          { value: 'all', label: 'Toutes', count: notifications.length },
          { value: 'unread', label: 'Non lues', count: unreadCount },
          { value: 'important', label: 'Importantes', count: notifications.filter(n => n.isImportant).length }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              border: filter === tab.value ? '2px solid #4CAF50' : '2px solid transparent',
              background: filter === tab.value ? '#E8F5E9' : '#F5F5F5',
              color: filter === tab.value ? '#4CAF50' : '#757575',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                background: filter === tab.value ? '#4CAF50' : '#BDBDBD',
                color: 'white'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste des notifications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredNotifications.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <p style={{ fontSize: '16px', color: '#757575' }}>
              Aucune notification
            </p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              style={{
                background: notif.isRead ? 'white' : '#F0F7FF',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderLeft: notif.isImportant ? `4px solid #F44336` : `4px solid ${notif.color}`,
                display: 'flex',
                gap: '16px',
                alignItems: 'start',
                cursor: notif.isRead ? 'default' : 'pointer',
                transition: 'transform 0.2s',
                position: 'relative'
              }}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              onMouseEnter={(e) => !notif.isRead && (e.currentTarget.style.transform = 'translateX(4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
            >
              {/* Icône */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${notif.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0
              }}>
                {notif.icon}
              </div>

              {/* Contenu */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#212121' }}>
                      {notif.title}
                    </h4>
                    {notif.isImportant && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: '#FFEBEE',
                        color: '#C62828'
                      }}>
                        IMPORTANT
                      </span>
                    )}
                    {!notif.isRead && (
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#2196F3'
                      }} />
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNotif(notif.id)
                    }}
                    style={{
                      padding: '4px 8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#9E9E9E',
                      cursor: 'pointer',
                      fontSize: '18px',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FFEBEE'
                      e.currentTarget.style.color = '#F44336'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#9E9E9E'
                    }}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>

                <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#616161', lineHeight: '1.5' }}>
                  {notif.message}
                </p>

                <div style={{ fontSize: '13px', color: '#9E9E9E' }}>
                  {formatTimestamp(notif.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
