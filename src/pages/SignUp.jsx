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
        padding: '40px',
        maxWidth: '500px',
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
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.firstName ? '2px solid #E74C3C' : '2px solid transparent',
              borderRadius: '12px',
              padding: '16px 20px',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px', color: '#95A5A6' }}>👤</span>
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
                  fontSize: '16px',
                  outline: 'none',
                  color: '#2C3E50'
                }}
              />
            </div>
            {errors.firstName && (
              <p style={{ color: '#E74C3C', fontSize: '13px', marginTop: '5px', marginLeft: '5px' }}>
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Nom */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.lastName ? '2px solid #E74C3C' : '2px solid transparent',
              borderRadius: '12px',
              padding: '16px 20px',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px', color: '#95A5A6' }}>👤</span>
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
                  fontSize: '16px',
                  outline: 'none',
                  color: '#2C3E50'
                }}
              />
            </div>
            {errors.lastName && (
              <p style={{ color: '#E74C3C', fontSize: '13px', marginTop: '5px', marginLeft: '5px' }}>
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Téléphone */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.phoneNumber ? '2px solid #E74C3C' : '2px solid transparent',
              borderRadius: '12px',
              padding: '16px 20px',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px', color: '#95A5A6' }}>📞</span>
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
                  fontSize: '16px',
                  outline: 'none',
                  color: '#2C3E50'
                }}
              />
            </div>
            {errors.phoneNumber && (
              <p style={{ color: '#E74C3C', fontSize: '13px', marginTop: '5px', marginLeft: '5px' }}>
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.email ? '2px solid #E74C3C' : '2px solid transparent',
              borderRadius: '12px',
              padding: '16px 20px',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px', color: '#95A5A6' }}>✉️</span>
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
                  fontSize: '16px',
                  outline: 'none',
                  color: '#2C3E50'
                }}
              />
            </div>
            {errors.email && (
              <p style={{ color: '#E74C3C', fontSize: '13px', marginTop: '5px', marginLeft: '5px' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.password ? '2px solid #E74C3C' : '2px solid transparent',
              borderRadius: '12px',
              padding: '16px 20px',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px', color: '#95A5A6' }}>🔒</span>
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
                  fontSize: '16px',
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
                  fontSize: '20px',
                  padding: '0',
                  marginLeft: '8px'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#E74C3C', fontSize: '13px', marginTop: '5px', marginLeft: '5px' }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirmation mot de passe */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F8F9FA',
              border: errors.confirmPassword ? '2px solid #E74C3C' : '2px solid transparent',
              borderRadius: '12px',
              padding: '16px 20px',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '20px', marginRight: '12px', color: '#95A5A6' }}>🔒</span>
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
                  fontSize: '16px',
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
                  fontSize: '20px',
                  padding: '0',
                  marginLeft: '8px'
                }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={{ color: '#E74C3C', fontSize: '13px', marginTop: '5px', marginLeft: '5px' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Message d'erreur général */}
          {error && (
            <div style={{
              padding: '14px 18px',
              marginBottom: '24px',
              backgroundColor: '#FFEBEE',
              border: '2px solid #E74C3C',
              borderRadius: '12px',
              color: '#C62828',
              fontSize: '14px'
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
              padding: '18px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '18px',
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
          marginTop: '20px',
          fontSize: '15px',
          color: '#7F8C8D'
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
              fontSize: '15px'
            }}
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  )
}