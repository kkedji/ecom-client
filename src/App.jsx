import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from './LanguageContext'
import { useTranslation } from './i18n'
import { useAuth } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import BottomNav from './components/BottomNav'
import SplashScreen from './components/SplashScreen'
import Login from './pages/Login'
import Home from './pages/Home'
import Transport from './pages/Transport'
import Delivery from './pages/Delivery'
import Marketplace from './pages/Marketplace'
import Carbon from './pages/Carbon'
import Settings from './pages/Settings'
import EditProfile from './pages/EditProfile'
import Help from './pages/Help'
import SignUp from './pages/SignUp'
import ApiTest from './pages/ApiTest'
import Reductions from './pages/Reductions'
import Activities from './pages/Activities'
import MapService from './pages/MapService'
import Shop from './pages/Shop'
import EcoHabits from './pages/EcoHabits'
import ConfirmModal from './components/ConfirmModal'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import PromoCodesManager from './pages/admin/PromoCodesManager'
import EcoHabitsValidator from './pages/admin/EcoHabitsValidator'
import UsersManagement from './pages/admin/UsersManagement'
import Analytics from './pages/admin/Analytics'
import Notifications from './pages/admin/Notifications'
import AdminSettings from './pages/admin/AdminSettings'
import ExportData from './pages/admin/ExportData'

export default function App(){
  const { language, toggleLanguage } = useLanguage()
  const t = useTranslation(language)
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  const toggleDrawer = () => setDrawerOpen(!drawerOpen)
  const closeDrawer = () => setDrawerOpen(false)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  // Afficher le splash screen au démarrage
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

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

  // Pages sans header ni drawer (Login, SignUp, Home, Admin, Transport, Shop, Marketplace, Settings, EcoHabits)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  const isHomePage = location.pathname === '/'
  const isAdminPage = location.pathname.startsWith('/admin')
  const isTransportPage = location.pathname === '/transport'
  const isShopPage = location.pathname === '/shop'
  const isMarketplacePage = location.pathname === '/marketplace'
  const isSettingsPage = location.pathname === '/settings'
  const isEcoHabitsPage = location.pathname === '/eco-habits'
  const showHeader = !isAuthPage && !isHomePage && !isAdminPage && !isTransportPage && !isShopPage && !isMarketplacePage && !isSettingsPage && !isEcoHabitsPage

  return (
    <div className="app">
      {/* Header - masqué sur les pages d'authentification et Home */}
      {showHeader && (
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

      {/* Drawer Overlay - masqué sur les pages d'authentification et admin */}
      {!isAuthPage && !isAdminPage && (
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
            <h3>{user?.firstName || user?.name || 'Utilisateur'}</h3>
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
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <path d="M9 22V12h6v10"/>
              </svg>
            </div>
            <span className="drawer-item-text">Marketplace</span>
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
            setShowLogoutModal(true)
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
          <Route path="/reductions" element={<PrivateRoute><Reductions/></PrivateRoute>} />
          <Route path="/activities" element={<PrivateRoute><Activities/></PrivateRoute>} />
          <Route path="/map-service" element={<PrivateRoute><MapService/></PrivateRoute>} />
          <Route path="/shop" element={<PrivateRoute><Shop/></PrivateRoute>} />
          <Route path="/eco-habits" element={<PrivateRoute><EcoHabits/></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings/></PrivateRoute>} />
          <Route path="/edit-profile" element={<PrivateRoute><EditProfile/></PrivateRoute>} />
          <Route path="/help" element={<PrivateRoute><Help/></PrivateRoute>} />
          <Route path="/api-test" element={<PrivateRoute><ApiTest/></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin/>} />
          <Route path="/admin" element={<AdminRoute><AdminLayout/></AdminRoute>}>
            <Route path="dashboard" element={<AdminDashboard/>} />
            <Route path="analytics" element={<Analytics/>} />
            <Route path="promo-codes" element={<PromoCodesManager/>} />
            <Route path="eco-habits" element={<EcoHabitsValidator/>} />
            <Route path="notifications" element={<Notifications/>} />
            <Route path="export" element={<ExportData/>} />
            <Route path="users" element={<AdminRoute requiredRole="SUPER_ADMIN"><UsersManagement/></AdminRoute>} />
            <Route path="settings" element={<AdminSettings/>} />
          </Route>
        </Routes>
      </main>

      {/* Bottom Navigation pour mobile - masqué sur les pages admin */}
      {!isAdminPage && <BottomNav />}

      {/* Modale de confirmation de déconnexion */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout()
          navigate('/login')
          setShowLogoutModal(false)
        }}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Se déconnecter"
        cancelText="Annuler"
        type="warning"
      />
    </div>
  )
}
