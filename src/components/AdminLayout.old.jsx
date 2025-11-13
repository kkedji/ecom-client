import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/admin-desktop.css'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  
  // Mode desktop uniquement
  useEffect(() => {
    // Pas de largeur forcée, laisse le contenu prendre la place naturelle
  }, [])

  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Tableau de bord',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      )
    },
    {
      path: '/admin/analytics',
      label: 'Analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      )
    },
    {
      path: '/admin/users',
      label: 'Utilisateurs',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      path: '/admin/promo-codes',
      label: 'Codes Promo',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
      )
    },
    {
      path: '/admin/eco-habits',
      label: 'Éco-habitudes',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M2 12h20"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
      )
    },
    {
      path: '/admin/notifications',
      label: 'Notifications',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      )
    },
    {
      path: '/admin/export',
      label: 'Export CSV',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      )
    },
    {
      path: '/admin/settings',
      label: 'Paramètres',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.4 4.4l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.4-4.4l4.2-4.2"/>
        </svg>
      )
    }
  ]

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      logout()
      navigate('/admin/login')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <div 
      className="admin-container"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#F5F7FA',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
      {/* Sidebar - Desktop Fixed */}
      <aside 
        className="admin-sidebar"
        style={{
          width: '280px',
          minWidth: '280px',
          maxWidth: '280px',
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          color: 'white',
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          transform: 'none'
        }}>
        {/* Header sidebar */}
        <div style={{
          padding: '28px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}>
              E
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px' }}>
                ECOM Admin
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', opacity: 0.7, color: '#94A3B8' }}>
                Dashboard
              </p>
            </div>
          </div>
          <div style={{
            padding: '10px 12px',
            background: 'rgba(76, 175, 80, 0.15)',
            borderRadius: '8px',
            border: '1px solid rgba(76, 175, 80, 0.3)'
          }}>
            <div style={{ fontSize: '11px', opacity: 0.8, color: '#94A3B8', marginBottom: '2px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>
              Rôle
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#4CAF50' }}>
              {user?.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '⚡ Administrateur'}
            </div>
          </div>
        </div>

        {/* Menu items */}
        <nav style={{ 
          flex: 1, 
          padding: '20px 16px',
          overflowY: 'auto'
        }}>
          {menuItems.map((item) => {
            // Cacher les items nécessitant SUPER_ADMIN si l'utilisateur n'a pas ce rôle
            if (item.requiredRole === 'SUPER_ADMIN' && user?.role !== 'SUPER_ADMIN') {
              return null
            }

            const active = isActive(item.path)

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  marginBottom: '6px',
                  background: active 
                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(46, 125, 50, 0.15) 100%)' 
                    : 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  borderLeft: active ? '4px solid #4CAF50' : '4px solid transparent',
                  color: active ? '#4CAF50' : '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  fontSize: '14.5px',
                  fontWeight: active ? '600' : '500',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'left',
                  boxShadow: active ? '0 4px 12px rgba(76, 175, 80, 0.15)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.color = '#E2E8F0'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94A3B8'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
              >
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minWidth: '24px',
                  opacity: active ? 1 : 0.85
                }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                )}
              </button>
            )
          })}
        </nav>

        {/* User info + Logout */}
        <div style={{
          padding: '20px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{
            marginBottom: '16px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '10px'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.25)'
              }}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '2px' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  {user?.phoneNumber}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.25s',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content - Desktop optimized */}
      <div 
        className="admin-main-content"
        style={{
          marginLeft: '280px',
          flex: 1,
          background: '#F5F7FA',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
        {/* Top bar - Desktop Professional */}
        <header style={{
          background: 'white',
          padding: '20px 30px',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#1E293B',
              letterSpacing: '-0.5px',
              marginBottom: '4px'
            }}>
              {menuItems.find(item => item.path === location.pathname)?.label || 'Administration'}
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: '#64748B',
              fontWeight: '500'
            }}>
              Bienvenue, {user?.firstName} 👋
            </p>
          </div>
          
          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              padding: '10px 16px',
              background: '#F1F5F9',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#475569',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {new Date().toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page content - Wide Desktop Layout */}
        <main style={{
          flex: 1,
          padding: '30px',
          width: '100%'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
