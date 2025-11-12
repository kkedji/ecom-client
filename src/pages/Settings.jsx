import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const MenuItem = ({ icon, label, onClick, color = '#333', showArrow = true }) => (
    <div 
      onClick={onClick}
      style={{
        padding: '16px',
        borderBottom: '1px solid #F0F0F0',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#F8F8F8'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ marginRight: '16px', color, display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <span style={{ fontSize: '16px', fontWeight: '500', flex: 1, color }}>{label}</span>
      {showArrow && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BDBDBD" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      )}
    </div>
  )

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: '20px 16px',
        paddingTop: '40px'
      }}>
        <h1 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '600' }}>
          Paramètres
        </h1>
      </div>

      {/* Profile Card */}
      <div style={{
        background: 'white',
        margin: '16px',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          width: '70px', 
          height: '70px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '16px',
          flexShrink: 0
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>
            {user?.name || 'Utilisateur'}
          </h2>
          <p style={{ margin: '4px 0 0', color: '#757575', fontSize: '14px' }}>
            {user?.phoneNumber || '+242 06 123 45 67'}
          </p>
          <p style={{ margin: '2px 0 0', color: '#757575', fontSize: '14px' }}>
            {user?.email || 'user@example.com'}
          </p>
        </div>
        <button style={{
          background: '#E8F5E9',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          color: '#4CAF50',
          cursor: 'pointer',
          fontWeight: '600',
          flexShrink: 0
        }}>
          Modifier
        </button>
      </div>

      {/* Menu Options */}
      <div style={{
        background: 'white',
        margin: '16px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          }
          label="Langues"
          onClick={() => alert('Fonctionnalité Langues à venir')}
        />

        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          }
          label="Mes lieux favoris"
          onClick={() => alert('Fonctionnalité Lieux favoris à venir')}
        />

        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          }
          label="Notifications"
          onClick={() => alert('Fonctionnalité Notifications à venir')}
        />

        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          }
          label="À propos"
          onClick={() => alert('Version 1.0.0\n\nApplication eCommerce\n© 2025 SKK Analytics')}
        />
      </div>

      {/* Logout Section */}
      <div style={{
        background: 'white',
        margin: '16px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          }
          label="Déconnexion"
          onClick={() => {
            if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
              logout()
              navigate('/login')
            }
          }}
          showArrow={false}
        />
      </div>

      {/* Delete Account Section */}
      <div style={{
        background: 'white',
        margin: '16px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          }
          label="Supprimer mon compte"
          onClick={() => {
            if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.')) {
              alert('Fonctionnalité de suppression de compte à venir')
            }
          }}
          color="#f44336"
          showArrow={false}
        />
      </div>
    </div>
  )
}