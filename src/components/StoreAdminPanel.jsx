import React, { useState } from 'react'

const StoreAdminPanel = () => {
  const [currentView, setCurrentView] = useState('dashboard') // dashboard, products, orders, analytics
  const [products, setProducts] = useState([
    { id: 1, name: 'Paracétamol 500mg', price: 1200, stock: 50, category: 'Médicaments', status: 'active' },
    { id: 2, name: 'Vitamine C', price: 3500, stock: 30, category: 'Vitamines', status: 'active' },
    { id: 3, name: 'Antiseptique', price: 2800, stock: 25, category: 'Soins', status: 'active' },
    { id: 4, name: 'Masques chirurgicaux', price: 1500, stock: 0, category: 'Protection', status: 'out_of_stock' }
  ])
  
  const [orders] = useState([
    {
      id: 'CMD001',
      customer: 'Marie Kofi',
      items: ['Paracétamol 500mg', 'Vitamine C'],
      total: 4700,
      status: 'pending',
      date: '2025-10-19',
      time: '14:30'
    },
    {
      id: 'CMD002', 
      customer: 'Jean Doe',
      items: ['Antiseptique'],
      total: 3300,
      status: 'completed',
      date: '2025-10-19',
      time: '12:15'
    }
  ])

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: ''
  })

  const [storeInfo] = useState({
    name: 'Pharmacie Actuelle',
    rating: 4.8,
    totalOrders: 156,
    revenue: 245000,
    activeProducts: products.filter(p => p.status === 'active').length
  })

  const addProduct = () => {
    if (newProduct.name && newProduct.price && newProduct.stock) {
      const product = {
        id: Date.now(),
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        status: 'active'
      }
      setProducts([...products, product])
      setNewProduct({ name: '', price: '', stock: '', category: '', description: '' })
    }
  }

  const updateProductStock = (productId, newStock) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, stock: newStock, status: newStock > 0 ? 'active' : 'out_of_stock' }
        : p
    ))
  }

  const renderDashboard = () => (
    <div style={{padding: '16px'}}>
      {/* Store Info */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
        color: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h1 style={{margin: '0 0 8px', fontSize: '24px'}}>{storeInfo.name}</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px'}}>
          <span>⭐ {storeInfo.rating}</span>
          <span>📦 {storeInfo.activeProducts} produits actifs</span>
          <span>💰 {storeInfo.revenue.toLocaleString()} F ce mois</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{fontSize: '24px', marginBottom: '8px'}}>📋</div>
          <div style={{fontSize: '20px', fontWeight: '600', color: '#1B5E20'}}>
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div style={{fontSize: '12px', color: '#757575'}}>Commandes en attente</div>
        </div>
        
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{fontSize: '24px', marginBottom: '8px'}}>📦</div>
          <div style={{fontSize: '20px', fontWeight: '600', color: '#1B5E20'}}>
            {products.filter(p => p.stock < 10).length}
          </div>
          <div style={{fontSize: '12px', color: '#757575'}}>Stock faible</div>
        </div>
        
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{fontSize: '24px', marginBottom: '8px'}}>💰</div>
          <div style={{fontSize: '20px', fontWeight: '600', color: '#1B5E20'}}>
            {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} F
          </div>
          <div style={{fontSize: '12px', color: '#757575'}}>Ventes aujourd'hui</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <h3 style={{margin: '0 0 16px', color: '#212121'}}>Commandes récentes</h3>
        {orders.slice(0, 3).map(order => (
          <div
            key={order.id}
            style={{
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{fontSize: '16px', fontWeight: '500', marginBottom: '4px'}}>
                {order.id} - {order.customer}
              </div>
              <div style={{fontSize: '14px', color: '#757575'}}>
                {order.items.join(', ')} • {order.date} à {order.time}
              </div>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={{fontSize: '16px', fontWeight: '600', color: '#1B5E20'}}>
                {order.total} F
              </div>
              <div style={{
                fontSize: '12px',
                color: order.status === 'pending' ? '#FF9800' : '#4CAF50',
                fontWeight: '500'
              }}>
                {order.status === 'pending' ? 'En attente' : 'Terminée'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProducts = () => (
    <div style={{padding: '16px'}}>
      {/* Add Product Form */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h3 style={{margin: '0 0 16px', color: '#212121'}}>Ajouter un produit</h3>
        
        <div style={{display: 'grid', gap: '12px', marginBottom: '16px'}}>
          <input
            type="text"
            placeholder="Nom du produit"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            style={{
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <input
              type="number"
              placeholder="Prix (F)"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              style={{
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            
            <input
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
              style={{
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>
          
          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            style={{
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="Médicaments">Médicaments</option>
            <option value="Vitamines">Vitamines</option>
            <option value="Soins">Soins</option>
            <option value="Protection">Protection</option>
          </select>
          
          <textarea
            placeholder="Description (optionnelle)"
            value={newProduct.description}
            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            style={{
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
        </div>
        
        <button
          onClick={addProduct}
          style={{
            background: '#1B5E20',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Ajouter le produit
        </button>
      </div>

      {/* Products List */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          background: '#f8f9fa'
        }}>
          <h3 style={{margin: 0, color: '#212121'}}>Mes produits ({products.length})</h3>
        </div>
        
        {products.map((product, index) => (
          <div
            key={product.id}
            style={{
              padding: '16px',
              borderBottom: index < products.length - 1 ? '1px solid #f0f0f0' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{flex: 1}}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <h4 style={{margin: 0, fontSize: '16px', color: '#212121'}}>
                  {product.name}
                </h4>
                <span style={{
                  fontSize: '12px',
                  color: 'white',
                  background: product.status === 'active' ? '#4CAF50' : '#F44336',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {product.status === 'active' ? 'Actif' : 'Rupture'}
                </span>
              </div>
              <div style={{fontSize: '14px', color: '#757575'}}>
                {product.category} • {product.price} F
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '18px', fontWeight: '600', color: '#1B5E20'}}>
                  {product.stock}
                </div>
                <div style={{fontSize: '12px', color: '#757575'}}>Stock</div>
              </div>
              
              <div style={{display: 'flex', gap: '4px'}}>
                <button
                  onClick={() => updateProductStock(product.id, Math.max(0, product.stock - 1))}
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
                <button
                  onClick={() => updateProductStock(product.id, product.stock + 1)}
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
          </div>
        ))}
      </div>
    </div>
  )

  const renderNavigation = () => (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e0e0e0',
      display: 'flex'
    }}>
      {[
        { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
        { id: 'products', label: 'Produits', icon: '📦' },
        { id: 'orders', label: 'Commandes', icon: '📋' },
        { id: 'analytics', label: 'Analytics', icon: '📈' }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setCurrentView(tab.id)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            padding: '12px 8px',
            textAlign: 'center',
            cursor: 'pointer',
            color: currentView === tab.id ? '#1B5E20' : '#757575'
          }}
        >
          <div style={{fontSize: '20px', marginBottom: '4px'}}>{tab.icon}</div>
          <div style={{fontSize: '12px', fontWeight: '500'}}>{tab.label}</div>
        </button>
      ))}
    </div>
  )

  return (
    <div style={{paddingBottom: '80px', background: '#f5f5f5', minHeight: '100vh'}}>
      {/* Header */}
      <div style={{
        background: '#1B5E20',
        color: 'white',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{margin: 0, fontSize: '20px'}}>Admin - {storeInfo.name}</h1>
      </div>

      {/* Content */}
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'products' && renderProducts()}
      {currentView === 'orders' && (
        <div style={{padding: '16px', textAlign: 'center', color: '#757575'}}>
          Interface de gestion des commandes à développer
        </div>
      )}
      {currentView === 'analytics' && (
        <div style={{padding: '16px', textAlign: 'center', color: '#757575'}}>
          Analytics et rapports à développer
        </div>
      )}

      {/* Navigation */}
      {renderNavigation()}
    </div>
  )
}

export default StoreAdminPanel