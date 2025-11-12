import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Shop() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [promoCode, setPromoCode] = useState('')
  const [message, setMessage] = useState('')

  const referralCode = user?.referralCode || 'AA1JVT'

  const handleShareCode = async () => {
    const shareText = `Rejoins-moi sur ECOM et utilise mon code parrainage ${referralCode} pour profiter de réductions !`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Code de parrainage ECOM',
          text: shareText
        })
      } catch (err) {
        console.log('Erreur partage:', err)
      }
    } else {
      navigator.clipboard.writeText(referralCode)
      setMessage('Code copié !')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setMessage('Veuillez entrer un code promo')
      setTimeout(() => setMessage(''), 2000)
      return
    }
    
    setMessage('Code en cours de validation...')
    // TODO: Appeler l'API pour valider le code promo
    setTimeout(() => {
      setMessage('Code appliqué avec succès !')
      setPromoCode('')
    }, 1000)
  }

  const handleGoToMarketplace = () => {
    navigate('/marketplace')
  }

  return (
    <div style={{
      background: '#F5F5F5',
      minHeight: '100vh',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: '16px',
        paddingTop: '40px',
        paddingBottom: '60px',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0,
          textAlign: 'center'
        }}>Shop</h1>
      </div>

      {/* Contenu */}
      <div style={{
        marginTop: '-20px',
        padding: '0 16px'
      }}>
        {/* Option 1: Partager mon code promo */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#E8F5E9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#212121',
                margin: 0,
                marginBottom: '4px'
              }}>Partager mon code promo</h2>
              <p style={{
                fontSize: '14px',
                color: '#757575',
                margin: 0
              }}>Invitez vos amis et gagnez des réductions</p>
            </div>
          </div>

          <div style={{
            background: '#E8F5E9',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'center',
            border: '2px dashed #4CAF50'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#2E7D32',
              marginBottom: '8px',
              fontWeight: '500'
            }}>Votre code de parrainage</div>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1B5E20',
              letterSpacing: '3px'
            }}>{referralCode}</div>
          </div>

          <button
            onClick={handleShareCode}
            style={{
              width: '100%',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Partager
          </button>
        </div>

        {/* Option 2: Appliquer un code promo */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#FFF3E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#212121',
                margin: 0,
                marginBottom: '4px'
              }}>Appliquer un code promo</h2>
              <p style={{
                fontSize: '14px',
                color: '#757575',
                margin: 0
              }}>Utilisez un code pour bénéficier de réductions</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Entrez le code promo"
              style={{
                flex: 1,
                padding: '14px 16px',
                fontSize: '16px',
                border: '2px solid #E0E0E0',
                borderRadius: '12px',
                outline: 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '600'
              }}
            />
            <button
              onClick={handleApplyPromo}
              style={{
                background: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
              }}
            >
              Appliquer
            </button>
          </div>

          {message && (
            <div style={{
              background: message.includes('succès') ? '#E8F5E9' : '#FFF3E0',
              color: message.includes('succès') ? '#2E7D32' : '#F57C00',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Option 3: Accéder au Marketplace */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#E3F2FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#212121',
                margin: 0,
                marginBottom: '4px'
              }}>Marketplace</h2>
              <p style={{
                fontSize: '14px',
                color: '#757575',
                margin: 0
              }}>Parcourir les produits disponibles</p>
            </div>
          </div>

          <button
            onClick={handleGoToMarketplace}
            style={{
              width: '100%',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Accéder au Marketplace
          </button>
        </div>

        {/* Info: Comment commander une livraison */}
        <div style={{
          background: '#FFF9C4',
          borderRadius: '16px',
          padding: '20px',
          border: '2px solid #FBC02D',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F57F17" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#F57F17' }}>
                Comment ça marche ?
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#F57F17', lineHeight: '1.6' }}>
                <strong>Pour commander une livraison :</strong><br/>
                1. Allez sur le Marketplace<br/>
                2. Choisissez un marchand<br/>
                3. Sélectionnez vos produits<br/>
                4. Le marchand et un livreur seront alertés automatiquement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
