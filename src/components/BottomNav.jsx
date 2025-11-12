import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Masquer sur les pages auth
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 12px 0',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          color: location.pathname === '/' ? '#4CAF50' : '#757575',
          padding: '8px'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span style={{fontSize: '11px', fontWeight: '500'}}>Accueil</span>
      </button>

      <button
        onClick={() => navigate('/transport')}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          color: location.pathname === '/transport' ? '#4CAF50' : '#757575',
          padding: '8px'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="9" width="16" height="10" rx="2"/>
          <path d="M6 9V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
          <circle cx="8" cy="19" r="2"/>
          <circle cx="16" cy="19" r="2"/>
        </svg>
        <span style={{fontSize: '11px', fontWeight: '500'}}>Transport</span>
      </button>

      <button
        onClick={() => navigate('/marketplace')}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          color: location.pathname === '/marketplace' ? '#4CAF50' : '#757575',
          padding: '8px'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <span style={{fontSize: '11px', fontWeight: '500'}}>Shop</span>
      </button>

      <button
        onClick={() => navigate('/settings')}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          color: location.pathname === '/settings' ? '#4CAF50' : '#757575',
          padding: '8px'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-4.24 4.24l-4.24 4.24M23 12h-6m-6 0H1m18.36 8.66l-4.24-4.24m-4.24-4.24L6.64 3.52"/>
        </svg>
        <span style={{fontSize: '11px', fontWeight: '500'}}>Profil</span>
      </button>
    </div>
  )
}
