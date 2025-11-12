import React, { useState, useEffect } from 'react'
import logo from '../assets/images/ecom-logo.png'

function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

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
      {/* Logo sans rotation */}
      <div>
        <img 
          src={logo} 
          alt="Ecom Logo" 
          style={{
            width: '150px',
            height: '150px',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Barre de progression */}
      <div style={{
        width: '250px',
        height: '6px',
        backgroundColor: '#e0e0e0',
        borderRadius: '10px',
        marginTop: '40px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#4CAF50',
          borderRadius: '10px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Pourcentage */}
      <p style={{
        marginTop: '16px',
        fontSize: '14px',
        color: '#4CAF50',
        fontWeight: 600
      }}>
        {progress}%
      </p>
    </div>
  )
}

export default LoadingScreen
