import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix pour les icônes de marqueurs Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Icône personnalisée verte pour le départ
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Icône personnalisée orange pour l'arrivée
const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Composant pour recentrer la carte
function MapUpdater({ center, markers }) {
  const map = useMap()
  
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers)
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (center) {
      map.setView(center, 13)
    }
  }, [center, markers, map])
  
  return null
}

export default function MapService() {
  const navigate = useNavigate()
  const location = useLocation()
  const serviceType = location.state?.serviceType || 'Livraison'
  
  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)
  const [fromCoords, setFromCoords] = useState(null)
  const [toCoords, setToCoords] = useState(null)

  // Récupérer les lieux favoris depuis localStorage
  const favoritePlaces = useState(() => {
    const saved = localStorage.getItem('favoritePlaces')
    return saved ? JSON.parse(saved) : []
  })[0]

  // Suggestions de lieux à Lomé avec coordonnées
  const lomePlaces = [
    { name: 'Aéroport International de Lomé', area: 'Aéroport', lat: 6.1656, lng: 1.2545 },
    { name: 'Marché de Lomé', area: 'Centre-ville', lat: 6.1319, lng: 1.2223 },
    { name: 'Boulevard du 13 Janvier', area: 'Centre-ville', lat: 6.1356, lng: 1.2116 },
    { name: 'Tokoin', area: 'Tokoin', lat: 6.1508, lng: 1.2314 },
    { name: 'Agoè', area: 'Agoè', lat: 6.1978, lng: 1.1883 },
    { name: 'Bè-Kpota', area: 'Bè', lat: 6.1164, lng: 1.2544 },
    { name: 'Hédzranawoé', area: 'Hédzranawoé', lat: 6.1689, lng: 1.2889 },
    { name: 'Adidogomé', area: 'Adidogomé', lat: 6.1547, lng: 1.1856 },
    { name: 'Nyékonakpoè', area: 'Nyékonakpoè', lat: 6.1428, lng: 1.1978 },
    { name: 'Cacavéli', area: 'Cacavéli', lat: 6.1892, lng: 1.2156 },
    { name: 'Avedji', area: 'Avedji', lat: 6.1245, lng: 1.1889 },
    { name: 'Légbassito', area: 'Légbassito', lat: 6.1667, lng: 1.2456 },
    { name: 'Amoutivé', area: 'Amoutivé', lat: 6.1789, lng: 1.2234 },
    { name: 'Hôpital CHU Sylvanus Olympio', area: 'Centre-ville', lat: 6.1289, lng: 1.2156 },
    { name: 'Université de Lomé', area: 'Campus', lat: 6.1678, lng: 1.2534 },
    { name: 'Hotel 2 Février', area: 'Centre-ville', lat: 6.1323, lng: 1.2167 },
    { name: 'Stade de Kégué', area: 'Kégué', lat: 6.1089, lng: 1.2489 },
    { name: 'Port Autonome de Lomé', area: 'Port', lat: 6.1367, lng: 1.2589 }
  ]

  // Centre de Lomé par défaut
  const lomeCenter = [6.1319, 1.2223]

  // Convertir les lieux favoris au format compatible
  const formattedFavorites = favoritePlaces.map(fav => ({
    name: fav.name,
    area: fav.type === 'home' ? '🏠 Favoris' : fav.type === 'work' ? '💼 Favoris' : '📍 Favoris',
    lat: fav.lat,
    lng: fav.lng,
    isFavorite: true
  }))

  // Combiner lieux favoris et lieux de Lomé
  const allPlaces = [...formattedFavorites, ...lomePlaces]

  const filteredFromPlaces = allPlaces.filter(place => 
    place.name.toLowerCase().includes(searchFrom.toLowerCase()) ||
    place.area.toLowerCase().includes(searchFrom.toLowerCase())
  )

  const filteredToPlaces = allPlaces.filter(place => 
    place.name.toLowerCase().includes(searchTo.toLowerCase()) ||
    place.area.toLowerCase().includes(searchTo.toLowerCase())
  )

  const getServiceIcon = () => {
    switch (serviceType) {
      case 'Livraison':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        )
      case 'Taxi':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="4" y="9" width="16" height="10" rx="2"/>
            <path d="M6 9V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
            <circle cx="8" cy="19" r="2"/>
            <circle cx="16" cy="19" r="2"/>
          </svg>
        )
      case 'Lux+':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        )
      case 'Driver':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        )
      default:
        return null
    }
  }

  const handleConfirm = () => {
    if (!searchFrom || !searchTo) {
      alert('Veuillez sélectionner le point de départ et d\'arrivée')
      return
    }
    
    // Rediriger vers une page de confirmation avec les détails
    navigate('/booking-confirmation', {
      state: {
        serviceType,
        from: searchFrom,
        to: searchTo
      }
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: '16px',
        paddingTop: '40px',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginRight: '12px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getServiceIcon()}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                {serviceType}
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.9 }}>
                Où allez-vous ?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Carte Leaflet */}
      <div style={{
        flex: 1,
        position: 'relative',
        minHeight: '400px',
        height: 'calc(100vh - 350px)',
        zIndex: 0
      }}>
        <MapContainer 
          center={lomeCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marqueur de départ */}
          {fromCoords && (
            <Marker position={[fromCoords.lat, fromCoords.lng]} icon={greenIcon}>
              <Popup>
                <strong>Départ</strong><br />
                {searchFrom}
              </Popup>
            </Marker>
          )}
          
          {/* Marqueur d'arrivée */}
          {toCoords && (
            <Marker position={[toCoords.lat, toCoords.lng]} icon={orangeIcon}>
              <Popup>
                <strong>Arrivée</strong><br />
                {searchTo}
              </Popup>
            </Marker>
          )}

          {/* Composant pour mettre à jour la vue */}
          <MapUpdater 
            center={lomeCenter}
            markers={[
              fromCoords && [fromCoords.lat, fromCoords.lng],
              toCoords && [toCoords.lat, toCoords.lng]
            ].filter(Boolean)}
          />
        </MapContainer>
        
        {/* Contrôles de zoom personnalisés */}
        <div style={{
          position: 'absolute',
          right: '16px',
          top: '16px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'white',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            +
          </button>
          <button
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'white',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            −
          </button>
        </div>
      </div>

      {/* Search inputs */}
      <div style={{
        background: 'white',
        padding: '20px 16px',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Lieux favoris rapides */}
        {favoritePlaces.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '12px',
              color: '#757575',
              marginBottom: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#4CAF50" stroke="#4CAF50" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Lieux favoris
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              {favoritePlaces.slice(0, 5).map((fav, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!searchFrom) {
                      setSearchFrom(fav.name)
                      setFromCoords({ lat: fav.lat, lng: fav.lng })
                    } else if (!searchTo) {
                      setSearchTo(fav.name)
                      setToCoords({ lat: fav.lat, lng: fav.lng })
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#E8F5E9',
                    border: '2px solid #4CAF50',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#2E7D32',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>
                    {fav.type === 'home' ? '🏠' : fav.type === 'work' ? '💼' : '📍'}
                  </span>
                  {fav.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Point de départ */}
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#757575',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            Point de départ
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#4CAF50'
              }} />
            </div>
            <input
              type="text"
              value={searchFrom}
              onChange={(e) => {
                setSearchFrom(e.target.value)
                setShowFromSuggestions(true)
              }}
              onFocus={() => setShowFromSuggestions(true)}
              placeholder="Rechercher un lieu..."
              style={{
                width: '100%',
                padding: '12px 12px 12px 36px',
                fontSize: '16px',
                border: '2px solid #E0E0E0',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Suggestions départ */}
          {showFromSuggestions && searchFrom && filteredFromPlaces.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              marginTop: '8px'
            }}>
              {filteredFromPlaces.map((place, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSearchFrom(place.name)
                    setFromCoords({ lat: place.lat, lng: place.lng })
                    setShowFromSuggestions(false)
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < filteredFromPlaces.length - 1 ? '1px solid #F5F5F5' : 'none',
                    background: place.isFavorite ? '#E8F5E9' : 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = place.isFavorite ? '#C8E6C9' : '#F5F5F5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = place.isFavorite ? '#E8F5E9' : 'white'}
                >
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: place.isFavorite ? '#2E7D32' : '#333', 
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {place.isFavorite && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50" stroke="#4CAF50" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    )}
                    {place.name}
                  </div>
                  <div style={{ fontSize: '12px', color: place.isFavorite ? '#4CAF50' : '#757575' }}>
                    {place.area}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Point d'arrivée */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#757575',
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            Point d'arrivée
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#FF9800'
              }} />
            </div>
            <input
              type="text"
              value={searchTo}
              onChange={(e) => {
                setSearchTo(e.target.value)
                setShowToSuggestions(true)
              }}
              onFocus={() => setShowToSuggestions(true)}
              placeholder="Rechercher un lieu..."
              style={{
                width: '100%',
                padding: '12px 12px 12px 36px',
                fontSize: '16px',
                border: '2px solid #E0E0E0',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Suggestions arrivée */}
          {showToSuggestions && searchTo && filteredToPlaces.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              marginTop: '8px'
            }}>
              {filteredToPlaces.map((place, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSearchTo(place.name)
                    setToCoords({ lat: place.lat, lng: place.lng })
                    setShowToSuggestions(false)
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < filteredToPlaces.length - 1 ? '1px solid #F5F5F5' : 'none',
                    background: place.isFavorite ? '#E8F5E9' : 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = place.isFavorite ? '#C8E6C9' : '#F5F5F5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = place.isFavorite ? '#E8F5E9' : 'white'}
                >
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: place.isFavorite ? '#2E7D32' : '#333', 
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {place.isFavorite && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50" stroke="#4CAF50" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    )}
                    {place.name}
                  </div>
                  <div style={{ fontSize: '12px', color: place.isFavorite ? '#4CAF50' : '#757575' }}>
                    {place.area}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton confirmer */}
        <button
          onClick={handleConfirm}
          disabled={!searchFrom || !searchTo}
          style={{
            width: '100%',
            padding: '16px',
            background: searchFrom && searchTo ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' : '#E0E0E0',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: searchFrom && searchTo ? 'pointer' : 'not-allowed',
            boxShadow: searchFrom && searchTo ? '0 4px 12px rgba(76, 175, 80, 0.3)' : 'none',
            transition: 'all 0.3s'
          }}
        >
          Confirmer
        </button>
      </div>
    </div>
  )
}
