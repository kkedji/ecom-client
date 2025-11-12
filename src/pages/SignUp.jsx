import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoImage from '../assets/images/ecom-logo.png'

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.phoneNumber.trim()) {
      setError('Veuillez entrer votre numéro de téléphone')
      return
    }
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Veuillez entrer votre nom et prénom')
      return
    }

    // Vérifier que le numéro a au moins 8 chiffres
    const digits = formData.phoneNumber.replace(/\D/g, '')
    if (digits.length < 8) {
      setError('Numéro de téléphone invalide (minimum 8 chiffres)')
      return
    }

    setLoading(true)

    try {
      // Créer d'abord le compte avec toutes les informations
      const userData = {
        phone: formData.phoneNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      }
      
      // Appeler l'API register depuis apiService
      const apiService = await import('../services/apiService')
      const registerResult = await apiService.default.register(userData)
      
      if (registerResult.success) {
        // Puis connecter l'utilisateur
        const loginResult = await login(formData.phoneNumber)
        
        if (loginResult.success) {
          // Rediriger vers la page d'accueil
          navigate('/')
        } else {
          setError('Compte créé mais erreur de connexion. Veuillez vous connecter manuellement.')
        }
      } else {
        // Si l'utilisateur existe déjà, tenter la connexion
        if (registerResult.error?.includes('existe') || registerResult.error?.includes('already')) {
          const loginResult = await login(formData.phoneNumber)
          if (loginResult.success) {
            navigate('/')
          } else {
            setError('Utilisateur existe déjà. Veuillez vous connecter.')
          }
        } else {
          setError(registerResult.error || 'Erreur lors de l\'inscription')
        }
      }
    } catch (err) {
      console.error('Signup error:', err)
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
            Rejoignez des milliers d'utilisateurs pour le transport, la livraison et le shopping au Togo
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
        backgroundColor: 'white',
        overflowY: 'auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px'
        }}>
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{
              margin: '0 0 12px 0',
              fontSize: '32px',
              fontWeight: '700',
              color: '#2E7D32'
            }}>Inscription</h2>
            <p style={{
              margin: 0,
              fontSize: '16px',
              color: '#666'
            }}>Créez votre compte en quelques secondes</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333'
              }}>Prénom</label>
              <input
                type="text"
                name="firstName"
                placeholder="Ex: Jean"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #A5D6A7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: loading ? '#f5f5f5' : 'white',
                  boxSizing: 'border-box'
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333'
              }}>Nom</label>
              <input
                type="text"
                name="lastName"
                placeholder="Ex: Dupont"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #A5D6A7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: loading ? '#f5f5f5' : 'white',
                  boxSizing: 'border-box'
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333'
              }}>Numéro de téléphone</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  padding: '12px 16px',
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
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="90151369"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
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

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333'
              }}>Email (optionnel)</label>
              <input
                type="email"
                name="email"
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #A5D6A7',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: loading ? '#f5f5f5' : 'white',
                  boxSizing: 'border-box'
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
              {loading ? 'Création du compte...' : 'Créer mon compte'}
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
                Vous avez déjà un compte ?
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
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
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}