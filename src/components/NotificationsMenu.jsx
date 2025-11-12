import React, { useState, useEffect, useRef } from 'react'

export default function NotificationsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'Commande livrée',
      message: 'Votre commande #1234 a été livrée avec succès',
      time: 'Il y a 5 min',
      read: false
    },
    {
      id: 2,
      type: 'promo',
      title: 'Nouvelle promotion',
      message: '20% de réduction sur votre prochaine course',
      time: 'Il y a 1h',
      read: false
    },
    {
      id: 3,
      type: 'wallet',
      title: 'Rechargement réussi',
      message: 'Votre portefeuille a été crédité de 5000 F',
      time: 'Il y a 3h',
      read: true
    },
    {
      id: 4,
      type: 'system',
      title: 'Mise à jour disponible',
      message: 'Une nouvelle version de l\'application est disponible',
      time: 'Hier',
      read: true
    }
  ])

  const menuRef = useRef(null)

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        )
      case 'promo':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        )
      case 'wallet':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        )
      case 'system':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: '#E8F5E9',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#f44336',
            color: 'white',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: 0,
          width: '320px',
          maxWidth: '90vw',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 2000,
          maxHeight: '500px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #F0F0F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4CAF50',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Tout lire
              </button>
            )}
          </div>

          {/* Liste des notifications */}
          <div style={{ 
            overflowY: 'auto',
            maxHeight: '400px'
          }}>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid #F5F5F5',
                    cursor: 'pointer',
                    background: notif.read ? 'white' : '#F1F8E9',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'white' : '#F1F8E9'}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: '#F5F5F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getIcon(notif.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '4px'
                      }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#4CAF50',
                            flexShrink: 0,
                            marginLeft: '8px'
                          }} />
                        )}
                      </div>
                      <p style={{
                        margin: '0 0 4px',
                        fontSize: '13px',
                        color: '#757575',
                        lineHeight: '1.4'
                      }}>
                        {notif.message}
                      </p>
                      <span style={{
                        fontSize: '12px',
                        color: '#BDBDBD'
                      }}>
                        {notif.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p style={{ color: '#757575', margin: 0 }}>Aucune notification</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
