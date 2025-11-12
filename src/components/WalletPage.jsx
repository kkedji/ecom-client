import React, { useState } from 'react'
import { formatAmount, formatCurrency } from '../utils/formatCurrency'

const WalletPage = ({ onClose }) => {
  const [currentView, setCurrentView] = useState('main') // main, recharge, history
  const [balance] = useState(0)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [rechargeMethod, setRechargeMethod] = useState('')
  const [rechargeAmount, setRechargeAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })

  const transactions = [
    { id: 1, type: 'debit', amount: 2500, description: 'Course Taxi - Tokoin à Adidogomé', date: '2025-10-19', time: '14:30' },
    { id: 2, type: 'credit', amount: 10000, description: 'Rechargement Mobile Money', date: '2025-10-18', time: '09:15' },
    { id: 3, type: 'debit', amount: 1800, description: 'Achat Shop - Pharmacie Actuelle', date: '2025-10-18', time: '16:45' },
    { id: 4, type: 'debit', amount: 3200, description: 'Livraison - Restaurant Le Palmier', date: '2025-10-17', time: '19:20' }
  ]

  const paymentMethods = [
    {
      id: 'yas',
      name: 'YAS Mobile Money',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>,
      color: '#FF6B35',
      description: 'Rechargement via YAS'
    },
    {
      id: 'flooz',
      name: 'FLOOZ Mobile Money', 
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>,
      color: '#00A651',
      description: 'Rechargement via FLOOZ'
    },
    {
      id: 'visa',
      name: 'Carte Visa/Mastercard',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>,
      color: '#1A1F71',
      description: 'Paiement par carte bancaire'
    },
    {
      id: 'pispi',
      name: 'PI-SPI BCEAO',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>,
      color: '#2E7D32',
      description: 'Plateforme Interopérable BCEAO'
    }
  ]

  const renderMainView = () => (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)', color: 'white'}}>
      {/* Header */}
      <div style={{
        padding: '20px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ←
        </button>
        <h1 style={{margin: 0, fontSize: '20px'}}>Portefeuille</h1>
        <div style={{width: '24px'}}></div>
      </div>

      {/* Balance Display */}
      <div style={{
        textAlign: 'center',
        padding: '20px 16px 40px'
      }}>
        <h2 style={{
          margin: '0 0 20px',
          fontSize: '36px',
          fontWeight: '300'
        }}>
          {formatAmount(balance)}
        </h2>
      </div>

      {/* Recharge Button */}
      <div style={{
        padding: '0 16px 40px'
      }}>
        <button
          onClick={() => setCurrentView('recharge')}
          style={{
            width: '100%',
            background: 'white',
            color: '#1B5E20',
            border: 'none',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            background: '#1B5E20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px',
            fontSize: '24px',
            color: 'white'
          }}>
            +
          </div>
          Recharger votre portefeuille
        </button>
      </div>

      {/* Period Selector */}
      <div style={{
        background: 'white',
        borderRadius: '24px 24px 0 0',
        minHeight: '400px',
        padding: '24px 16px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setCurrentView('history')}
            style={{
              background: '#1B5E20',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Sélectionner la période
          </button>
        </div>

        {/* Date Range */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          color: '#212121'
        }}>
          <div>
            <div style={{fontSize: '18px', fontWeight: '600'}}>Du</div>
            <div style={{fontSize: '16px', color: '#757575'}}>sam. 18 oct. 2025</div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '18px', fontWeight: '600'}}>Au</div>
            <div style={{fontSize: '16px', color: '#757575'}}>dim. 19 oct. 2025</div>
          </div>
        </div>

        {/* Refresh Button */}
        <div style={{
          textAlign: 'right',
          marginBottom: '24px'
        }}>
          <button style={{
            background: 'transparent',
            border: 'none',
            color: '#1B5E20',
            fontSize: '24px',
            cursor: 'pointer'
          }}>
            ↻
          </button>
        </div>

        {/* Recent Transactions Preview */}
        <div>
          <h3 style={{color: '#212121', marginBottom: '16px'}}>Transactions récentes</h3>
          {transactions.slice(0, 3).map(transaction => (
            <div key={transaction.id} style={{
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{fontSize: '14px', fontWeight: '500', color: '#212121'}}>
                  {transaction.description}
                </div>
                <div style={{fontSize: '12px', color: '#757575'}}>
                  {transaction.date} à {transaction.time}
                </div>
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: transaction.type === 'credit' ? '#4CAF50' : '#F44336'
              }}>
                {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderRechargeView = () => (
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
          onClick={() => setCurrentView('main')}
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
        <h1 style={{margin: 0, fontSize: '18px'}}>Recharger votre portefeuille</h1>
      </div>

      <div style={{padding: '24px 16px'}}>
        {/* Instructions */}
        <p style={{
          textAlign: 'center',
          color: '#1B5E20',
          fontSize: '16px',
          lineHeight: '1.5',
          marginBottom: '32px'
        }}>
          Suivez ces étapes pour recharger votre argent virtuel en fonction de votre opérateur de services financiers.
        </p>

        {/* Amount Input */}
        <div style={{marginBottom: '24px'}}>
          <input
            type="number"
            placeholder="Montant"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              fontSize: '16px',
              background: 'white'
            }}
          />
        </div>

        {/* Payment Methods */}
        <div style={{marginBottom: '24px'}}>
          {paymentMethods.map(method => (
            <div
              key={method.id}
              onClick={() => setRechargeMethod(method.id)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                border: rechargeMethod === method.id ? `2px solid ${method.color}` : '2px solid #e0e0e0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '25px',
                background: method.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                fontSize: '20px',
                color: 'white'
              }}>
                {method.icon}
              </div>
              <div>
                <div style={{fontSize: '16px', fontWeight: '600', color: '#212121'}}>
                  {method.name}
                </div>
                <div style={{fontSize: '14px', color: '#757575'}}>
                  {method.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Phone Number Input (for mobile money) */}
        {(rechargeMethod === 'yas' || rechargeMethod === 'flooz') && (
          <div style={{marginBottom: '24px'}}>
            <div style={{
              display: 'flex',
              background: 'white',
              borderRadius: '12px',
              border: '2px solid #e0e0e0',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                background: '#f5f5f5',
                borderRight: '1px solid #e0e0e0'
              }}>
                <span style={{marginRight: '8px'}}>🇹🇬</span>
                <span>+228</span>
              </div>
              <input
                type="tel"
                placeholder="Numéro de téléphone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: 'none',
                  fontSize: '16px',
                  background: 'white'
                }}
              />
            </div>
            <div style={{
              textAlign: 'right',
              fontSize: '12px',
              color: '#757575',
              marginTop: '4px'
            }}>
              0/8
            </div>
          </div>
        )}

        {/* Card Details (for Visa) */}
        {rechargeMethod === 'visa' && (
          <div style={{marginBottom: '24px'}}>
            <input
              type="text"
              placeholder="Numéro de carte"
              value={cardDetails.number}
              onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'white',
                marginBottom: '12px'
              }}
            />
            <div style={{display: 'flex', gap: '12px', marginBottom: '12px'}}>
              <input
                type="text"
                placeholder="MM/AA"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: 'white'
                }}
              />
              <input
                type="text"
                placeholder="CVV"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: 'white'
                }}
              />
            </div>
            <input
              type="text"
              placeholder="Nom sur la carte"
              value={cardDetails.name}
              onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'white'
              }}
            />
          </div>
        )}

        {/* PI-SPI Instructions */}
        {rechargeMethod === 'pispi' && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            border: '2px solid #e0e0e0'
          }}>
            <div style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#2E7D32'}}>
              Instructions PI-SPI BCEAO
            </div>
            <div style={{fontSize: '14px', color: '#757575', lineHeight: '1.5'}}>
              Vous serez redirigé vers la plateforme sécurisée de la BCEAO pour effectuer votre paiement via le système interbancaire.
            </div>
          </div>
        )}

        {/* Provider Selector (for mobile money) */}
        {(rechargeMethod === 'yas' || rechargeMethod === 'flooz') && (
          <div style={{marginBottom: '24px'}}>
            <select
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: '16px',
                background: 'white'
              }}
            >
              <option>Choisir le fournisseur</option>
              {rechargeMethod === 'yas' && <option>YAS Mobile Money</option>}
              {rechargeMethod === 'flooz' && <option>FLOOZ Moov Money</option>}
            </select>
          </div>
        )}

        {/* Recharge Button */}
        <button
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
          Recharger
        </button>
      </div>
    </div>
  )

  const renderHistoryView = () => (
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
          onClick={() => setCurrentView('main')}
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
        <h1 style={{margin: 0, fontSize: '18px'}}>Historique des transactions</h1>
      </div>

      <div style={{padding: '16px'}}>
        {/* Period Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          overflowX: 'auto'
        }}>
          {[
            {id: 'today', label: 'Aujourd\'hui'},
            {id: 'week', label: 'Cette semaine'},
            {id: 'month', label: 'Ce mois'},
            {id: 'custom', label: 'Personnalisé'}
          ].map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              style={{
                background: selectedPeriod === period.id ? '#1B5E20' : 'white',
                color: selectedPeriod === period.id ? 'white' : '#1B5E20',
                border: selectedPeriod === period.id ? 'none' : '2px solid #1B5E20',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {transactions.map((transaction, index) => (
            <div
              key={transaction.id}
              style={{
                padding: '16px',
                borderBottom: index < transactions.length - 1 ? '1px solid #f0f0f0' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{flex: 1}}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#212121',
                  marginBottom: '4px'
                }}>
                  {transaction.description}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#757575'
                }}>
                  {transaction.date} à {transaction.time}
                </div>
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: transaction.type === 'credit' ? '#4CAF50' : '#F44336'
              }}>
                {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginTop: '16px'
        }}>
          <h3 style={{margin: '0 0 16px', color: '#212121'}}>Résumé de la période</h3>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span style={{color: '#757575'}}>Total des recharges:</span>
            <span style={{color: '#4CAF50', fontWeight: '600'}}>+10,000 F</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span style={{color: '#757575'}}>Total des dépenses:</span>
            <span style={{color: '#F44336', fontWeight: '600'}}>-7,500 F</span>
          </div>
          <div style={{borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '8px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <span style={{color: '#212121', fontWeight: '600'}}>Solde actuel:</span>
              <span style={{color: '#1B5E20', fontWeight: '600', fontSize: '18px'}}>2,500 F</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  switch(currentView) {
    case 'recharge':
      return renderRechargeView()
    case 'history':
      return renderHistoryView()
    default:
      return renderMainView()
  }
}

export default WalletPage