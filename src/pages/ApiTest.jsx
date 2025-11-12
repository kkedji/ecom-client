import React, { useState, useEffect } from 'react'
import apiService from '../services/apiService'

export default function ApiTest() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState({})

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    setLoading(true)
    const result = await apiService.healthCheck()
    setHealthStatus(result)
    setLoading(false)
  }

  const testLogin = async () => {
    setLoading(true)
    const result = await apiService.login('+22890151369', 'test123')
    setTestResults(prev => ({ ...prev, login: result }))
    setLoading(false)
  }

  const testWallet = async () => {
    setLoading(true)
    const result = await apiService.getWalletBalance()
    setTestResults(prev => ({ ...prev, wallet: result }))
    setLoading(false)
  }

  const testProfile = async () => {
    setLoading(true)
    const result = await apiService.getProfile()
    setTestResults(prev => ({ ...prev, profile: result }))
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>🧪 Test de connexion Backend API</h1>

      {/* Health Check */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Statut du serveur</h2>
            <p style={{ margin: 0, color: '#757575', fontSize: '14px' }}>
              Endpoint: http://localhost:5000/health
            </p>
          </div>
          <button
            onClick={checkHealth}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#1B5E20',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Test...' : 'Retester'}
          </button>
        </div>

        {healthStatus && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '8px',
            background: healthStatus.success ? '#E8F5E9' : '#FFEBEE',
            border: `1px solid ${healthStatus.success ? '#4CAF50' : '#F44336'}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '20px', marginRight: '8px' }}>
                {healthStatus.success ? '✅' : '❌'}
              </span>
              <strong>
                {healthStatus.success ? 'Serveur connecté' : 'Serveur déconnecté'}
              </strong>
            </div>
            <pre style={{
              background: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              margin: 0
            }}>
              {JSON.stringify(healthStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Test Buttons */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Tests des endpoints</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={testLogin}
            disabled={loading || !healthStatus?.success}
            style={{
              padding: '12px 20px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !healthStatus?.success) ? 'not-allowed' : 'pointer',
              opacity: (loading || !healthStatus?.success) ? 0.6 : 1,
              textAlign: 'left'
            }}
          >
            🔐 Test Login (POST /api/auth/login)
          </button>

          <button
            onClick={testWallet}
            disabled={loading || !testResults.login?.success}
            style={{
              padding: '12px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !testResults.login?.success) ? 'not-allowed' : 'pointer',
              opacity: (loading || !testResults.login?.success) ? 0.6 : 1,
              textAlign: 'left'
            }}
          >
            💰 Test Wallet Balance (GET /api/wallet/balance)
          </button>

          <button
            onClick={testProfile}
            disabled={loading || !testResults.login?.success}
            style={{
              padding: '12px 20px',
              background: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !testResults.login?.success) ? 'not-allowed' : 'pointer',
              opacity: (loading || !testResults.login?.success) ? 0.6 : 1,
              textAlign: 'left'
            }}
          >
            👤 Test Profile (GET /api/user/profile)
          </button>
        </div>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Résultats des tests</h2>
          
          {Object.entries(testResults).map(([key, result]) => (
            <div key={key} style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '8px',
              background: result.success ? '#E8F5E9' : '#FFEBEE',
              border: `1px solid ${result.success ? '#4CAF50' : '#F44336'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>
                  {result.success ? '✅' : '❌'}
                </span>
                <strong style={{ textTransform: 'capitalize' }}>{key}</strong>
              </div>
              <pre style={{
                background: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                margin: 0
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        background: '#FFF3E0',
        border: '1px solid #FFB300',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>📋 Instructions</h3>
        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Assurez-vous que le backend est démarré sur le port 5000</li>
          <li>Commande: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>npm run dev</code> dans le dossier backend</li>
          <li>Cliquez sur "Retester" pour vérifier la connexion</li>
          <li>Si le serveur est connecté ✅, testez les autres endpoints</li>
          <li>Les résultats s'afficheront ci-dessous</li>
        </ol>
      </div>
    </div>
  )
}
