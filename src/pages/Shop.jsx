import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'

export default function Shop() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [promoCode, setPromoCode] = useState('')
  const [message, setMessage] = useState('')
  const [promoCodes, setPromoCodes] = useState([])
  const [loading, setLoading] = useState(false)

  const referralCode = user?.referralCode || 'AA1JVT'

  useEffect(() => {
    loadPromoCodes()
  }, [])

  const loadPromoCodes = async () => {
    setLoading(true)
    try {
      const result = await apiService.getPromoCodes()
      if (result.success) {
        setPromoCodes(result.data)
      }
    } catch (error) {
      console.error('Erreur chargement codes promo:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleGoToMarketplace = () => {
    navigate('/marketplace')
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setMessage('Veuillez entrer un code promo')
      setTimeout(() => setMessage(''), 2000)
      return
    }
    
    setMessage('Code en cours de validation...')
    try {
      const result = await apiService.applyPromoCode(promoCode)
      if (result.success) {
        setMessage(`✅ Code appliqué ! -${result.data.discount}% sur votre prochaine commande`)
        setPromoCode('')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ ${result.error}`)
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('❌ Erreur lors de la validation du code')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div style={{
      background: '#F5F5F5',
      minHeight: '100vh',
      paddingBottom: '80px',
      padding: '16px'
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

          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Code promo"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                border: '2px solid #E0E0E0',
                borderRadius: '12px',
                outline: 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '600',
                boxSizing: 'border-box',
                marginBottom: '12px'
              }}
            />
            <button
              onClick={handleApplyPromo}
              style={{
                width: '100%',
                background: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
              }}
            >
              Appliquer le code
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

          {/* Liste des codes promo disponibles */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #E0E0E0',
                borderTop: '4px solid #FF9800',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : promoCodes.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#212121',
                marginBottom: '12px'
              }}>
                Codes disponibles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {promoCodes.map((promo, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#FFF3E0',
                      border: '2px dashed #FF9800',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#F57C00',
                        letterSpacing: '1px'
                      }}>
                        {promo.code}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#757575',
                        marginTop: '4px'
                      }}>
                        -{promo.discount}% • {promo.description}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPromoCode(promo.code)
                        handleApplyPromo()
                      }}
                      style={{
                        background: '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Utiliser
                    </button>
                  </div>
                ))}
              </div>
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

    </div>
  )
}
