import React from 'react'

export default function Transport(){
  return (
    <div style={{padding: '16px'}}>
      <div style={{background: 'white', borderRadius: '8px', marginBottom: '16px'}}>
        <div style={{padding: '16px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span style={{fontSize: '16px', fontWeight: '500'}}>Mes courses</span>
        </div>
        
        <div style={{padding: '16px', display: 'flex', alignItems: 'center'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span style={{fontSize: '16px', fontWeight: '500'}}>Mes commandes</span>
        </div>
      </div>
    </div>
  )
}
