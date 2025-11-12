import React, { useState } from 'react'

export default function Marketplace(){
  const [referralCode, setReferralCode] = useState('AAJ1VT')
  const [promoCode, setPromoCode] = useState('')

  return (
    <div style={{padding: '16px'}}>
      <div style={{textAlign: 'center', marginBottom: '32px'}}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #E91E63, #9C27B0)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px'
          }}>
            👥
          </div>
        </div>
        <h2 style={{color: '#1B5E20', margin: '0 0 16px', fontSize: '20px'}}>Réductions</h2>
      </div>

      <div style={{background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '24px'}}>
        <h3 style={{margin: '0 0 8px', fontSize: '16px', fontWeight: '600'}}>Partager le code de parrainage</h3>
        <p style={{margin: '0 0 16px', fontSize: '14px', color: '#757575'}}>
          Partager le code de parrainage pour bénéficier de réductions sur vos courses
        </p>
        
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <div style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            background: '#F5F5F5',
            fontSize: '16px',
            fontWeight: '600',
            letterSpacing: '2px'
          }}>
            {referralCode}
          </div>
          <button style={{
            padding: '12px 20px',
            background: '#1B5E20',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Partager
          </button>
        </div>
      </div>

      <div style={{background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '24px'}}>
        <h3 style={{margin: '0 0 16px', fontSize: '16px', fontWeight: '600', textAlign: 'center'}}>Mon code Promo</h3>
        
        <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px'}}>
          <input
            type="text"
            placeholder="Code Promo"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
          <button style={{
            padding: '12px 20px',
            background: '#1B5E20',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Appliquer
          </button>
        </div>

        <h4 style={{margin: '16px 0 8px', fontSize: '14px', fontWeight: '600', textAlign: 'center'}}>
          Liste des code promos
        </h4>
      </div>
    </div>
  )
}
