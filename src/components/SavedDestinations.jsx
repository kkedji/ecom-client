import React, { useState } from 'react'

const SavedDestinations = ({ onSave, onClose }) => {
  const [destinations, setDestinations] = useState([
    { id: 1, name: 'Maison', address: 'Adidogomé, Lomé', icon: '🏠', isDefault: true },
    { id: 2, name: 'Travail', address: 'Boulevard du 13 Janvier, Lomé', icon: '🏢', isDefault: true }
  ])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDestination, setNewDestination] = useState({ name: '', address: '', icon: '📍' })

  const availableIcons = ['🏠', '🏢', '🏪', '🏫', '🏥', '🏦', '🎯', '📍', '⭐', '🎪']

  const handleAddDestination = () => {
    if (newDestination.name.trim() && newDestination.address.trim()) {
      const newDest = {
        id: destinations.length + 1,
        ...newDestination,
        isDefault: false
      }
      setDestinations([...destinations, newDest])
      setNewDestination({ name: '', address: '', icon: '📍' })
      setShowAddForm(false)
    }
  }

  const handleDeleteDestination = (id) => {
    const destination = destinations.find(d => d.id === id)
    if (!destination.isDefault) {
      setDestinations(destinations.filter(d => d.id !== id))
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{margin: 0, fontSize: '18px', color: '#1B5E20'}}>
            Destinations favorites
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#757575'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{flex: 1, overflow: 'auto', padding: '0'}}>
          {/* Existing Destinations */}
          {destinations.map((dest) => (
            <div key={dest.id} style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
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
                  {dest.icon}
                </div>
                <div>
                  <div style={{fontSize: '16px', fontWeight: '500', marginBottom: '4px'}}>
                    {dest.name}
                  </div>
                  <div style={{fontSize: '14px', color: '#757575'}}>
                    {dest.address}
                  </div>
                </div>
              </div>
              {!dest.isDefault && (
                <button
                  onClick={() => handleDeleteDestination(dest.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f44336',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}

          {/* Add New Form */}
          {showAddForm && (
            <div style={{padding: '20px', borderBottom: '1px solid #f0f0f0'}}>
              <h3 style={{margin: '0 0 16px', fontSize: '16px', color: '#1B5E20'}}>
                Nouvelle destination
              </h3>
              
              {/* Icon Selection */}
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500'}}>
                  Icône
                </label>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                  {availableIcons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewDestination({...newDestination, icon})}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: newDestination.icon === icon ? '2px solid #1B5E20' : '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: newDestination.icon === icon ? '#E8F5E8' : 'white',
                        fontSize: '18px',
                        cursor: 'pointer'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500'}}>
                  Nom
                </label>
                <input
                  type="text"
                  value={newDestination.name}
                  onChange={(e) => setNewDestination({...newDestination, name: e.target.value})}
                  placeholder="Ex: Bureau, Gym, Restaurant..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Address Input */}
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500'}}>
                  Adresse
                </label>
                <input
                  type="text"
                  value={newDestination.address}
                  onChange={(e) => setNewDestination({...newDestination, address: e.target.value})}
                  placeholder="Adresse complète"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Form Actions */}
              <div style={{display: 'flex', gap: '12px'}}>
                <button
                  onClick={() => setShowAddForm(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    background: 'white',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddDestination}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#1B5E20',
                    color: 'white',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Ajouter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding: '20px', borderTop: '1px solid #f0f0f0'}}>
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                width: '100%',
                padding: '16px',
                border: 'none',
                borderRadius: '12px',
                background: '#1B5E20',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              ➕ Ajouter une destination
            </button>
          ) : (
            <div style={{textAlign: 'center', color: '#757575', fontSize: '14px'}}>
              Remplissez les informations ci-dessus
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SavedDestinations