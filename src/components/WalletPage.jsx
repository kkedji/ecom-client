import React, { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'
import { formatAmount } from '../utils/formatCurrency'

export default function WalletPage({ onClose }) {
  const { balance, transactions } = useWallet()
  const { user } = useAuth()
  const [showRechargeModal, setShowRechargeModal] = useState(false)

  const RechargeModal = () => {
    const [amount, setAmount] = useState('')
    const [selectedMethod, setSelectedMethod] = useState('mobile_money')
    const [loading, setLoading] = useState(false)

    const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000]

    const handleRecharge = async () => {
      if (!amount || amount < 100) {
        alert('Montant minimum : 100 FCFA')
        return
      }
      
      setLoading(true)
      // TODO: Appeler l'API de rechargement
      setTimeout(() => {
        alert(`Rechargement de ${amount} FCFA en cours via ${selectedMethod === 'mobile_money' ? 'Mobile Money' : 'Carte bancaire'}`)
        setLoading(false)
        setShowRechargeModal(false)
      }, 1500)
    }

    return (
      <>
        <div
          onClick={() => setShowRechargeModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2000,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: '24px 24px 0 0',
          padding: '24px',
          zIndex: 2001,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{
            width: '40px',
            height: '4px',
            background: '#E0E0E0',
            borderRadius: '2px',
            margin: '0 auto 24px'
          }}/>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#212121',
            margin: '0 0 8px'
          }}>Recharger le portefeuille</h2>
          
          <p style={{
            fontSize: '14px',
            color: '#757575',
            margin: '0 0 24px'
          }}>Choisissez le montant et le mode de paiement</p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#212121',
              marginBottom: '12px'
            }}>Montant rapide</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}>
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: amount === amt.toString() ? '2px solid #4CAF50' : '2px solid #E0E0E0',
                    background: amount === amt.toString() ? '#E8F5E9' : 'white',
                    color: amount === amt.toString() ? '#4CAF50' : '#212121',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {amt.toLocaleString()} F
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#212121',
              marginBottom: '8px'
            }}>Ou entrez un montant personnalisé</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Montant en FCFA"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                border: '2px solid #E0E0E0',
                borderRadius: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#212121',
              marginBottom: '12px'
            }}>Mode de paiement</label>
            
            <button
              onClick={() => setSelectedMethod('mobile_money')}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: selectedMethod === 'mobile_money' ? '2px solid #4CAF50' : '2px solid #E0E0E0',
                background: selectedMethod === 'mobile_money' ? '#E8F5E9' : 'white',
                marginBottom: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#FF9800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '4px'
                }}>Mobile Money</div>
                <div style={{ fontSize: '12px', color: '#757575' }}>
                  TMoney, Flooz
                </div>
              </div>
              {selectedMethod === 'mobile_money' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>

            <button
              onClick={() => setSelectedMethod('card')}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: selectedMethod === 'card' ? '2px solid #4CAF50' : '2px solid #E0E0E0',
                background: selectedMethod === 'card' ? '#E8F5E9' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#2196F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '4px'
                }}>Carte bancaire</div>
                <div style={{ fontSize: '12px', color: '#757575' }}>
                  Visa, Mastercard
                </div>
              </div>
              {selectedMethod === 'card' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => setShowRechargeModal(false)}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #E0E0E0',
                background: 'white',
                color: '#616161',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleRecharge}
              disabled={loading || !amount}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: loading || !amount ? '#BDBDBD' : '#4CAF50',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading || !amount ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              }}
            >
              {loading ? 'Chargement...' : 'Recharger'}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#F5F5F5',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: '16px',
        paddingTop: '40px',
        paddingBottom: '80px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '8px' }}>
            Solde disponible
          </div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '4px' }}>
            {formatAmount(balance)}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {user?.firstName} {user?.lastName}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '-40px',
        padding: '0 16px',
        paddingBottom: '100px'
      }}>
        <button
          onClick={() => setShowRechargeModal(true)}
          style={{
            width: '100%',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px',
            boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
          }}
        >
          <span style={{ fontSize: '20px' }}>+</span>
          Recharger le portefeuille
        </button>

        <button style={{
          width: '100%',
          background: 'white',
          border: 'none',
          borderRadius: '16px',
          padding: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#212121' }}>
            Historique des transactions
          </span>
        </button>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#212121',
            marginBottom: '16px',
            marginTop: 0
          }}>Dernières opérations</h3>

          {transactions && transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.slice(0, 5).map((transaction, index) => (
                <TransactionItem key={index} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#757575'
            }}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#BDBDBD"
                strokeWidth="1.5"
                style={{ margin: '0 auto 16px' }}
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <p style={{ margin: 0, fontSize: '14px' }}>
                Aucune transaction pour le moment
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modale de rechargement */}
      {showRechargeModal && <RechargeModal />}
    </div>
  )
}

function TransactionItem({ transaction }) {
  const isPositive = transaction.amount > 0
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #F5F5F5'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: isPositive ? '#E8F5E9' : '#FFEBEE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isPositive ? '#4CAF50' : '#F44336'}
            strokeWidth="2"
          >
            {isPositive ? (
              <path d="M12 19V5m-7 7l7-7 7 7"/>
            ) : (
              <path d="M12 5v14m7-7l-7 7-7-7"/>
            )}
          </svg>
        </div>
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#212121',
            marginBottom: '4px'
          }}>
            {transaction.description || (isPositive ? 'Recharge' : 'Dépense')}
          </div>
          <div style={{ fontSize: '12px', color: '#757575' }}>
            {new Date(transaction.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        color: isPositive ? '#4CAF50' : '#F44336'
      }}>
        {isPositive ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
      </div>
    </div>
  )
}