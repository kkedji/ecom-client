import React, { useEffect, useState } from 'react';
import logo from '../assets/images/ecom-logo.png';

const AdminSplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Durée du splash screen (3 secondes)
    const duration = 3000;
    const interval = 30;
    const increment = (interval / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(completeTimer);
    };
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
      {/* Logo avec cadre arrondi ombré */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2)',
        animation: 'pulse 1.5s ease-in-out infinite',
        marginBottom: '30px'
      }}>
        <img 
          src={logo} 
          alt="ECOM Admin Logo" 
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </div>

      {/* Badge Admin */}
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        padding: '8px 24px',
        borderRadius: '20px',
        marginBottom: '20px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <span style={{
          color: 'white',
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '2px'
        }}>
          ADMIN
        </span>
      </div>

      {/* Sous-titre */}
      <p style={{
        color: 'rgba(255,255,255,0.95)',
        fontSize: '16px',
        marginBottom: '30px',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        Espace d'administration
      </p>

      {/* Barre de progression */}
      <div style={{
        width: '280px',
        marginBottom: '15px'
      }}>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: 'white',
            borderRadius: '10px',
            transition: 'width 0.3s ease',
            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
          }}></div>
        </div>
      </div>

      {/* Pourcentage */}
      <div style={{
        color: 'white',
        fontSize: '18px',
        fontWeight: '600',
        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {Math.round(progress)}%
      </div>

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
