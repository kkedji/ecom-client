import React, { useState } from 'react'

const ShopDetailsModal = ({ shop, onClose, onAddToCart }) => {
  const [selectedItems, setSelectedItems] = useState([])

  const addToCart = (item) => {
    const existingItem = selectedItems.find(i => i.id === item.id)
    if (existingItem) {
      setSelectedItems(selectedItems.map(i => 
        i.id === item.id ? {...i, quantity: i.quantity + 1} : i
      ))
    } else {
      setSelectedItems([...selectedItems, {...item, quantity: 1}])
    }
  }

  const removeFromCart = (itemId) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId)
    } else {
      setSelectedItems(selectedItems.map(i => 
        i.id === itemId ? {...i, quantity: newQuantity} : i
      ))
    }
  }

  const getTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleConfirmOrder = () => {
    onAddToCart(selectedItems, shop)
    onClose()
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
      flexDirection: 'column'
    }}>
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
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              marginRight: '16px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <div>
            <h2 style={{margin: 0, fontSize: '18px'}}>{shop.name}</h2>
            <p style={{margin: 0, fontSize: '12px', opacity: 0.8}}>{shop.category}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{flex: 1, background: 'white', overflow: 'auto'}}>
        {/* Shop Info */}
        <div style={{padding: '20px', borderBottom: '1px solid #f0f0f0'}}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: shop.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginRight: '16px'
            }}>
              {shop.icon}
            </div>
            <div>
              <h3 style={{margin: 0, fontSize: '18px'}}>{shop.name}</h3>
              <p style={{margin: '4px 0', color: '#757575', fontSize: '14px'}}>{shop.description}</p>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <span style={{fontSize: '12px', color: '#4CAF50'}}>⭐ {shop.rating}</span>
                <span style={{fontSize: '12px', color: '#757575'}}>🕒 {shop.deliveryTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{padding: '20px'}}>
          <h3 style={{margin: '0 0 16px', fontSize: '16px', color: '#1B5E20'}}>Menu</h3>
          
          {shop.items.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{flex: 1}}>
                <h4 style={{margin: '0 0 4px', fontSize: '16px'}}>{item.name}</h4>
                <p style={{margin: '0 0 8px', fontSize: '14px', color: '#757575'}}>{item.description}</p>
                <p style={{margin: 0, fontSize: '16px', fontWeight: '600', color: '#1B5E20'}}>
                  {item.price.toLocaleString()} F
                </p>
              </div>
              
              <div style={{marginLeft: '16px'}}>
                {selectedItems.find(i => i.id === item.id) ? (
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <button
                      onClick={() => updateQuantity(item.id, selectedItems.find(i => i.id === item.id).quantity - 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '16px',
                        border: '1px solid #1B5E20',
                        background: 'white',
                        color: '#1B5E20',
                        fontSize: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{fontSize: '16px', fontWeight: '600', minWidth: '20px', textAlign: 'center'}}>
                      {selectedItems.find(i => i.id === item.id).quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, selectedItems.find(i => i.id === item.id).quantity + 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '16px',
                        border: 'none',
                        background: '#1B5E20',
                        color: 'white',
                        fontSize: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '1px solid #1B5E20',
                      background: 'white',
                      color: '#1B5E20',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Ajouter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      {selectedItems.length > 0 && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderTop: '1px solid #f0f0f0',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{marginBottom: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <span style={{fontSize: '16px'}}>Articles ({selectedItems.length})</span>
              <span style={{fontSize: '16px', fontWeight: '600'}}>
                {getTotalPrice().toLocaleString()} F
              </span>
            </div>
            <div style={{fontSize: '12px', color: '#757575'}}>
              + Frais de livraison: 500 F
            </div>
          </div>
          
          <button
            onClick={handleConfirmOrder}
            style={{
              width: '100%',
              padding: '16px',
              border: 'none',
              borderRadius: '12px',
              background: '#1B5E20',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Commander • {(getTotalPrice() + 500).toLocaleString()} F
          </button>
        </div>
      )}
    </div>
  )
}

export default function Marketplace(){
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [selectedShop, setSelectedShop] = useState(null)
  const [cart, setCart] = useState([])

  const categories = ['Tous', 'Restaurant', 'Supermarché', 'Pharmacie', 'Boulangerie']

  const shops = [
    {
      id: 1,
      name: 'Restaurant Délices',
      category: 'Restaurant',
      icon: '🍽️',
      color: '#FF9800',
      rating: '4.5',
      deliveryTime: '20-30 min',
      description: 'Cuisine locale et internationale',
      items: [
        { id: 1, name: 'Riz au gras', description: 'Riz local avec légumes et viande', price: 2500 },
        { id: 2, name: 'Fufu aux légumes', description: 'Plat traditionnel togolais', price: 2000 },
        { id: 3, name: 'Poisson braisé', description: 'Poisson frais grillé aux épices', price: 3000 },
        { id: 4, name: 'Jus de gingembre', description: 'Boisson rafraîchissante naturelle', price: 500 }
      ]
    },
    {
      id: 2,
      name: 'Supermarché Express',
      category: 'Supermarché',
      icon: '🛒',
      color: '#4CAF50',
      rating: '4.2',
      deliveryTime: '30-45 min',
      description: 'Produits alimentaires et ménagers',
      items: [
        { id: 5, name: 'Riz (5kg)', description: 'Riz de qualité supérieure', price: 4000 },
        { id: 6, name: 'Huile (1L)', description: 'Huile de cuisson', price: 1500 },
        { id: 7, name: 'Tomates (1kg)', description: 'Tomates fraîches', price: 800 },
        { id: 8, name: 'Lait en poudre', description: 'Lait en poudre enrichi', price: 2500 }
      ]
    },
    {
      id: 3,
      name: 'Pharmacie Santé+',
      category: 'Pharmacie',
      icon: '💊',
      color: '#2196F3',
      rating: '4.8',
      deliveryTime: '15-25 min',
      description: 'Médicaments et produits de santé',
      items: [
        { id: 9, name: 'Paracétamol', description: 'Comprimés contre la douleur', price: 500 },
        { id: 10, name: 'Vitamine C', description: 'Complément vitaminique', price: 1200 },
        { id: 11, name: 'Désinfectant', description: 'Gel hydroalcoolique', price: 800 },
        { id: 12, name: 'Pansements', description: 'Boîte de pansements', price: 600 }
      ]
    },
    {
      id: 4,
      name: 'Boulangerie Moderne',
      category: 'Boulangerie',
      icon: '🥖',
      color: '#FF5722',
      rating: '4.6',
      deliveryTime: '10-20 min',
      description: 'Pain frais et pâtisseries',
      items: [
        { id: 13, name: 'Baguette', description: 'Pain frais du jour', price: 200 },
        { id: 14, name: 'Croissant', description: 'Viennoiserie au beurre', price: 300 },
        { id: 15, name: 'Gâteau au chocolat', description: 'Part de gâteau maison', price: 1000 },
        { id: 16, name: 'Pain de mie', description: 'Pain de mie tranché', price: 800 }
      ]
    }
  ]

  const filteredShops = selectedCategory === 'Tous' 
    ? shops 
    : shops.filter(shop => shop.category === selectedCategory)

  const handleAddToCart = (items, shop) => {
    const orderItems = items.map(item => ({
      ...item,
      shopName: shop.name,
      shopId: shop.id
    }))
    setCart([...cart, ...orderItems])
  }

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return (
    <div style={{padding: '16px', minHeight: '100vh', background: '#f5f5f5'}}>
      {/* Header */}
      <div style={{marginBottom: '24px'}}>
        <h1 style={{margin: '0 0 8px', fontSize: '24px', color: '#1B5E20'}}>
          Marketplace
        </h1>
        <p style={{margin: 0, color: '#757575', fontSize: '16px'}}>
          Découvrez les boutiques près de chez vous
        </p>
      </div>

      {/* Categories */}
      <div style={{marginBottom: '24px'}}>
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                background: selectedCategory === category ? '#1B5E20' : 'white',
                color: selectedCategory === category ? 'white' : '#1B5E20',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div style={{
          background: '#1B5E20',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{fontSize: '16px', fontWeight: '600'}}>
              🛒 {getCartItemsCount()} article(s) dans le panier
            </div>
            <div style={{fontSize: '14px', opacity: 0.9}}>
              Total: {getCartTotal().toLocaleString()} F
            </div>
          </div>
          <button style={{
            background: 'white',
            color: '#1B5E20',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Voir le panier
          </button>
        </div>
      )}

      {/* Shops Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {filteredShops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => setSelectedShop(shop)}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)'
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '16px'}}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: shop.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginRight: '16px'
              }}>
                {shop.icon}
              </div>
              <div>
                <h3 style={{margin: '0 0 4px', fontSize: '18px'}}>{shop.name}</h3>
                <p style={{margin: '0 0 8px', color: '#757575', fontSize: '14px'}}>{shop.description}</p>
                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                  <span style={{fontSize: '12px', color: '#4CAF50'}}>⭐ {shop.rating}</span>
                  <span style={{fontSize: '12px', color: '#757575'}}>🕒 {shop.deliveryTime}</span>
                </div>
              </div>
            </div>
            
            <div style={{
              padding: '12px 16px',
              background: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <span style={{fontSize: '14px', color: '#1B5E20', fontWeight: '500'}}>
                Voir le menu →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Shop Details Modal */}
      {selectedShop && (
        <ShopDetailsModal
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}