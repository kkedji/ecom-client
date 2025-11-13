import React from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    { path: '/admin/dashboard', label: 'Tableau de bord' },
    { path: '/admin/analytics', label: 'Analytics' },
    { path: '/admin/users', label: 'Utilisateurs' },
    { path: '/admin/promo-codes', label: 'Codes Promo' },
    { path: '/admin/eco-habits', label: 'Éco-habitudes' },
    { path: '/admin/notifications', label: 'Notifications' },
    { path: '/admin/export', label: 'Export CSV' },
    { path: '/admin/settings', label: 'Paramètres' }
  ]

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      logout()
      navigate('/admin/login')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="admin-container" style={{ 
      display: 'flex',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      background: 'white',
      width: '100%'
    }}>
      {/* Sidebar fixe */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '240px',
        height: '100vh',
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        color: 'white',
        overflowY: 'auto',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              E
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>ECOM Admin</h2>
              <p style={{ margin: 0, fontSize: '11px', opacity: 0.7 }}>Dashboard</p>
            </div>
          </div>
          <div style={{
            padding: '6px 10px',
            background: 'rgba(76, 175, 80, 0.15)',
            borderRadius: '6px',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            marginBottom: '8px'
          }}>
            <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>Rôle</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#4CAF50' }}>
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrateur'}
            </div>
          </div>
          <div style={{
            padding: '6px 10px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px',
            fontSize: '11px',
            textAlign: 'center',
            opacity: 0.8
          }}>
            {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {menuItems.map(item => {
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '4px',
                  background: active ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                  border: 'none',
                  borderLeft: active ? '4px solid #4CAF50' : '4px solid transparent',
                  borderRadius: '8px',
                  color: active ? '#4CAF50' : '#94A3B8',
                  fontSize: '14px',
                  fontWeight: active ? '600' : '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = '#E2E8F0'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94A3B8'
                  }
                }}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User info */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '10px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.phoneNumber}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #B91C1C)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)'}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content avec marge gauche fixe */}
      <main style={{
        marginLeft: '240px',
        width: 'calc(100% - 240px)',
        minHeight: '100vh',
        maxWidth: 'none',
        background: 'white',
        padding: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Page content */}
        <div style={{ flex: 1, padding: '20px', maxWidth: 'none', width: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
