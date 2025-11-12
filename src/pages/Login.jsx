import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            backgroundColor: '#ff6b00',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h1 style={{
              color: 'white',
              fontSize: '42px',
              fontWeight: 'bold',
              margin: 0
            }}>E</h1>
          </div>
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: '600',
            color: '#333'
          }}>Bienvenue sur ECOM</h2>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#757575'
          }}>Connectez-vous avec votre numéro de téléphone</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>Numéro de téléphone</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                padding: '12px 16px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRight: 'none',
                borderRadius: '4px 0 0 4px',
                fontSize: '16px',
                fontWeight: '500'
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
                  padding: '12px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '0 4px 4px 0',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff6b00'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '24px',
              backgroundColor: '#ffebee',
              border: '1px solid #ef5350',
              borderRadius: '4px',
              color: '#c62828',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#ccc' : '#ff6b00',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#e56000')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#ff6b00')}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Info développement */}
        <div style={{
          marginTop: '24px',
          padding: '12px 16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#757575'
        }}>
          ℹ️ Mode développement : Entrez n'importe quel numéro pour créer ou accéder à un compte.
        </div>
      </div>
    </div>
  )
}

export default Login
