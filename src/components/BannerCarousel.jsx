import React, { useState, useEffect } from 'react'

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Liste des bannières - vous pouvez ajouter vos images dans public/banners/
  const banners = [
    '/banners/banner1.jpg',
    '/banners/banner2.jpg',
    '/banners/banner3.jpg'
  ]

  // Auto-défilement toutes les 4 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [banners.length])

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '200px',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '20px',
      background: 'linear-gradient(135deg, #4CAF50 0%, #1B5E20 100%)'
    }}>
      {/* Images du carrousel */}
      {banners.map((banner, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: currentIndex === index ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={banner}
            alt={`Banner ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              // Si l'image n'existe pas, afficher un placeholder
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; text-align: center; padding: 20px;">
                  <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">Ride the future...</h2>
                  <p style="margin: 0; font-size: 14px; opacity: 0.9;">Déposez vos images dans public/banners/</p>
                </div>
              `
            }}
          />
        </div>
      ))}

      {/* Indicateurs de pagination */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 10
      }}>
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              border: 'none',
              background: currentIndex === index ? 'white' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0
            }}
            aria-label={`Aller à la bannière ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
