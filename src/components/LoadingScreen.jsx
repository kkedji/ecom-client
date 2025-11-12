import React from 'react'
import logo from '../assets/images/ecom-logo.png'

function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
      zIndex: 9999
    }}>
      <div style={{
        animation: 'spin 2s linear infinite'
      }}>
        <img 
          src={logo} 
          alt="Ecom Logo" 
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'contain'
          }}
        />
      </div>
      <p style={{
        marginTop: '24px',
        fontSize: '16px',
        color: '#666',
        fontWeight: 500
      }}>
        Chargement...
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen
