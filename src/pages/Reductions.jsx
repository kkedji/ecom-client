import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Reductions() {
  const { user } = useAuth()
  const [promoCode, setPromoCode] = useState('')
  const [message, setMessage] = useState('')

  const referralCode = user?.referralCode || 'AA1JVT'

  const handleShare = async () => {
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
    setTimeout(() => {
      setMessage('Code appliqué avec succès !')
      setPromoCode('')
    }, 1000)
  }

  return (
    <div style={{
      background: '#F5F5F5',
      minHeight: '100vh',
      paddingBottom: '80px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: '16px',
        paddingTop: '40px',
        paddingBottom: '80px',
        color: 'white',
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0,
          textAlign: 'center',
          marginBottom: '24px'
        }}>Réductions</h1>
        
        {/* Cercle icône */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="8" width="18" height="4" rx="1"/>
            <rect x="3" y="8" width="18" height="12" rx="2"/>
            <path d="M12 8v4"/>
            <path d="M8 16h8"/>
          </svg>
        </div>
      </div>

      <div style={{
        marginTop: '-40px',
        padding: '0 16px'
      }}>
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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#212121',
              margin: 0
            }}>Partager le code de parrainage</h2>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#757575',
            marginBottom: '20px',
            lineHeight: '1.5'
          }}>
            Invitez vos amis et gagnez des réductions sur vos prochaines courses !
          </p>

          <div style={{
            background: '#E8F5E9',
            borderRadius: '12px',
            padding: '20px',
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
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1B5E20',
              letterSpacing: '4px'
            }}>{referralCode}</div>
          </div>

          <button
            onClick={handleShare}
            style={{
              width: '100%',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
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
            Partager le code
          </button>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
              <polyline points="17,2 12,7 7,2"/>
            </svg>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#212121',
              margin: 0
            }}>Mon code Promo</h2>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#757575',
            marginBottom: '20px',
            lineHeight: '1.5'
          }}>
            Vous avez un code promo ? Entrez-le ici pour bénéficier de réductions !
          </p>

          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Entrez votre code"
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
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
              }}
            >
              Appliquer
            </button>
          </div>

          {message && (
            <div style={{
              background: '#E8F5E9',
              color: '#2E7D32',
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

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#212121',
            marginBottom: '16px',
            marginTop: 0
          }}>Vos avantages</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#F5F5F5',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#E8F5E9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#212121' }}>
                  Parrainage
                </div>
                <div style={{ fontSize: '12px', color: '#757575' }}>
                  500 F pour chaque ami qui utilise votre code
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#F5F5F5',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#E8F5E9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#212121' }}>
                  Code Promo
                </div>
                <div style={{ fontSize: '12px', color: '#757575' }}>
                  Réductions sur vos courses et livraisons
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
