import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoImage from '../assets/images/ecom-logo.png'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!phoneNumber.trim()) {
      setError('Veuillez entrer votre numéro de téléphone')
      return
    }

    // Vérifier que le numéro a au moins 8 chiffres
    const digits = phoneNumber.replace(/\D/g, '')
    if (digits.length < 8) {
      setError('Numéro de téléphone invalide (minimum 8 chiffres)')
      return
    }

    setLoading(true)

    try {
      const result = await login(phoneNumber)
      
      if (result.success) {
        // Rediriger vers la page d'accueil
        navigate('/')
      } else {
        setError(result.error || 'Erreur de connexion')
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'stretch',
      backgroundColor: '#f0f8f0',
      flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
    }}>
      {/* Section Logo - Côté gauche (masqué sur mobile) */}
      <div style={{
        flex: '1',
        display: window.innerWidth <= 768 ? 'none' : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        padding: '60px 40px',
        minHeight: '100vh'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <img 
            src={logoImage}
            alt="ECOM Logo"
            style={{
              width: '200px',
              height: '200px',
              objectFit: 'contain',
              marginBottom: '32px',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))'
            }}
          />
          <h1 style={{
            color: 'white',
            fontSize: '42px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>ECOM</h1>
          <p style={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: '18px',
            lineHeight: '1.6',
            margin: 0
          }}>
            Votre solution complète pour le transport, la livraison et le marketplace au Togo
          </p>
        </div>
      </div>

      {/* Section Formulaire - Côté droit */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: 'white'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px'
        }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: '700',
              color: '#2E7D32'
            }}>Connexion</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#333'
              }}>Numéro de téléphone</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  padding: '14px 18px',
                  backgroundColor: '#E8F5E9',
                  border: '2px solid #A5D6A7',
                  borderRight: 'none',
                  borderRadius: '8px 0 0 8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2E7D32'
                }}>+228</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  placeholder="90151369"
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '14px 18px',
                    border: '2px solid #A5D6A7',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: loading ? '#f5f5f5' : 'white'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50';
                    e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#A5D6A7';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                padding: '14px 18px',
                marginBottom: '24px',
                backgroundColor: '#ffebee',
                border: '2px solid #ef5350',
                borderRadius: '8px',
                color: '#c62828',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: loading ? '#A5D6A7' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '17px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(76, 175, 80, 0.3)',
                transform: loading ? 'none' : 'translateY(0)'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#388E3C';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#4CAF50';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                }
              }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>

            <div style={{
              marginTop: '32px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '12px'
              }}>
                Pas encore de compte ?
              </p>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#4CAF50',
                  border: '2px solid #4CAF50',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#E8F5E9';
                  e.target.style.borderColor = '#2E7D32';
                  e.target.style.color = '#2E7D32';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#4CAF50';
                  e.target.style.color = '#4CAF50';
                }}
              >
                S'inscrire maintenant
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
