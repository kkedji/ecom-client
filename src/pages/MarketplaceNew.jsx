import React, { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import PaymentModal from '../components/PaymentModal'

export default function Marketplace(){
  const { balance } = useWallet()
  const [currentView, setCurrentView] = useState('stores') // stores, shop, cart
  const [selectedStore, setSelectedStore] = useState(null)
  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const stores = [
    {
      id: 1,
      name: 'Pharmacie Actuelle',
      category: 'Santé',
      image: '💊',
      rating: 4.8,
      deliveryTime: '15-30 min',
      deliveryFee: 500,
      minOrder: 2000,
      description: 'Médicaments et produits de santé'
    },
    {
      id: 2,
      name: 'Restaurant Le Palmier',
      category: 'Restaurant',
      image: '🍽️',
      rating: 4.6,
      deliveryTime: '20-35 min',
      deliveryFee: 800,
      minOrder: 3000,
      description: 'Cuisine locale et internationale'
    },
    {
      id: 3,
      name: 'SuperMarché SGGG',
      category: 'Épicerie',
      image: '🛒',
      rating: 4.7,
      deliveryTime: '30-45 min',
      deliveryFee: 1000,
      minOrder: 5000,
      description: 'Produits alimentaires et ménagers'
    },
    {
      id: 4,
      name: 'Électronique Plus',
      category: 'Électronique',
      image: '📱',
      rating: 4.5,
      deliveryTime: '45-60 min',
      deliveryFee: 1500,
      minOrder: 10000,
      description: 'Téléphones, ordinateurs et accessoires'
    },
    {
      id: 5,
      name: 'Fashion Store',
      category: 'Mode',
      image: '👕',
      rating: 4.4,
      deliveryTime: '60-90 min',
      deliveryFee: 1200,
      minOrder: 8000,
      description: 'Vêtements et accessoires de mode'
    },
    {
      id: 6,
      name: 'Librairie du Savoir',
      category: 'Livres',
      image: '📚',
      rating: 4.9,
      deliveryTime: '30-45 min',
      deliveryFee: 600,
      minOrder: 3000,
      description: 'Livres, fournitures scolaires et bureau'
    }
  ]

  const products = {
    1: [ // Pharmacie Actuelle
      { id: 101, name: 'Paracétamol 500mg', price: 1200, image: '💊', category: 'Médicaments', stock: 50 },
      { id: 102, name: 'Vitamine C', price: 3500, image: '🍊', category: 'Vitamines', stock: 30 },
      { id: 103, name: 'Antiseptique', price: 2800, image: '🧴', category: 'Soins', stock: 25 },
      { id: 104, name: 'Masques chirurgicaux', price: 1500, image: '😷', category: 'Protection', stock: 100 }
    ],
    2: [ // Restaurant Le Palmier
      { id: 201, name: 'Riz au gras', price: 2500, image: '🍚', category: 'Plats', stock: 20 },
      { id: 202, name: 'Poisson braisé', price: 4000, image: '🐟', category: 'Plats', stock: 15 },
      { id: 203, name: 'Alloco', price: 1500, image: '🍌', category: 'Accompagnements', stock: 30 },
      { id: 204, name: 'Jus de gingembre', price: 1000, image: '🥤', category: 'Boissons', stock: 40 }
    ],
    3: [ // SuperMarché SGGG
      { id: 301, name: 'Riz 5kg', price: 3500, image: '🌾', category: 'Céréales', stock: 50 },
      { id: 302, name: 'Huile de palme 1L', price: 2000, image: '🫗', category: 'Huiles', stock: 35 },
      { id: 303, name: 'Sucre 1kg', price: 1200, image: '🧂', category: 'Condiments', stock: 60 },
      { id: 304, name: 'Savon de lessive', price: 800, image: '🧼', category: 'Ménage', stock: 45 }
    ]
  }

  const categories = ['all', 'Santé', 'Restaurant', 'Épicerie', 'Électronique', 'Mode', 'Livres']

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1, storeId: selectedStore.id }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const getTotalAmount = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const deliveryFee = selectedStore ? selectedStore.deliveryFee : 0
    return subtotal + deliveryFee
  }

  const handleCheckout = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (transaction) => {
    setCart([])
    setCurrentView('stores')
    setSelectedStore(null)
    alert('Commande confirmée ! Votre livraison sera effectuée dans ' + selectedStore.deliveryTime)
  }

  const renderStoresView = () => (
    <div style={{padding: '16px'}}>
      {/* Header */}
      <div style={{marginBottom: '24px'}}>
        <h1 style={{color: '#1B5E20', margin: '0 0 8px', fontSize: '24px'}}>
          Marketplace
        </h1>
        <p style={{color: '#757575', margin: 0, fontSize: '16px'}}>
          Découvrez nos boutiques partenaires
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <span style={{marginRight: '12px', fontSize: '20px'}}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher une boutique..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: 'none',
            flex: 1,
            fontSize: '16px',
            background: 'transparent',
            outline: 'none'
          }}
        />
      </div>

      {/* Categories */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              background: selectedCategory === category ? '#1B5E20' : 'white',
              color: selectedCategory === category ? 'white' : '#1B5E20',
              border: selectedCategory === category ? 'none' : '2px solid #1B5E20',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {category === 'all' ? 'Toutes' : category}
          </button>
        ))}
      </div>

      {/* Stores Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {filteredStores.map(store => (
          <div
            key={store.id}
            onClick={() => {
              setSelectedStore(store)
              setCurrentView('shop')
            }}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease'
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '30px',
              background: '#E8F5E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '12px'
            }}>
              {store.image}
            </div>
            
            <h3 style={{
              margin: '0 0 4px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#212121'
            }}>
              {store.name}
            </h3>
            
            <p style={{
              margin: '0 0 12px',
              fontSize: '14px',
              color: '#757575'
            }}>
              {store.description}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '12px',
              color: '#757575'
            }}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span style={{marginRight: '4px'}}>⭐</span>
                <span>{store.rating}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span style={{marginRight: '4px'}}>⏱️</span>
                <span>{store.deliveryTime}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span style={{marginRight: '4px'}}>🚚</span>
                <span>{store.deliveryFee} F</span>
              </div>
            </div>

            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: '#E8F5E8',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#1B5E20'
            }}>
              Commande minimum: {store.minOrder} F
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderShopView = () => (
    <div style={{minHeight: '100vh', background: '#f5f5f5'}}>
      {/* Header */}
      <div style={{
        background: '#1B5E20',
        color: 'white',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <button
            onClick={() => {
              setCurrentView('stores')
              setSelectedStore(null)
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              marginRight: '16px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{margin: 0, fontSize: '18px'}}>{selectedStore?.name}</h1>
            <p style={{margin: 0, fontSize: '14px', opacity: 0.9}}>
              {selectedStore?.deliveryTime} • {selectedStore?.deliveryFee} F de livraison
            </p>
          </div>
        </div>
        
        {cart.length > 0 && (
          <button
            onClick={() => setCurrentView('cart')}
            style={{
              background: 'white',
              color: '#1B5E20',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            Panier ({cart.length})
          </button>
        )}
      </div>

      {/* Products */}
      <div style={{padding: '16px'}}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {(products[selectedStore?.id] || []).map(product => (
            <div
              key={product.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '25px',
                background: '#E8F5E8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginBottom: '12px'
              }}>
                {product.image}
              </div>
              
              <h3 style={{
                margin: '0 0 8px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#212121'
              }}>
                {product.name}
              </h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1B5E20'
                }}>
                  {product.price} F
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#757575'
                }}>
                  Stock: {product.stock}
                </span>
              </div>

              <button
                onClick={() => addToCart(product)}
                style={{
                  width: '100%',
                  background: '#1B5E20',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Ajouter au panier
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCartView = () => (
    <div style={{minHeight: '100vh', background: '#f5f5f5'}}>
      {/* Header */}
      <div style={{
        background: '#1B5E20',
        color: 'white',
        padding: '16px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setCurrentView('shop')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            marginRight: '16px',
            cursor: 'pointer'
          }}
        >
          ←
        </button>
        <h1 style={{margin: 0, fontSize: '18px'}}>Mon Panier</h1>
      </div>

      <div style={{padding: '16px'}}>
        {cart.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '12px'
          }}>
            <div style={{fontSize: '48px', marginBottom: '16px'}}>🛒</div>
            <h3 style={{color: '#757575', margin: '0 0 8px'}}>Votre panier est vide</h3>
            <p style={{color: '#757575', margin: 0}}>Ajoutez des produits pour commencer</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              marginBottom: '16px',
              overflow: 'hidden'
            }}>
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    borderBottom: index < cart.length - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex',
                    alignItems: 'center'
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
                    fontSize: '16px',
                    marginRight: '12px'
                  }}>
                    {item.image}
                  </div>
                  
                  <div style={{flex: 1}}>
                    <h4 style={{margin: '0 0 4px', fontSize: '16px', color: '#212121'}}>
                      {item.name}
                    </h4>
                    <p style={{margin: 0, fontSize: '14px', color: '#1B5E20', fontWeight: '600'}}>
                      {item.price} F
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '16px',
                        background: '#f0f0f0',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      -
                    </button>
                    
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      minWidth: '20px',
                      textAlign: 'center'
                    }}>
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '16px',
                        background: '#1B5E20',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h3 style={{margin: '0 0 16px', fontSize: '18px', color: '#212121'}}>
                Résumé de la commande
              </h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{color: '#757575'}}>Sous-total:</span>
                <span style={{color: '#212121'}}>
                  {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} F
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{color: '#757575'}}>Livraison:</span>
                <span style={{color: '#212121'}}>{selectedStore?.deliveryFee} F</span>
              </div>
              
              <div style={{
                borderTop: '1px solid #f0f0f0',
                paddingTop: '8px',
                marginTop: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span style={{fontSize: '18px', fontWeight: '600', color: '#212121'}}>
                    Total:
                  </span>
                  <span style={{fontSize: '18px', fontWeight: '600', color: '#1B5E20'}}>
                    {getTotalAmount()} F
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              style={{
                width: '100%',
                background: '#1B5E20',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Commander ({getTotalAmount()} F)
            </button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      {currentView === 'stores' && renderStoresView()}
      {currentView === 'shop' && renderShopView()}
      {currentView === 'cart' && renderCartView()}
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={getTotalAmount()}
        description={`Commande ${selectedStore?.name} - ${cart.length} article${cart.length > 1 ? 's' : ''}`}
        category="shopping"
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}