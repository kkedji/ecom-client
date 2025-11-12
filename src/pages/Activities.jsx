import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Activities() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('courses')

  // Sample data - replace with real data from API
  const courses = [
    {
      id: 1,
      type: 'Livraison',
      from: 'Centre-ville',
      to: 'Plateau',
      date: '10 Nov 2025',
      time: '14:30',
      amount: '2500 FCFA',
      status: 'completed',
      driver: 'Jean Dupont'
    },
    {
      id: 2,
      type: 'Taxi',
      from: 'Aéroport Maya-Maya',
      to: 'Hôtel Radisson',
      date: '09 Nov 2025',
      time: '09:15',
      amount: '5000 FCFA',
      status: 'completed',
      driver: 'Marie Kongo'
    },
    {
      id: 3,
      type: 'Driver',
      from: 'Domicile',
      to: 'Bureau',
      date: '08 Nov 2025',
      time: '07:45',
      amount: '15000 FCFA',
      status: 'cancelled',
      driver: 'Paul Mbemba'
    }
  ]

  const commandes = [
    {
      id: 1,
      shop: 'Super U Moungali',
      items: 3,
      date: '11 Nov 2025',
      time: '16:20',
      amount: '12500 FCFA',
      status: 'completed'
    },
    {
      id: 2,
      shop: 'Pharmacie du Centre',
      items: 2,
      date: '10 Nov 2025',
      time: '11:00',
      amount: '8000 FCFA',
      status: 'completed'
    },
    {
      id: 3,
      shop: 'Restaurant Le Gourmet',
      items: 5,
      date: '09 Nov 2025',
      time: '19:30',
      amount: '18000 FCFA',
      status: 'completed'
    }
  ]

  const ActivityCard = ({ activity, isCourse }) => {
    const statusColor = activity.status === 'completed' ? '#4CAF50' : '#FF9800'
    const statusText = activity.status === 'completed' ? 'Terminé' : 'Annulé'

    return (
      <div
        onClick={() => navigate(`/activity/${activity.id}`)}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            {isCourse ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{
                    background: '#E8F5E9',
                    color: '#4CAF50',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginRight: '8px'
                  }}>
                    {activity.type}
                  </div>
                  <div style={{
                    background: activity.status === 'completed' ? '#E8F5E9' : '#FFEBEE',
                    color: statusColor,
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {statusText}
                  </div>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#4CAF50',
                      marginRight: '8px'
                    }} />
                    <span style={{ fontSize: '14px', color: '#333' }}>{activity.from}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#FF9800',
                      marginRight: '8px'
                    }} />
                    <span style={{ fontSize: '14px', color: '#333' }}>{activity.to}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" style={{ marginRight: '8px' }}>
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>{activity.shop}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#757575', marginBottom: '4px' }}>
                  {activity.items} article{activity.items > 1 ? 's' : ''}
                </div>
                <div style={{
                  background: '#E8F5E9',
                  color: '#4CAF50',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  {statusText}
                </div>
              </>
            )}
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BDBDBD" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #F0F0F0' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#757575', marginBottom: '2px' }}>
              {activity.date} · {activity.time}
            </div>
            {isCourse && activity.driver && (
              <div style={{ fontSize: '12px', color: '#757575' }}>
                Chauffeur: {activity.driver}
              </div>
            )}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#4CAF50' }}>
            {activity.amount}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: '20px 16px',
        paddingTop: '40px'
      }}>
        <h1 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '600' }}>
          Mes activités
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: 'white',
        margin: '16px',
        borderRadius: '12px',
        padding: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'courses' ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' : 'transparent',
            color: activeTab === 'courses' ? 'white' : '#757575',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          Mes courses
        </button>
        <button
          onClick={() => setActiveTab('commandes')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'commandes' ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' : 'transparent',
            color: activeTab === 'commandes' ? 'white' : '#757575',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          Mes commandes
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px' }}>
        {activeTab === 'courses' ? (
          courses.length > 0 ? (
            courses.map(course => (
              <ActivityCard key={course.id} activity={course} isCourse={true} />
            ))
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <p style={{ color: '#757575', margin: 0 }}>Aucune course pour le moment</p>
            </div>
          )
        ) : (
          commandes.length > 0 ? (
            commandes.map(commande => (
              <ActivityCard key={commande.id} activity={commande} isCourse={false} />
            ))
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p style={{ color: '#757575', margin: 0 }}>Aucune commande pour le moment</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
