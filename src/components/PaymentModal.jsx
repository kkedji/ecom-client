import React, { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { formatAmount } from '../utils/formatCurrency'

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  description, 
  category = 'general',
  onSuccess 
}) => {
  const { balance, processPayment } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulation d'une transaction
    setTimeout(() => {
      const result = processPayment(amount, description, category)
      
      if (result.success) {
        onSuccess && onSuccess(result.transaction)
        onClose()
      } else {
        alert(result.error)
      }
      
      setIsProcessing(false)
    }, 1500)
  }

  const canPay = balance >= amount

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#1B5E20', fontSize: '20px' }}>
            Confirmation de paiement
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#757575'
            }}
          >
            ×
          </button>
        </div>

        {/* Transaction Details */}
        <div style={{
          background: '#f5f5f5',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ color: '#757575' }}>Montant:</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#1B5E20' 
            }}>
              {formatAmount(amount)}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <span style={{ color: '#757575' }}>Description:</span>
            <span style={{ color: '#212121', textAlign: 'right', flex: 1, marginLeft: '8px' }}>
              {description}
            </span>
          </div>

          <div style={{
            borderTop: '1px solid #e0e0e0',
            paddingTop: '8px',
            marginTop: '8px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span style={{ color: '#757575' }}>Solde actuel:</span>
              <span style={{ color: '#212121' }}>{formatAmount(balance)}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#757575' }}>Solde après paiement:</span>
              <span style={{ 
                color: canPay ? '#4CAF50' : '#F44336',
                fontWeight: '600'
              }}>
                {canPay ? formatAmount(balance - amount) : 'Insuffisant'}
              </span>
            </div>
          </div>
        </div>

        {/* Warning for insufficient funds */}
        {!canPay && (
          <div style={{
            background: '#FFEBEE',
            border: '1px solid #F44336',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: '#F44336'
            }}>
              <span style={{ marginRight: '8px' }}>⚠️</span>
              <span style={{ fontSize: '14px' }}>
                Solde insuffisant. Veuillez recharger votre portefeuille.
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'transparent',
              border: '2px solid #1B5E20',
              color: '#1B5E20',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Annuler
          </button>
          
          <button
            onClick={handlePayment}
            disabled={!canPay || isProcessing}
            style={{
              flex: 1,
              background: canPay && !isProcessing ? '#1B5E20' : '#BDBDBD',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: canPay && !isProcessing ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isProcessing ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
                Traitement...
              </>
            ) : (
              'Payer maintenant'
            )}
          </button>
        </div>

        {/* Recharge option for insufficient funds */}
        {!canPay && (
          <div style={{
            textAlign: 'center',
            marginTop: '16px'
          }}>
            <button
              onClick={() => {
                onClose()
                // Ici on pourrait ouvrir directement la page de rechargement
                window.dispatchEvent(new CustomEvent('openWallet', { detail: { view: 'recharge' } }))
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1B5E20',
                fontSize: '14px',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Recharger le portefeuille
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default PaymentModal