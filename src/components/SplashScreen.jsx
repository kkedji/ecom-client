import React from 'react';

const SplashScreen = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo" style={{
          width: '120px',
          height: '120px',
          margin: '0 auto',
          background: '#f5f5f5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1B5E20" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p className="splash-text">Chargement en cours...</p>
      </div>
    </div>
  );
};

export default SplashScreen;