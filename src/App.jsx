import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from './LanguageContext'
import { useTranslation } from './i18n'
import { useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Transport from './pages/Transport'
import Delivery from './pages/Delivery'
import Marketplace from './pages/Marketplace'
import Carbon from './pages/Carbon'
import Settings from './pages/Settings'
import Help from './pages/Help'
import SignUp from './pages/SignUp'
import ApiTest from './pages/ApiTest'

export default function App(){
  const { language, toggleLanguage } = useLanguage()
  const t = useTranslation(language)
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const toggleDrawer = () => setDrawerOpen(!drawerOpen)
  const closeDrawer = () => setDrawerOpen(false)

  // Get page title based on route
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Accueil'
      case '/transport': return t.transport
      case '/delivery': return t.delivery  
      case '/marketplace': return t.marketplace
      case '/carbon': return t.carbon
      case '/settings': return 'Paramètres'
      case '/help': return 'Aide'
      default: return 'Ecom'
    }
  }

  // Pages sans header ni drawer (Login, SignUp)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <div className="app">
      {/* Header - masqué sur les pages d'authentification */}
      {!isAuthPage && (
        <header className="app-header">
          <button className="menu-button" onClick={toggleDrawer}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h1>{getPageTitle()}</h1>
          <button className="notification-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
        </header>
      )}

      {/* Drawer Overlay - masqué sur les pages d'authentification */}
      {!isAuthPage && (
        <>
          <div 
            className={`drawer-overlay ${drawerOpen ? 'open' : ''}`}
            onClick={closeDrawer}
          />

          {/* Navigation Drawer */}
          <nav className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-avatar">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="drawer-user-info">
            <h3>{user?.name || 'Utilisateur'}</h3>
            <p>{user?.phoneNumber || 'Non connecté'}</p>
          </div>
        </div>
        
        <div className="drawer-content">
          <Link to="/" className="drawer-item" onClick={closeDrawer}>
            <div className="drawer-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="drawer-item-text">Accueil</span>
          </Link>
          
          <Link to="/transport" className="drawer-item" onClick={closeDrawer}>
            <div className="drawer-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="drawer-item-text">Mes activités</span>
          </Link>
          
          <Link to="/marketplace" className="drawer-item" onClick={closeDrawer}>
            <div className="drawer-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <span className="drawer-item-text">Réductions</span>
          </Link>
          
          <Link to="/help" className="drawer-item" onClick={closeDrawer}>
            <div className="drawer-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span className="drawer-item-text">Aide</span>
          </Link>
          
          <Link to="/settings" className="drawer-item" onClick={closeDrawer}>
            <div className="drawer-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-4.24 4.24l-4.24 4.24M23 12h-6m-6 0H1m18.36 8.66l-4.24-4.24m-4.24-4.24L6.64 3.52"/>
              </svg>
            </div>
            <span className="drawer-item-text">Paramètres</span>
          </Link>
          
          <div className="drawer-item" onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Ecom App',
                text: 'Découvrez Ecom - Transport, livraison et marketplace',
                url: window.location.href
              }).catch(() => {})
            } else {
              alert('Fonctionnalité de partage non disponible sur ce navigateur')
            }
            closeDrawer()
          }}>
            <div className="drawer-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </div>
            <span className="drawer-item-text">Partager</span>
          </div>
          
          <div className="drawer-item" onClick={() => {
            if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
              logout()
              navigate('/login')
            }
            closeDrawer()
          }}>
            <div className="drawer-item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <span className="drawer-item-text">Déconnexion</span>
          </div>
        </div>
      </nav>
        </>
      )}

      {/* Main Content */}
      <main className="page">
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/" element={<PrivateRoute><Home/></PrivateRoute>} />
          <Route path="/transport" element={<PrivateRoute><Transport/></PrivateRoute>} />
          <Route path="/delivery" element={<PrivateRoute><Delivery/></PrivateRoute>} />
          <Route path="/marketplace" element={<PrivateRoute><Marketplace/></PrivateRoute>} />
          <Route path="/carbon" element={<PrivateRoute><Carbon/></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings/></PrivateRoute>} />
          <Route path="/help" element={<PrivateRoute><Help/></PrivateRoute>} />
          <Route path="/api-test" element={<PrivateRoute><ApiTest/></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  )
}
