import React, { useEffect } from 'react';
import logo from '../assets/images/ecom-logo.png';

const AdminSplashScreen = ({ onComplete }) => {
  useEffect(() => {
    // Durée du splash screen (3 secondes)
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
      zIndex: 9999
    }}>
      {/* Logo animé */}
      <div style={{
        animation: 'pulse 1.5s ease-in-out infinite',
        marginBottom: '20px'
      }}>
        <img 
          src={logo} 
          alt="ECOM Admin Logo" 
          style={{
            width: '150px',
            height: '150px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
          }}
        />
      </div>

      {/* Badge Admin */}
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        padding: '8px 20px',
        borderRadius: '20px',
        marginBottom: '10px',
        backdropFilter: 'blur(10px)'
      }}>
        <span style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          letterSpacing: '2px'
        }}>
          ADMIN
        </span>
      </div>

      {/* Nom de l'application */}
      <h1 style={{
        color: 'white',
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '10px',
        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        ECOM Platform
      </h1>

      {/* Sous-titre */}
      <p style={{
        color: 'rgba(255,255,255,0.9)',
        fontSize: '16px',
        marginBottom: '40px'
      }}>
        Espace d'administration
      </p>

      {/* Loader animé */}
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(255,255,255,0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>

      {/* CSS pour les animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default AdminSplashScreen;
