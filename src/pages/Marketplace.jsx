import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiService from '../services/apiService'

export default function Marketplace() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  const [shops, setShops] = useState([])

  const categories = [
    { id: 'all', name: 'Tout', icon: '🏪' },
    { id: 'food', name: 'Alimentation', icon: '🍔' },
    { id: 'fashion', name: 'Mode', icon: '👕' },
    { id: 'electronics', name: 'Électronique', icon: '📱' },
    { id: 'home', name: 'Maison', icon: '🏠' },
    { id: 'beauty', name: 'Beauté', icon: '💄' },
    { id: 'sports', name: 'Sport', icon: '⚽' },
    { id: 'books', name: 'Livres', icon: '📚' },
    { id: 'other', name: 'Autre', icon: '🛍️' }
  ]

  useEffect(() => {
    loadShops()
  }, [selectedCategory, searchTerm])

  const loadShops = async () => {
    setLoading(true)
    try {
      const result = await apiService.getShops({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchTerm || undefined
      })
      if (result.success) {
        setShops(result.data || [])
      }
    } catch (error) {
      console.error('Erreur chargement boutiques:', error)
      setShops([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      paddingBottom: '80px'
    }}>

      {/* Barre de recherche */}
      <div style={{ padding: '16px' }}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une boutique ou un produit..."
            style={{
              width: '100%',
              padding: '14px 16px 14px 44px',
              fontSize: '15px',
              border: '2px solid #E0E0E0',
              borderRadius: '12px',
              outline: 'none',
              boxSizing: 'border-box',
              background: 'white'
            }}
          />
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#757575"
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>

        {/* Catégories */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '20px'
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '10px 16px',
                background: selectedCategory === category.id ? '#4CAF50' : 'white',
                color: selectedCategory === category.id ? 'white' : '#424242',
                border: selectedCategory === category.id ? 'none' : '2px solid #E0E0E0',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #E0E0E0',
              borderTop: '4px solid #4CAF50',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontSize: '15px', color: '#757575', margin: 0 }}>
              Chargement des boutiques...
            </p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : shops.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', color: '#212121', fontWeight: '600' }}>
              Aucune boutique disponible
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#757575', lineHeight: '1.6' }}>
              {searchTerm || selectedCategory !== 'all' 
                ? 'Aucune boutique ne correspond à vos critères de recherche.'
                : 'Les boutiques seront bientôt disponibles.'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                style={{
                  padding: '12px 24px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px'
          }}>
            {shops.map(shop => (
              <div
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100px',
                  background: '#F5F5F5',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px'
                }}>
                  {shop.logo || '🏪'}
                </div>
                <h4 style={{
                  margin: '0 0 4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121'
                }}>
                  {shop.name}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#757575'
                }}>
                  {shop.category}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
