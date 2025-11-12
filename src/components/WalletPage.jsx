import React from 'react'
import { useWallet } from '../context/WalletContext'
import { useAuth } from '../context/AuthContext'
import { formatAmount } from '../utils/formatCurrency'

export default function WalletPage({ onClose }) {
  const { balance, transactions } = useWallet()
  const { user } = useAuth()

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

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <button style={{
            background: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#212121' }}>
              Historique
            </span>
          </button>

          <button style={{
            background: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#212121' }}>
              Sécurisé
            </span>
          </button>
        </div>

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