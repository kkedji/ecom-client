import React, { useState, useEffect } from 'react'
import adminApiService from '../../services/adminApiService'

export default function PromoCodesManager() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [promoCodes, setPromoCodes] = useState([])

  useEffect(() => {
    loadPromoCodes()
  }, [])

  const loadPromoCodes = async () => {
    setLoading(true)
    try {
      const result = await adminApiService.getPromoCodes()
      if (result.success) {
        setPromoCodes(result.data.map(promo => ({
          id: promo.id,
          code: promo.code,
          type: promo.type,
          value: promo.value,
          status: promo.isActive ? 'active' : 'inactive',
          usageCount: promo.usageCount || 0,
          usageLimit: promo.usageLimit,
          expiryDate: new Date(promo.expiryDate).toLocaleDateString('fr-FR'),
          minAmount: promo.minAmount || 0,
          createdAt: new Date(promo.createdAt).toLocaleDateString('fr-FR')
        })))
      }
    } catch (error) {
      console.error('Erreur chargement codes promo:', error)
    } finally {
      setLoading(false)
    }
  }

  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'percentage',
    value: '',
    usageLimit: '',
    expiryDate: '',
    minAmount: ''
  })

  const handleCreatePromo = async (e) => {
    e.preventDefault()
    
    try {
      const result = await adminApiService.createPromoCode({
        code: newPromo.code.toUpperCase(),
        type: newPromo.type,
        value: parseFloat(newPromo.value),
        usageLimit: parseInt(newPromo.usageLimit) || null,
        expiryDate: newPromo.expiryDate,
        minAmount: parseFloat(newPromo.minAmount) || 0
      })

      if (result.success) {
        alert('✅ Code promo créé avec succès !')
        setShowCreateModal(false)
        setNewPromo({
          code: '',
          type: 'percentage',
          value: '',
          usageLimit: '',
          expiryDate: '',
          minAmount: ''
        })
        await loadPromoCodes()
      } else {
        alert('Erreur: ' + (result.error || 'Impossible de créer le code'))
      }
    } catch (error) {
      console.error('Erreur création code promo:', error)
      alert('Erreur lors de la création du code promo')
    }
  }

  const togglePromoStatus = async (id) => {
    try {
      const result = await adminApiService.togglePromoCode(id)
      if (result.success) {
        await loadPromoCodes()
      } else {
        alert('Erreur: ' + (result.error || 'Impossible de changer le statut'))
      }
    } catch (error) {
      console.error('Erreur toggle status:', error)
      alert('Erreur lors du changement de statut')
    }
  }

  const deletePromo = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      try {
        const result = await adminApiService.deletePromoCode(id)
        if (result.success) {
          alert('✅ Code promo supprimé')
          await loadPromoCodes()
        } else {
          alert('Erreur: ' + (result.error || 'Impossible de supprimer'))
        }
      } catch (error) {
        console.error('Erreur suppression:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: '16px', color: '#757575' }}>
          Chargement des codes promo...
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      {/* Header avec bouton créer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#212121' }}>
            Codes Promo
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#757575' }}>
            Gérez les codes promotionnels de la plateforme
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Créer un code
        </button>
      </div>

      {/* Statistiques rapides */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '16px',
        marginBottom: '20px',
        alignItems: 'start'
      }}>
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #4CAF50'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Codes actifs</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
              {promoCodes.filter(p => p.status === 'active').length}
            </span>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #2196F3'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Utilisations totales</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196F3' }}>
              {promoCodes.reduce((sum, p) => sum + p.usageCount, 0)}
            </span>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #F44336'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Codes inactifs</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#F44336' }}>
              {promoCodes.filter(p => p.status === 'inactive').length}
            </span>
          </div>
        </div>
      </div>

      {/* Liste des codes promo */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        width: '100%'
      }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1200px'
          }}>
            <thead>
              <tr style={{ background: '#F5F5F5', borderBottom: '2px solid #E0E0E0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#757575', textTransform: 'uppercase' }}>
                  Code
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#757575', textTransform: 'uppercase' }}>
                  Type
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#757575', textTransform: 'uppercase' }}>
                  Valeur
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#757575', textTransform: 'uppercase' }}>
                  Utilisations
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#757575', textTransform: 'uppercase' }}>
                  Statut
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#757575', textTransform: 'uppercase' }}>
                  Expiration
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#757575', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#757575' }}>
                      Aucun code promo créé
                    </p>
                  </td>
                </tr>
              ) : (
                promoCodes.map(promo => (
                  <tr
                    key={promo.id}
                    style={{ borderBottom: '1px solid #F0F0F0' }}
                  >
                    {/* Code */}
                    <td style={{ padding: '16px' }}>
                      <div style={{
                        fontWeight: '600',
                        fontSize: '15px',
                        color: '#212121',
                        fontFamily: 'monospace',
                        letterSpacing: '1px'
                      }}>
                        {promo.code}
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', color: '#757575' }}>
                        {promo.type === 'percentage' ? '% Remise' : 'Fixe'}
                      </div>
                    </td>

                    {/* Valeur */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#4CAF50' }}>
                        {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value} F`}
                      </div>
                    </td>

                    {/* Utilisations */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px' }}>
                        <span style={{ fontWeight: '600', color: '#212121' }}>{promo.usageCount}</span>
                        <span style={{ color: '#757575' }}> / {promo.usageLimit}</span>
                      </div>
                    </td>

                    {/* Statut */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: promo.status === 'active' ? '#E8F5E9' : '#FFEBEE',
                        color: promo.status === 'active' ? '#4CAF50' : '#F44336',
                        display: 'inline-block'
                      }}>
                        {promo.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>

                    {/* Expiration */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', color: '#757575' }}>
                        {promo.expiryDate}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => togglePromoStatus(promo.id)}
                          style={{
                            padding: '6px 12px',
                            background: promo.status === 'active' ? '#FFF3E0' : '#E8F5E9',
                            color: promo.status === 'active' ? '#F57C00' : '#4CAF50',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          title={promo.status === 'active' ? 'Désactiver' : 'Activer'}
                        >
                          {promo.status === 'active' ? '⏸' : '▶'}
                        </button>

                        <button
                          onClick={() => deletePromo(promo.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#FFEBEE',
                            color: '#F44336',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <>
          <div
            onClick={() => setShowCreateModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 2000
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            zIndex: 2001,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: '600', color: '#212121' }}>
              Créer un code promo
            </h2>

            <form onSubmit={handleCreatePromo}>
              {/* Code promo */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Code promo *</label>
                <input
                  type="text"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  placeholder="EXEMPLE2025"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '12px',
                    outline: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: '600',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Type de réduction */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Type de réduction *</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setNewPromo({ ...newPromo, type: 'percentage' })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: newPromo.type === 'percentage' ? '2px solid #4CAF50' : '2px solid #E0E0E0',
                      background: newPromo.type === 'percentage' ? '#E8F5E9' : 'white',
                      color: newPromo.type === 'percentage' ? '#4CAF50' : '#757575',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    % Pourcentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPromo({ ...newPromo, type: 'fixed' })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: newPromo.type === 'fixed' ? '2px solid #4CAF50' : '2px solid #E0E0E0',
                      background: newPromo.type === 'fixed' ? '#E8F5E9' : 'white',
                      color: newPromo.type === 'fixed' ? '#4CAF50' : '#757575',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Montant fixe
                  </button>
                </div>
              </div>

              {/* Valeur */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>
                  Valeur {newPromo.type === 'percentage' ? '(%)' : '(FCFA)'} *
                </label>
                <input
                  type="number"
                  value={newPromo.value}
                  onChange={(e) => setNewPromo({ ...newPromo, value: e.target.value })}
                  placeholder={newPromo.type === 'percentage' ? '10' : '5000'}
                  required
                  min="0"
                  max={newPromo.type === 'percentage' ? '100' : undefined}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Limite d'utilisation */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Limite d'utilisation *</label>
                <input
                  type="number"
                  value={newPromo.usageLimit}
                  onChange={(e) => setNewPromo({ ...newPromo, usageLimit: e.target.value })}
                  placeholder="100"
                  required
                  min="1"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Date d'expiration */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Date d'expiration *</label>
                <input
                  type="date"
                  value={newPromo.expiryDate}
                  onChange={(e) => setNewPromo({ ...newPromo, expiryDate: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Montant minimum */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Montant minimum (FCFA)</label>
                <input
                  type="number"
                  value={newPromo.minAmount}
                  onChange={(e) => setNewPromo({ ...newPromo, minAmount: e.target.value })}
                  placeholder="1000"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#F5F5F5',
                    color: '#757575',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}
                >
                  Créer le code
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
