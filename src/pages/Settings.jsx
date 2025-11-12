import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  return (
    <div style={{padding: '16px'}}>
      <div style={{display: 'flex', alignItems: 'center', marginBottom: '24px'}}>
        <div style={{
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          background: '#E0E0E0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '16px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div style={{flex: 1}}>
          <h2 style={{margin: '0', fontSize: '24px', fontWeight: '600'}}>{user?.name || 'Utilisateur'}</h2>
          <p style={{margin: '4px 0 0', color: '#757575'}}>{user?.phoneNumber || ''}</p>
          <p style={{margin: '4px 0 0', color: '#757575'}}>{user?.email || ''}</p>
        </div>
        <button style={{
          background: 'none',
          border: 'none',
          fontSize: '16px',
          color: '#757575',
          cursor: 'pointer'
        }}>
          Modifier
        </button>
      </div>

      <div style={{background: 'white', borderRadius: '8px', marginTop: '24px'}}>
        <div style={{padding: '16px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span style={{fontSize: '16px', fontWeight: '500'}}>Langues</span>
        </div>
        
        <div style={{padding: '16px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span style={{fontSize: '16px', fontWeight: '500'}}>Mes lieux favoris</span>
        </div>
        
        <div style={{padding: '16px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span style={{fontSize: '16px', fontWeight: '500'}}>Notifications</span>
        </div>
        
        <div style={{padding: '16px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span style={{fontSize: '16px', fontWeight: '500'}}>À propos</span>
        </div>
        
        <div style={{padding: '16px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => {
          if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
            logout()
            navigate('/login')
          }
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span style={{fontSize: '16px', fontWeight: '500'}}>Déconnexion</span>
        </div>
        
        <div style={{padding: '16px', display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={() => {
          if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.')) {
            alert('Fonctionnalité de suppression de compte à venir')
          }
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2" style={{marginRight: '16px'}}>
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
          <span style={{fontSize: '16px', fontWeight: '500', color: '#f44336'}}>Suppression de mon compte</span>
        </div>
      </div>
    </div>
  )
}