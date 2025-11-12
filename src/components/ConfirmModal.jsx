import React from 'react'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmer', cancelText = 'Annuler', type = 'warning' }) {
  if (!isOpen) return null

  const colors = {
    warning: { bg: '#FFF3E0', icon: '#FF9800', button: '#FF9800' },
    danger: { bg: '#FFEBEE', icon: '#F44336', button: '#F44336' },
    info: { bg: '#E3F2FD', icon: '#2196F3', button: '#2196F3' }
  }

  const color = colors[type] || colors.warning

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        width: '90%',
        maxWidth: '400px',
        zIndex: 9999,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: color.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          {type === 'danger' && (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color.icon} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )}
          {type === 'warning' && (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color.icon} strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )}
          {type === 'info' && (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color.icon} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          )}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#212121',
          textAlign: 'center',
          margin: '0 0 12px'
        }}>
          {title}
        </h2>

        {/* Message */}
        <p style={{
          fontSize: '15px',
          color: '#757575',
          textAlign: 'center',
          lineHeight: '1.6',
          margin: '0 0 24px'
        }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #E0E0E0',
              borderRadius: '12px',
              background: 'white',
              color: '#616161',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              background: color.button,
              color: 'white',
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${color.button}40`,
              transition: 'all 0.2s'
            }}
          >
            {confirmText}
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
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  )
}
