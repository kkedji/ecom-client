import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function EditProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    // TODO: Implémenter l'upload de la photo vers le serveur
    if (selectedImage) {
      alert('Photo de profil mise à jour !')
      navigate(-1)
    } else {
      navigate(-1)
    }
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: '20px 16px',
        paddingTop: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '600' }}>
          Informations Personnelles
        </h1>
        <button
          onClick={handleSave}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginLeft: 'auto',
            padding: 0
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
      </div>

      {/* Profile Photo */}
      <div style={{
        background: 'white',
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderBottom: '1px solid #F0F0F0'
      }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: imagePreview ? `url(${imagePreview}) center/cover` : 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid #F5F5F5',
            overflow: 'hidden'
          }}>
            {!imagePreview && (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="profile-photo-input"
          />
          <label
            htmlFor="profile-photo-input"
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#4CAF50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              border: '4px solid white'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </label>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#757575',
          margin: 0,
          textAlign: 'center'
        }}>
          edit_profile_photo
        </p>
      </div>

      {/* Personal Information Form */}
      <div style={{
        background: 'white',
        margin: '16px',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#212121',
          margin: '0 0 20px'
        }}>
          Informations Personnelles
        </h2>

        {/* Prénom Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            color: '#757575',
            fontSize: '14px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Prénom</span>
          </label>
          <input
            type="text"
            value={user?.firstName || 'Skk'}
            disabled
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '12px',
              background: '#F5F5F5',
              color: '#9E9E9E',
              boxSizing: 'border-box',
              cursor: 'not-allowed'
            }}
          />
        </div>

        {/* Nom Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            color: '#757575',
            fontSize: '14px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Nom</span>
          </label>
          <input
            type="text"
            value={user?.lastName || 'KUDJO'}
            disabled
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '12px',
              background: '#F5F5F5',
              color: '#9E9E9E',
              boxSizing: 'border-box',
              cursor: 'not-allowed'
            }}
          />
        </div>

        {/* Surnom Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            color: '#757575',
            fontSize: '14px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Surnom</span>
          </label>
          <input
            type="text"
            value="Sena"
            disabled
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '12px',
              background: '#F5F5F5',
              color: '#9E9E9E',
              boxSizing: 'border-box',
              cursor: 'not-allowed'
            }}
          />
        </div>

        {/* Email Field */}
        <div style={{ marginBottom: '0' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            color: '#757575',
            fontSize: '14px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>Email</span>
          </label>
          <input
            type="email"
            value={user?.email || 'skkscan28@gmail.com'}
            disabled
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '12px',
              background: '#F5F5F5',
              color: '#9E9E9E',
              boxSizing: 'border-box',
              cursor: 'not-allowed'
            }}
          />
        </div>
      </div>
    </div>
  )
}
