import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment
} from '@mui/material'

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
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto',
                backgroundColor: '#ff6b00',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                E
              </Typography>
            </Box>
            <Typography variant="h5" gutterBottom>
              Bienvenue sur ECOM
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connectez-vous avec votre numéro de téléphone
            </Typography>
          </Box>

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Numéro de téléphone"
              variant="outlined"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
              placeholder="90151369"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      +228
                    </Typography>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
              autoFocus
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: '#ff6b00',
                '&:hover': {
                  backgroundColor: '#e56000'
                }
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Info développement */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              ℹ️ Mode développement : Entrez n'importe quel numéro pour créer ou accéder à un compte.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login
