import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../LanguageContext'
import { useTranslation } from '../i18n'
import { useWallet } from '../context/WalletContext'
import { formatAmount } from '../utils/formatCurrency'
import MapComponent from '../components/MapComponent'
import WalletPage from '../components/WalletPage'

export default function Home(){
  const { language } = useLanguage()
  const t = useTranslation(language)
  const { balance } = useWallet()
  const [selectedService, setSelectedService] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [showWallet, setShowWallet] = useState(false)

  const services = [
    { 
      id: 'taxi', 
      name: 'Taxi', 
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="9" width="16" height="10" rx="2"/>
        <path d="M6 9V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
        <circle cx="8" cy="19" r="2"/>
        <circle cx="16" cy="19" r="2"/>
        <path d="M4 12h16"/>
      </svg>, 
      color: '#FFF3E0', 
      textColor: '#212121' 
    },
    { 
      id: 'lux', 
      name: 'Lux+', 
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>, 
      color: '#F3E5F5', 
      textColor: '#212121' 
    },
    { 
      id: 'driver', 
      name: 'Driver', 
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 17h14v-5l-3-3H8l-3 3v5z"/>
        <circle cx="7" cy="17" r="2"/>
        <circle cx="17" cy="17" r="2"/>
        <path d="M5 9l1.5-4.5h11L19 9"/>
      </svg>, 
      color: '#E3F2FD', 
      textColor: '#212121' 
    },
    { 
      id: 'delivery', 
      name: 'Livraison', 
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>, 
      color: '#FFE0B2', 
      textColor: '#212121' 
    }
  ]

  const handleServiceSelect = (service) => {
    setSelectedService(service.name)
    setShowMap(true)
  }

  const handleDestinationSelect = (destination) => {
    console.log('Destination sélectionnée:', destination, 'pour le service:', selectedService)
    // Ici vous pourriez naviguer vers une page de confirmation ou démarrer la course
  }

  const handleBackToServices = () => {
    setShowMap(false)
    setSelectedService(null)
  }

  if (showMap && selectedService) {
    return (
      <div>
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#1B5E20',
          color: 'white',
          padding: '16px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <button
            onClick={handleBackToServices}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              marginRight: '16px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <span style={{fontSize: '18px', fontWeight: '500'}}>
            Sélectionner une destination
          </span>
        </div>
        <MapComponent 
          selectedService={selectedService}
          onDestinationSelect={handleDestinationSelect}
        />
      </div>
    )
  }

  // Afficher le portefeuille si demandé
  if (showWallet) {
    return <WalletPage onClose={() => setShowWallet(false)} />
  }

  return (
    <>
      {/* Wallet Section */}
      <section 
        className="home-wallet"
        onClick={() => setShowWallet(true)}
        style={{ cursor: 'pointer' }}
      >
        <div className="wallet-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div className="wallet-info">
          <h3>Portefeuille</h3>
          <p className="wallet-amount">{formatAmount(balance)}</p>
        </div>
      </section>

      {/* Transport Services Section */}
      <section className="services-section">
        <h2 className="services-title">Services de Transport</h2>
        
        <div className="transport-grid">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              className="transport-item"
              style={{
                background: service.color,
                borderRadius: '20px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                border: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  margin: '0 auto 8px'
                }}
              >
                {service.icon}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: service.textColor
              }}>
                {service.name}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#757575',
                marginTop: '2px',
                fontWeight: '400'
              }}>
                {service.id === 'taxi' && '36 cal'}
                {service.id === 'lux' && 'Premium'}
                {service.id === 'driver' && 'Avec chauffeur'}
                {service.id === 'delivery' && '34 cal'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Other Services Section */}
      <section className="services-section">
        <h2 className="services-title">Autres Services</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <Link to="/marketplace" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#212121'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <span style={{fontSize: '12px', fontWeight: '500', textAlign: 'center'}}>Shop</span>
          </Link>
          
          <Link to="/carbon" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#212121'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span style={{fontSize: '12px', fontWeight: '500', textAlign: 'center'}}>Carbon</span>
          </Link>

          <Link to="/settings" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#212121'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m5.2-13.2l-1.4 1.4m-5.6 5.6l-1.4 1.4m8.4 0l-1.4-1.4m-5.6-5.6l-1.4-1.4"/>
              </svg>
            </div>
            <span style={{fontSize: '12px', fontWeight: '500', textAlign: 'center'}}>Plus</span>
          </Link>

          <Link to="/help" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#212121'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span style={{fontSize: '12px', fontWeight: '500', textAlign: 'center'}}>Aide</span>
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2 className="services-title">Actions Rapides</h2>
        
        <div style={{
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
              <rect x="3" y="8" width="18" height="4" rx="1"/>
              <path d="M12 8v13"/>
              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
              <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
            </svg>
            <div>
              <div style={{fontSize: '16px', fontWeight: '500'}}>Inviter des amis</div>
              <div style={{fontSize: '12px', color: '#757575'}}>Gagnez des crédits</div>
            </div>
          </div>
          
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <div>
              <div style={{fontSize: '16px', fontWeight: '500'}}>Mes courses</div>
              <div style={{fontSize: '12px', color: '#757575'}}>Historique des trajets</div>
            </div>
          </div>
          
          <div style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <div>
              <div style={{fontSize: '16px', fontWeight: '500'}}>Recharger le portefeuille</div>
              <div style={{fontSize: '12px', color: '#757575'}}>Ajouter des fonds</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}