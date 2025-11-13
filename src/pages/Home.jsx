import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'
import { formatAmount } from '../utils/formatCurrency'
import BannerCarousel from '../components/BannerCarousel'
import WalletPage from '../components/WalletPage'
import NotificationsMenu from '../components/NotificationsMenu'

export default function Home() {
  const navigate = useNavigate()
  const { balance } = useWallet()
  const { user } = useAuth()
  const [showWallet, setShowWallet] = useState(false)

  // Si le wallet est ouvert, afficher la page wallet
  if (showWallet) {
    return <WalletPage onClose={() => setShowWallet(false)} />
  }

  return (
    <div style={{
      background: '#F5F5F5',
      minHeight: '100vh',
      paddingBottom: '80px'
    }}>
      {/* Header avec icônes */}
      <div style={{
        padding: '16px',
        background: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: '#E8F5E9',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-4.24 4.24l-4.24 4.24M23 12h-6m-6 0H1m18.36 8.66l-4.24-4.24m-4.24-4.24L6.64 3.52"/>
          </svg>
        </button>

        <NotificationsMenu />
      </div>

      {/* Contenu principal avec padding horizontal */}
      <div style={{ padding: '0 16px' }}>
        {/* Carrousel de bannières */}
        <BannerCarousel />

        {/* Section Portefeuille */}
        <div
          onClick={() => setShowWallet(true)}
          style={{
            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'white',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                color: '#2E7D32',
                fontWeight: '500',
                marginBottom: '4px'
              }}>Portefeuille</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1B5E20'
              }}>{formatAmount(balance)}</div>
            </div>
          </div>
          <button
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            Recharger
          </button>
        </div>

        {/* Services principaux - Grille 2x2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <ServiceCard
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 17h14v-5l-3-3H8l-3 3v5z"/>
                <circle cx="7" cy="17" r="2"/>
                <circle cx="17" cy="17" r="2"/>
                <path d="M5 9l1.5-4.5h11L19 9"/>
              </svg>
            }
            label="Livraison"
            onClick={() => navigate('/map-service', { state: { serviceType: 'Livraison' } })}
          />
          <ServiceCard
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            }
            label="Shop"
            onClick={() => navigate('/shop')}
          />
          <ServiceCard
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="9" width="16" height="10" rx="2"/>
                <path d="M6 9V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
                <circle cx="8" cy="19" r="2"/>
                <circle cx="16" cy="19" r="2"/>
              </svg>
            }
            label="Taxi"
            onClick={() => navigate('/map-service', { state: { serviceType: 'Taxi' } })}
          />
          <ServiceCard
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 0V7m0 0a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v4"/>
                <path d="M14 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 0V7"/>
                <path d="M4 10h16"/>
                <path d="M17 7h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1"/>
                <circle cx="17" cy="17" r="2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M3 7h16l1 10H2z"/>
              </svg>
            }
            label="Lux+"
            onClick={() => navigate('/map-service', { state: { serviceType: 'Lux+' } })}
          />
        </div>

        {/* Services supplémentaires */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          <ServiceCard
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="5.5" cy="17.5" r="2.5"/>
                <circle cx="18.5" cy="17.5" r="2.5"/>
                <path d="M5.5 17.5V12l3-4h6l3 4v5.5"/>
                <path d="M8.5 8h7"/>
                <path d="M6 12h12"/>
                <path d="M12 8V5"/>
                <circle cx="12" cy="4" r="1"/>
              </svg>
            }
            label="Driver"
            onClick={() => navigate('/map-service', { state: { serviceType: 'Driver' } })}
          />
          <ServiceCard
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="5" r="2"/>
                <path d="M10 22v-6l-2-4V8h8v4l-2 4v6"/>
                <path d="M8 8L6 22"/>
                <path d="M16 8l2 14"/>
                <path d="M12 12h4"/>
                <circle cx="12" cy="12" r="7" strokeWidth="0.5" opacity="0.3"/>
                <path d="M7 12h10" strokeWidth="0.5" opacity="0.3"/>
              </svg>
            }
            label="Eco-habitudes"
            onClick={() => navigate('/eco-habits')}
          />
        </div>
      </div>
    </div>
  )
}

// Composant ServiceCard
function ServiceCard({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'white',
        border: 'none',
        borderRadius: '16px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(76, 175, 80, 0.2)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#4CAF50'
      }}>
        {icon}
      </div>
      <span style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#212121'
      }}>{label}</span>
    </button>
  )
}
