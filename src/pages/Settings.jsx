import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeModal, setActiveModal] = useState(null)

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
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: '20px 16px',
        paddingTop: '40px'
      }}>
        <h1 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '600' }}>
          Paramètres
        </h1>
      </div>

      {/* Profile Card */}
      <div style={{
        background: 'white',
        margin: '16px',
        borderRadius: '16px',
        padding: '20px',
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
        <button style={{
          background: '#E8F5E9',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          color: '#4CAF50',
          cursor: 'pointer',
          fontWeight: '600',
          flexShrink: 0
        }}>
          Modifier
        </button>
      </div>

      {/* Menu Options */}
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
            {['Français', 'English', 'Lingala', 'Kikongo'].map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  // TODO: Implémenter le changement de langue
                  setActiveModal(null)
                }}
                style={{
                  padding: '16px',
                  background: lang === 'Français' ? '#E8F5E9' : '#F5F5F5',
                  border: lang === 'Français' ? '2px solid #4CAF50' : 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: lang === 'Français' ? '600' : '400',
                  color: lang === 'Français' ? '#4CAF50' : '#333',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === 'favorites' && (
        <Modal title="Mes lieux favoris" onClose={() => setActiveModal(null)}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E0E0E0" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p style={{ color: '#757575', fontSize: '16px', marginBottom: '16px' }}>
              Aucun lieu favori enregistré
            </p>
            <button
              onClick={() => setActiveModal(null)}
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
    </div>
  )
}