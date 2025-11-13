import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../LanguageContext'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import apiService from '../services/apiService'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const [activeModal, setActiveModal] = useState(null)
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false)
  const [favoritePlaces, setFavoritePlaces] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFavoritePlaces()
  }, [])

  const loadFavoritePlaces = async () => {
    setLoading(true)
    try {
      const result = await apiService.getFavoritePlaces()
      if (result.success) {
        setFavoritePlaces(result.data || [])
      } else {
        // Fallback vers localStorage si API échoue
        const saved = localStorage.getItem('favoritePlaces')
        if (saved) setFavoritePlaces(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Erreur chargement lieux favoris:', error)
      const saved = localStorage.getItem('favoritePlaces')
      if (saved) setFavoritePlaces(JSON.parse(saved))
    } finally {
      setLoading(false)
    }
  }

  const saveFavoritePlace = async (place) => {
    try {
      const result = await apiService.addFavoritePlace(place)
      if (result.success) {
        await loadFavoritePlaces() // Recharger la liste
      } else {
        // Fallback localStorage
        const updated = [...favoritePlaces, place]
        setFavoritePlaces(updated)
        localStorage.setItem('favoritePlaces', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erreur ajout lieu favori:', error)
      const updated = [...favoritePlaces, place]
      setFavoritePlaces(updated)
      localStorage.setItem('favoritePlaces', JSON.stringify(updated))
    }
  }

  const deleteFavoritePlace = async (placeId, index) => {
    try {
      if (placeId) {
        const result = await apiService.deleteFavoritePlace(placeId)
        if (result.success) {
          await loadFavoritePlaces() // Recharger la liste
          return
        }
      }
      // Fallback localStorage
      const updated = favoritePlaces.filter((_, i) => i !== index)
      setFavoritePlaces(updated)
      localStorage.setItem('favoritePlaces', JSON.stringify(updated))
    } catch (error) {
      console.error('Erreur suppression lieu favori:', error)
      const updated = favoritePlaces.filter((_, i) => i !== index)
      setFavoritePlaces(updated)
      localStorage.setItem('favoritePlaces', JSON.stringify(updated))
    }
  }

  const AddPlaceModal = () => {
    const [selectedPosition, setSelectedPosition] = useState(null)
    const [placeName, setPlaceName] = useState('')
    const [placeType, setPlaceType] = useState('home')

    const LocationMarker = () => {
      useMapEvents({
        click(e) {
          setSelectedPosition(e.latlng)
        },
      })

      return selectedPosition ? (
        <Marker position={selectedPosition} />
      ) : null
    }

    const handleSave = () => {
      if (!selectedPosition || !placeName.trim()) {
        alert('Veuillez sélectionner un point sur la carte et entrer un nom')
        return
      }

      saveFavoritePlace({
        name: placeName,
        type: placeType,
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
        createdAt: new Date().toISOString()
      })

      setShowAddPlaceModal(false)
      setActiveModal('favorites')
    }

    return (
      <>
        <div
          onClick={() => setShowAddPlaceModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 3000,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 3001,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#212121',
            margin: '0 0 20px'
          }}>Ajouter un lieu favori</h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#212121',
              marginBottom: '8px'
            }}>Nom du lieu</label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="Ex: Maison, Bureau, Salle de sport..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #E0E0E0',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#212121',
              marginBottom: '8px'
            }}>Type de lieu</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { value: 'home', label: '🏠 Maison', icon: 'home' },
                { value: 'work', label: '💼 Travail', icon: 'briefcase' },
                { value: 'other', label: '📍 Autre', icon: 'map-pin' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setPlaceType(type.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: placeType === type.value ? '2px solid #4CAF50' : '2px solid #E0E0E0',
                    background: placeType === type.value ? '#E8F5E9' : 'white',
                    color: placeType === type.value ? '#4CAF50' : '#757575',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#212121',
              marginBottom: '8px'
            }}>Cliquez sur la carte pour sélectionner l'emplacement</label>
            <div style={{
              height: '300px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid #E0E0E0'
            }}>
              <MapContainer
                center={[6.1319, 1.2223]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker />
              </MapContainer>
            </div>
            {selectedPosition && (
              <p style={{
                fontSize: '12px',
                color: '#4CAF50',
                marginTop: '8px',
                marginBottom: 0
              }}>
                ✓ Position sélectionnée: {selectedPosition.lat.toFixed(4)}, {selectedPosition.lng.toFixed(4)}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddPlaceModal(false)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: '2px solid #E0E0E0',
                background: 'white',
                color: '#616161',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: '#4CAF50',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}
            >
              Enregistrer
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -45%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}</style>
      </>
    )
  }

  const Modal = ({ title, children, onClose }) => (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #F0F0F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#757575',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  )

  const MenuItem = ({ icon, label, onClick, color = '#333', showArrow = true }) => (
    <div 
      onClick={onClick}
      style={{
        padding: '16px',
        borderBottom: '1px solid #F0F0F0',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#F8F8F8'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ marginRight: '16px', color, display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <span style={{ fontSize: '16px', fontWeight: '500', flex: 1, color }}>{label}</span>
      {showArrow && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BDBDBD" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      )}
    </div>
  )

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: '80px', padding: '16px' }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#212121' }}>
          Paramètres
        </h1>
      </div>

      {/* Profile Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          width: '70px', 
          height: '70px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '16px',
          flexShrink: 0
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user?.name || 'Utilisateur'}
          </h2>
          <p style={{ margin: '4px 0 0', color: '#757575', fontSize: '14px' }}>
            {user?.phoneNumber || '+242 06 123 45 67'}
          </p>
          <p style={{ margin: '2px 0 0', color: '#757575', fontSize: '14px' }}>
            {user?.email || 'user@example.com'}
          </p>
        </div>
        <button
          onClick={() => navigate('/edit-profile')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      {/* Menu Options */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '16px'
      }}>
        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          }
          label="Langues"
          onClick={() => setActiveModal('languages')}
        />

        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          }
          label="Mes lieux favoris"
          onClick={() => setActiveModal('favorites')}
        />

        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          }
          label="Notifications"
          onClick={() => setActiveModal('notifications')}
        />

        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          }
          label="À propos"
          onClick={() => setActiveModal('about')}
        />
      </div>

      {/* Logout Section */}
      <div style={{
        background: 'white',
        margin: '16px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          }
          label="Déconnexion"
          onClick={() => {
            if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
              logout()
              navigate('/login')
            }
          }}
          showArrow={false}
        />
      </div>

      {/* Delete Account Section */}
      <div style={{
        background: 'white',
        margin: '16px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <MenuItem
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          }
          label="Supprimer mon compte"
          onClick={() => {
            if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.')) {
              alert('Fonctionnalité de suppression de compte à venir')
            }
          }}
          color="#f44336"
          showArrow={false}
        />
      </div>

      {/* Modales */}
      {activeModal === 'languages' && (
        <Modal title="Langues" onClose={() => setActiveModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { code: 'fr', name: 'Français' },
              { code: 'en', name: 'English' }
            ].map((lang) => {
              const isSelected = language === lang.code
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    toggleLanguage(lang.code)
                    setActiveModal(null)
                  }}
                  style={{
                    padding: '16px',
                    background: isSelected ? '#E8F5E9' : '#F5F5F5',
                    border: isSelected ? '2px solid #4CAF50' : 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? '#4CAF50' : '#333',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{lang.name}</span>
                  {isSelected && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </Modal>
      )}

      {activeModal === 'favorites' && (
        <Modal title="Mes lieux favoris" onClose={() => setActiveModal(null)}>
          {favoritePlaces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <p style={{ color: '#757575', fontSize: '16px', marginBottom: '16px' }}>
                Aucun lieu favori enregistré
              </p>
              <button
                onClick={() => {
                  setActiveModal(null)
                  setShowAddPlaceModal(true)
                }}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Ajouter un lieu
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {favoritePlaces.map((place, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      background: '#F5F5F5',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#E8F5E9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        {place.type === 'home' ? '🏠' : place.type === 'work' ? '💼' : '📍'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#212121',
                          marginBottom: '4px'
                        }}>
                          {place.name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#757575'
                        }}>
                          {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFavoritePlace(index)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#FFEBEE',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setActiveModal(null)
                  setShowAddPlaceModal(true)
                }}
                style={{
                  width: '100%',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '20px' }}>+</span>
                Ajouter un lieu
              </button>
            </>
          )}
        </Modal>
      )}

      {activeModal === 'notifications' && (
        <Modal title="Notifications" onClose={() => setActiveModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'orders', label: 'Commandes', desc: 'Notifications sur vos commandes' },
              { id: 'promos', label: 'Promotions', desc: 'Offres et réductions' },
              { id: 'news', label: 'Nouveautés', desc: 'Nouvelles fonctionnalités' }
            ].map((notif) => (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: '#F5F5F5',
                  borderRadius: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    {notif.label}
                  </div>
                  <div style={{ fontSize: '14px', color: '#757575' }}>
                    {notif.desc}
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '24px',
                  background: '#4CAF50',
                  borderRadius: '12px',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    right: '2px',
                    top: '2px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === 'about' && (
        <Modal title="À propos" onClose={() => setActiveModal(null)}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#333', margin: '0 0 8px' }}>
              ECOM
            </h3>
            <p style={{ fontSize: '14px', color: '#757575', margin: '0 0 20px' }}>
              Version 1.0.0
            </p>
            <div style={{
              background: '#F5F5F5',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <p style={{ fontSize: '14px', color: '#757575', margin: '0 0 12px', lineHeight: '1.6' }}>
                Application de commerce électronique offrant des services de livraison, transport et marketplace.
              </p>
              <p style={{ fontSize: '14px', color: '#757575', margin: 0, lineHeight: '1.6' }}>
                © 2025 SKK Analytics. Tous droits réservés.
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Fermer
            </button>
          </div>
        </Modal>
      )}

      {/* Modale pour ajouter un lieu favori */}
      {showAddPlaceModal && <AddPlaceModal />}
    </div>
  )
}