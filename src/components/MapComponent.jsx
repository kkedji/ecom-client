import React, { useState } from 'react'
import SavedDestinations from './SavedDestinations'

const MapComponent = ({ selectedService, onDestinationSelect }) => {
  const [searchText, setSearchText] = useState('')
  const [showSavedDestinations, setShowSavedDestinations] = useState(false)
  const [recentAddresses] = useState([
    'Université de Lomé',
    'Marché de Tokoin',
    'Aéroport Gnassingbé Eyadéma',
    'Centre-ville de Lomé'
  ])

  const [savedPlaces, setSavedPlaces] = useState([
    { name: 'Maison', address: 'Adidogomé, Lomé', icon: '🏠' },
    { name: 'Travail', address: 'Boulevard du 13 Janvier, Lomé', icon: '🏢' }
  ])

  const handleManageSavedPlaces = () => {
    setShowSavedDestinations(true)
  }

  const handleCloseSavedDestinations = () => {
    setShowSavedDestinations(false)
  }

  return (
    <div style={{padding: '16px', height: '100vh', background: '#f5f5f5'}}>
      {/* Service Header */}
      <div style={{
        background: '#1B5E20',
        color: 'white',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <h2 style={{margin: '0', fontSize: '18px'}}>
          Service: {selectedService}
        </h2>
        <p style={{margin: '8px 0 0', fontSize: '14px', opacity: 0.9}}>
          Où allez-vous ?
        </p>
      </div>

      {/* Search Input */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        marginBottom: '16px',
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#f5f5f5',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <span style={{marginRight: '12px', fontSize: '20px'}}>🔍</span>
          <input
            type="text"
            placeholder="Trouver une adresse"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              flex: 1,
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Saved Places */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        marginBottom: '16px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <span style={{marginRight: '12px', fontSize: '20px'}}>📍</span>
            <span style={{fontSize: '16px', fontWeight: '500'}}>Destinations prédéfinies</span>
          </div>
          <button
            onClick={handleManageSavedPlaces}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              color: '#1B5E20',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ⚙️
          </button>
        </div>
        
        {savedPlaces.map((place, index) => (
          <div
            key={index}
            onClick={() => onDestinationSelect(place.address)}
            style={{
              padding: '16px',
              borderBottom: index < savedPlaces.length - 1 ? '1px solid #f0f0f0' : 'none',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              ':hover': {background: '#f5f5f5'}
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              background: '#E8F5E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '18px'
            }}>
              {place.icon}
            </div>
            <div>
              <div style={{fontSize: '16px', fontWeight: '500', marginBottom: '4px'}}>
                {place.name}
              </div>
              <div style={{fontSize: '14px', color: '#757575'}}>
                {place.address}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Addresses */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Adresses récentes
        </div>
        
        {recentAddresses.map((address, index) => (
          <div
            key={index}
            onClick={() => onDestinationSelect(address)}
            style={{
              padding: '16px',
              borderBottom: index < recentAddresses.length - 1 ? '1px solid #f0f0f0' : 'none',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '18px'
            }}>
              📍
            </div>
            <div style={{fontSize: '16px'}}>
              {address}
            </div>
          </div>
        ))}
      </div>

      {/* Simulated Map Display */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        marginTop: '16px',
        padding: '20px',
        textAlign: 'center',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          color: 'white',
          marginBottom: '16px'
        }}>
          🗺️
        </div>
        <h3 style={{color: '#1B5E20', margin: '0 0 8px'}}>Carte de Lomé</h3>
        <p style={{color: '#757575', margin: '0', fontSize: '14px'}}>
          Sélectionnez votre destination sur la carte
        </p>
      </div>

      {/* Saved Destinations Modal */}
      {showSavedDestinations && (
        <SavedDestinations
          onSave={(destinations) => {
            setSavedPlaces(destinations)
            setShowSavedDestinations(false)
          }}
          onClose={handleCloseSavedDestinations}
        />
      )}
    </div>
  )
}

export default MapComponent