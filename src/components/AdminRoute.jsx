import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children, requiredRole = 'ADMIN' }) {
  const { user, loading } = useAuth()

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#F5F5F5'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #E0E0E0',
            borderTop: '4px solid #4CAF50',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#757575', fontSize: '14px' }}>Vérification des accès...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Pas connecté → Redirection vers login admin
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  // Vérification du rôle admin
  // Le backend doit renvoyer user.role et user.isAdmin
  const isAdmin = user.isAdmin === true || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  
  if (!isAdmin) {
    // Utilisateur normal essaie d'accéder à l'admin → Redirection vers home
    return <Navigate to="/" replace />
  }

  // Vérification du rôle spécifique si requis
  if (requiredRole === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    // Admin normal essaie d'accéder à une page Super Admin
    return <Navigate to="/admin/dashboard" replace />
  }

  // Accès autorisé
  return children
}
