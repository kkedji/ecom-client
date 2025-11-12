import React, { useState, useEffect } from 'react'

const DriverApp = () => {
  const [isOnline, setIsOnline] = useState(false)
  const [currentRide, setCurrentRide] = useState(null)
  const [pendingRides, setPendingRides] = useState([
    {
      id: 1,
      pickup: 'Tokoin Wuiti',
      destination: 'Adidogomé',
      distance: '5.2 km',
      estimatedFare: 2500,
      passengerName: 'Marie K.',
      passengerPhone: '+22890123456',
      serviceType: 'Taxi',
      estimatedTime: '15 min'
    },
    {
      id: 2,
      pickup: 'Université de Lomé',
      destination: 'Aéroport',
      distance: '8.1 km', 
      estimatedFare: 4500,
      passengerName: 'Jean D.',
      passengerPhone: '+22891234567',
      serviceType: 'Lux+',
      estimatedTime: '25 min'
    }
  ])
  const [earnings, setEarnings] = useState({
    today: 15500,
    week: 85200,
    month: 340000
  })

  const acceptRide = (rideId) => {
    const ride = pendingRides.find(r => r.id === rideId)
    setCurrentRide(ride)
    setPendingRides(pendingRides.filter(r => r.id !== rideId))
  }

  const completeRide = () => {
    setEarnings(prev => ({
      ...prev,
      today: prev.today + currentRide.estimatedFare
    }))
    setCurrentRide(null)
  }

  const renderOfflineState = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '32px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '60px',
        background: '#F5F5F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        marginBottom: '24px'
      }}>
        🚗
      </div>
      
      <h2 style={{color: '#757575', margin: '0 0 16px'}}>Vous êtes hors ligne</h2>
      <p style={{color: '#757575', marginBottom: '32px', lineHeight: '1.5'}}>
        Activez votre statut en ligne pour commencer à recevoir des demandes de course
      </p>
      
      <button
        onClick={() => setIsOnline(true)}
        style={{
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          padding: '16px 32px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Passer en ligne
      </button>
    </div>
  )

  const renderOnlineState = () => (
    <div style={{background: '#f5f5f5', minHeight: '100vh'}}>
      {/* Header */}
      <div style={{
        background: '#1B5E20',
        color: 'white',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{margin: '0 0 4px', fontSize: '20px'}}>Ecom Driver</h1>
          <p style={{margin: 0, fontSize: '14px', opacity: 0.9}}>
            {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
          </p>
        </div>
        
        <button
          onClick={() => setIsOnline(false)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Passer hors ligne
        </button>
      </div>

      {/* Earnings Summary */}
      <div style={{
        background: 'white',
        margin: '16px',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <h3 style={{margin: '0 0 16px', color: '#212121'}}>Gains</h3>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '20px', fontWeight: '600', color: '#1B5E20'}}>
              {earnings.today.toLocaleString()} F
            </div>
            <div style={{fontSize: '12px', color: '#757575'}}>Aujourd'hui</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '20px', fontWeight: '600', color: '#1B5E20'}}>
              {earnings.week.toLocaleString()} F
            </div>
            <div style={{fontSize: '12px', color: '#757575'}}>Cette semaine</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '20px', fontWeight: '600', color: '#1B5E20'}}>
              {earnings.month.toLocaleString()} F
            </div>
            <div style={{fontSize: '12px', color: '#757575'}}>Ce mois</div>
          </div>
        </div>
      </div>

      {/* Current Ride */}
      {currentRide && (
        <div style={{
          background: '#E8F5E8',
          margin: '16px',
          borderRadius: '12px',
          padding: '16px',
          border: '2px solid #4CAF50'
        }}>
          <h3 style={{margin: '0 0 16px', color: '#1B5E20'}}>Course en cours</h3>
          <div style={{marginBottom: '12px'}}>
            <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '4px'}}>
              📍 {currentRide.pickup}
            </div>
            <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>
              🎯 {currentRide.destination}
            </div>
            <div style={{fontSize: '14px', color: '#757575'}}>
              {currentRide.passengerName} • {currentRide.passengerPhone}
            </div>
          </div>
          
          <div style={{display: 'flex', gap: '8px'}}>
            <button
              style={{
                flex: 1,
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📞 Appeler
            </button>
            <button
              onClick={completeRide}
              style={{
                flex: 1,
                background: '#1B5E20',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✅ Terminer
            </button>
          </div>
        </div>
      )}

      {/* Pending Rides */}
      {!currentRide && pendingRides.length > 0 && (
        <div style={{margin: '16px'}}>
          <h3 style={{margin: '0 0 16px', color: '#212121'}}>Nouvelles demandes</h3>
          {pendingRides.map(ride => (
            <div
              key={ride.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                border: '1px solid #e0e0e0'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{flex: 1}}>
                  <div style={{
                    fontSize: '12px',
                    color: 'white',
                    background: ride.serviceType === 'Lux+' ? '#9C27B0' : '#FFC107',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    marginBottom: '8px'
                  }}>
                    {ride.serviceType}
                  </div>
                  
                  <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '4px'}}>
                    📍 {ride.pickup}
                  </div>
                  <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>
                    🎯 {ride.destination}
                  </div>
                  <div style={{fontSize: '14px', color: '#757575'}}>
                    {ride.distance} • {ride.estimatedTime}
                  </div>
                </div>
                
                <div style={{textAlign: 'right'}}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1B5E20'
                  }}>
                    {ride.estimatedFare} F
                  </div>
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '8px'}}>
                <button
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '2px solid #F44336',
                    color: '#F44336',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Refuser
                </button>
                <button
                  onClick={() => acceptRide(ride.id)}
                  style={{
                    flex: 1,
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Accepter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No rides available */}
      {!currentRide && pendingRides.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 16px',
          background: 'white',
          margin: '16px',
          borderRadius: '12px'
        }}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>🔍</div>
          <h3 style={{color: '#757575', margin: '0 0 8px'}}>En attente de courses</h3>
          <p style={{color: '#757575', margin: 0}}>
            Restez connecté, de nouvelles demandes arrivent bientôt !
          </p>
        </div>
      )}
    </div>
  )

  return isOnline ? renderOnlineState() : renderOfflineState()
}

export default DriverApp