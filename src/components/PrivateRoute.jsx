import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, CircularProgress } from '@mui/material'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  // Afficher un loader pendant la vérification du token
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // Afficher le contenu si authentifié
  return children
}

export default PrivateRoute
