import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/apiService'

export default function Transport(){
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('courses')
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [commandes, setCommandes] = useState([])

  useEffect(() => {
    loadActivities()
  }, [activeTab])

  const loadActivities = async () => {
    setLoading(true)
    try {
      if (activeTab === 'courses') {
        const result = await apiService.getTransportOrders()
        if (result.success) {
          setCourses(result.data || [])
        }
      } else {
        const result = await apiService.getDeliveryOrders()
        if (result.success) {
          setCommandes(result.data || [])
        }
      }
    } catch (error) {
      console.error('Erreur chargement activités:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      accepted: 'Acceptée',
      in_progress: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée'
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      accepted: '#2196F3',
      in_progress: '#4CAF50',
      completed: '#66BB6A',
      cancelled: '#F44336'
    }
    return colors[status] || '#757575'
  }

  return (
    <div style={{paddingBottom: '80px', minHeight: '100vh', background: '#F5F5F5'}}>
      {/* Menu des options */}
      <div style={{background: 'white', marginBottom: '16px'}}>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            width: '100%',
            padding: '20px 16px',
            borderBottom: '1px solid #E0E0E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: activeTab === 'courses' ? '#E8F5E9' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'courses' ? '#4CAF50' : '#424242'} strokeWidth="2">
              <rect x="4" y="9" width="16" height="10" rx="2"/>
              <path d="M6 9V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
              <circle cx="8" cy="19" r="2"/>
              <circle cx="16" cy="19" r="2"/>
            </svg>
            <span style={{fontSize: '16px', fontWeight: '500', color: activeTab === 'courses' ? '#4CAF50' : '#424242'}}>
              Mes courses
            </span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'courses' ? '#4CAF50' : '#757575'} strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        
        <button
          onClick={() => setActiveTab('commandes')}
          style={{
            width: '100%',
            padding: '20px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: activeTab === 'commandes' ? '#E8F5E9' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'commandes' ? '#4CAF50' : '#424242'} strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span style={{fontSize: '16px', fontWeight: '500', color: activeTab === 'commandes' ? '#4CAF50' : '#424242'}}>
              Mes commandes
            </span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'commandes' ? '#4CAF50' : '#757575'} strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Contenu */}
      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #E0E0E0',
              borderTop: '4px solid #4CAF50',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontSize: '14px', color: '#757575', margin: 0 }}>Chargement...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {activeTab === 'courses' && (
              <div>
                {courses.length === 0 ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#212121' }}>
                      Aucune course
                    </h3>
                    <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#757575' }}>
                      Vous n'avez pas encore de courses
                    </p>
                    <button
                      onClick={() => navigate('/')}
                      style={{
                        padding: '12px 24px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Commander une course
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {courses.map(course => (
                      <div
                        key={course.id}
                        onClick={() => navigate(`/order/${course.id}`)}
                        style={{
                          background: 'white',
                          borderRadius: '16px',
                          padding: '16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                              {course.serviceType === 'lux' ? '🚙 Lux' : course.serviceType === 'taxi' ? '🚕 Taxi' : '🚗 Driver'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#757575' }}>
                              {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: `${getStatusColor(course.status)}20`,
                            color: getStatusColor(course.status)
                          }}>
                            {getStatusLabel(course.status)}
                          </span>
                        </div>

                        <div style={{ fontSize: '14px', color: '#424242', marginBottom: '8px' }}>
                          <div style={{ marginBottom: '4px' }}>
                            📍 <strong>Départ:</strong> {course.pickupAddress}
                          </div>
                          <div>
                            📍 <strong>Arrivée:</strong> {course.dropoffAddress}
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '12px',
                          borderTop: '1px solid #F0F0F0'
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4CAF50' }}>
                            {course.totalPrice?.toLocaleString('fr-FR')} F
                          </div>
                          <div style={{ fontSize: '13px', color: '#757575' }}>
                            {course.distance?.toFixed(1)} km
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'commandes' && (
              <div>
                {commandes.length === 0 ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#212121' }}>
                      Aucune commande
                    </h3>
                    <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#757575' }}>
                      Vous n'avez pas encore de commandes de livraison
                    </p>
                    <button
                      onClick={() => navigate('/shop')}
                      style={{
                        padding: '12px 24px',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Commander une livraison
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {commandes.map(cmd => (
                      <div
                        key={cmd.id}
                        onClick={() => navigate(`/order/${cmd.id}`)}
                        style={{
                          background: 'white',
                          borderRadius: '16px',
                          padding: '16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                              📦 Livraison
                            </div>
                            <div style={{ fontSize: '12px', color: '#757575' }}>
                              {new Date(cmd.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: `${getStatusColor(cmd.status)}20`,
                            color: getStatusColor(cmd.status)
                          }}>
                            {getStatusLabel(cmd.status)}
                          </span>
                        </div>

                        <div style={{ fontSize: '14px', color: '#424242', marginBottom: '8px' }}>
                          <div style={{ marginBottom: '4px' }}>
                            📍 <strong>Récupération:</strong> {cmd.pickupAddress}
                          </div>
                          <div>
                            📍 <strong>Livraison:</strong> {cmd.dropoffAddress}
                          </div>
                        </div>

                        {cmd.items && cmd.items.length > 0 && (
                          <div style={{
                            fontSize: '13px',
                            color: '#757575',
                            marginBottom: '8px',
                            paddingTop: '8px',
                            borderTop: '1px solid #F0F0F0'
                          }}>
                            {cmd.items.length} article{cmd.items.length > 1 ? 's' : ''}
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '12px',
                          borderTop: '1px solid #F0F0F0'
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#4CAF50' }}>
                            {cmd.totalPrice?.toLocaleString('fr-FR')} F
                          </div>
                          <div style={{ fontSize: '13px', color: '#757575' }}>
                            {cmd.distance?.toFixed(1)} km
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
