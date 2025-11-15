import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setError('')
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Prénom requis'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nom requis'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Téléphone requis'
    } else {
      const digits = formData.phoneNumber.replace(/\D/g, '')
      if (digits.length < 8) {
        newErrors.phoneNumber = 'Numéro invalide (minimum 8 chiffres)'
      }
    }

    // Email optionnel mais doit être valide si fourni
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation requise'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validate()) return

    setLoading(true)

    try {
      // Se connecter avec les informations complètes
      const loginResult = await login(formData.phoneNumber, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || null
      })
      
      if (loginResult.success) {
        // Rediriger vers l'accueil
        navigate('/')
      } else {
        setError(loginResult.error || 'Erreur lors de l\'inscription')
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
      alignItems: 'center',
      justifyContent: 'center',
      background: '#E8E8E8',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px 35px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Titre */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#2C3E50',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          Inscription
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Prénom */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.firstName ? '1px solid #E74C3C' : '1px solid #E8E8E8',
              borderRadius: '10px',
              padding: '12px 16px',
              transition: 'all 0.3s'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5B95" strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Prénom"
                disabled={loading}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '15px',
                  outline: 'none',
                  color: '#2C3E50'
                }}
              />
            </div>
            {errors.firstName && (
              <p style={{ color: '#E74C3C', fontSize: '12px', marginTop: '4px', marginLeft: '5px' }}>
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Nom */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.lastName ? '1px solid #E74C3C' : '1px solid #E8E8E8',
              borderRadius: '10px',
              padding: '12px 16px',
              transition: 'all 0.3s'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5B95" strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Nom"
                disabled={loading}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '15px',
                  outline: 'none',
                  color: '#2C3E50'
                }}
              />
            </div>
            {errors.lastName && (
              <p style={{ color: '#E74C3C', fontSize: '12px', marginTop: '4px', marginLeft: '5px' }}>
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Téléphone */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.phoneNumber ? '1px solid #E74C3C' : '1px solid #E8E8E8',
              borderRadius: '10px',
              padding: '12px 16px',
              transition: 'all 0.3s'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E74C8C" strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Téléphone (+228...)"
                disabled={loading}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '15px',
                  outline: 'none',
                  color: '#2C3E50'
                }}
              />
            </div>
            {errors.phoneNumber && (
              <p style={{ color: '#E74C3C', fontSize: '12px', marginTop: '4px', marginLeft: '5px' }}>
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.email ? '1px solid #E74C3C' : '1px solid #E8E8E8',
              borderRadius: '10px',
              padding: '12px 16px',
              transition: 'all 0.3s'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8A5D6" strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0 }}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email (optionnel)"
                disabled={loading}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '15px',
                  outline: 'none',
                  color: '#2C3E50'
                }}
              />
            </div>
            {errors.email && (
              <p style={{ color: '#E74C3C', fontSize: '12px', marginTop: '4px', marginLeft: '5px' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.password ? '1px solid #E74C3C' : '1px solid #E8E8E8',
              borderRadius: '10px',
              padding: '12px 16px',
              transition: 'all 0.3s'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F39C6B" strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0 }}>
                <rect x="5" y="11" width="14" height="10" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mot de passe"
                disabled={loading}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '15px',
                  outline: 'none',
                  color: '#2C3E50'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  marginLeft: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5B95" strokeWidth="2">
                  {showPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#E74C3C', fontSize: '12px', marginTop: '4px', marginLeft: '5px' }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.confirmPassword ? '1px solid #E74C3C' : '1px solid #E8E8E8',
              borderRadius: '10px',
              padding: '12px 16px',
              transition: 'all 0.3s'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F39C6B" strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0 }}>
                <rect x="5" y="11" width="14" height="10" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmation"
                disabled={loading}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '15px',
                  outline: 'none',
                  color: '#2C3E50'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  marginLeft: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5B95" strokeWidth="2">
                  {showConfirmPassword ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={{ color: '#E74C3C', fontSize: '12px', marginTop: '4px', marginLeft: '5px' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Message d'erreur général */}
          {error && (
            <div style={{
              padding: '10px 14px',
              marginBottom: '14px',
              backgroundColor: '#FFEBEE',
              border: '1px solid #E74C3C',
              borderRadius: '8px',
              color: '#C62828',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          {/* Bouton Suivant */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#95A5A6' : '#95A5A6',
              color: 'white',
              padding: '14px',
              color: 'white',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Chargement...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Lien connexion */}
        <p style={{
          textAlign: 'center',
          marginTop: '18px',
          fontSize: '14px',
          color: '#7F8C8D',
          margin: '18px 0 0 0'
        }}>
          Déjà un compte ?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#27AE60',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'none',
              padding: 0
            }}
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  )
}