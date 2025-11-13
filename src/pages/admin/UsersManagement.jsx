import React, { useState, useEffect } from 'react'
import adminApiService from '../../services/adminApiService'

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all') // all, USER, ADMIN, SUPER_ADMIN
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (searchTerm) filters.search = searchTerm
      if (roleFilter !== 'all') filters.role = roleFilter
      if (statusFilter !== 'all') filters.status = statusFilter

      const result = await adminApiService.getUsersList(filters)
      if (result.success) {
        setUsers(result.data.map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          email: user.email || 'N/A',
          role: user.role,
          isAdmin: user.isAdmin,
          isActive: user.isActive,
          createdAt: new Date(user.createdAt).toLocaleDateString('fr-FR'),
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais',
          totalOrders: user.orderCount || 0,
          totalSpent: user.totalSpent || 0
        })))
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Recharger quand les filtres changent
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, roleFilter, statusFilter])

  const [selectedUser, setSelectedUser] = useState(null)
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [promotionRole, setPromotionRole] = useState('ADMIN')
  
  // État pour la gestion du portefeuille
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [walletAction, setWalletAction] = useState('credit') // 'credit' ou 'debit'
  const [walletAmount, setWalletAmount] = useState('')
  const [walletReason, setWalletReason] = useState('')
  const [walletLoading, setWalletLoading] = useState(false)

  const roleColors = {
    USER: { bg: '#E3F2FD', color: '#1976D2', label: 'Utilisateur' },
    ADMIN: { bg: '#FFF3E0', color: '#F57C00', label: 'Admin' },
    SUPER_ADMIN: { bg: '#E8F5E9', color: '#388E3C', label: 'Super Admin' }
  }

  const handleToggleStatus = async (userId) => {
    try {
      const result = await adminApiService.toggleUserStatus(userId)
      if (result.success) {
        const user = users.find(u => u.id === userId)
        alert(`✅ ${user.firstName} ${user.lastName} ${user.isActive ? 'désactivé' : 'activé'}`)
        await loadUsers()
      } else {
        alert('Erreur lors du changement de statut: ' + (result.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('Erreur toggle status:', error)
      alert('Erreur lors du changement de statut')
    }
  }

  const handlePromoteUser = async () => {
    if (!selectedUser) return

    try {
      const result = await adminApiService.promoteUser(
        selectedUser.id,
        promotionRole,
        promotionRole !== 'USER'
      )
      if (result.success) {
        alert(`✅ ${selectedUser.firstName} ${selectedUser.lastName} promu en ${roleColors[promotionRole].label}`)
        await loadUsers()
      } else {
        alert('Erreur lors de la promotion: ' + (result.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('Erreur promotion:', error)
      alert('Erreur lors de la promotion')
    } finally {
      setShowPromoteModal(false)
      setSelectedUser(null)
    }
  }

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId)
    
    if (user.role === 'SUPER_ADMIN') {
      alert('❌ Impossible de supprimer un SUPER_ADMIN')
      return
    }

    if (confirm(`⚠️ Êtes-vous sûr de vouloir supprimer ${user.firstName} ${user.lastName} ?\n\nCette action est irréversible.`)) {
      try {
        const result = await adminApiService.deleteUser(userId)
        if (result.success) {
          alert('✅ Utilisateur supprimé')
          await loadUsers()
        } else {
          alert('Erreur lors de la suppression: ' + (result.error || 'Erreur inconnue'))
        }
      } catch (error) {
        console.error('Erreur suppression:', error)
        alert('Erreur lors de la suppression')
      }
    }
  }

  const handleWalletAction = async () => {
    if (!selectedUser) return

    // Validation
    const amount = parseFloat(walletAmount)
    if (!amount || amount <= 0) {
      alert('❌ Veuillez entrer un montant valide')
      return
    }

    if (!walletReason.trim()) {
      alert('❌ Veuillez indiquer une raison')
      return
    }

    setWalletLoading(true)
    try {
      const endpoint = walletAction === 'credit' 
        ? 'creditUserBalance' 
        : 'debitUserBalance'

      const result = await adminApiService[endpoint](selectedUser.id, {
        amount: amount,
        reason: walletReason.trim()
      })

      if (result.success) {
        alert(`✅ Portefeuille ${walletAction === 'credit' ? 'crédité' : 'débité'} de ${amount.toLocaleString('fr-FR')} F\n\nNouveau solde: ${result.data.newBalance.toLocaleString('fr-FR')} F`)
        await loadUsers()
        setShowWalletModal(false)
        setWalletAmount('')
        setWalletReason('')
        setSelectedUser(null)
      } else {
        alert('❌ Erreur: ' + (result.error || result.message || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('Erreur gestion portefeuille:', error)
      alert('❌ Erreur lors de la gestion du portefeuille')
    } finally {
      setWalletLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchRole = roleFilter === 'all' || user.role === roleFilter
    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive)

    return matchSearch && matchRole && matchStatus
  })

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: '16px', color: '#757575' }}>
          Chargement des utilisateurs...
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      {/* Stats rapides */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        alignItems: 'start',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #2196F3'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Total Utilisateurs</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196F3' }}>{users.length}</span>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #4CAF50'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>
              Utilisateurs Actifs ({users.length > 0 ? ((users.filter(u => u.isActive).length / users.length) * 100).toFixed(1) : '0'}%)
            </span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>{users.filter(u => u.isActive).length}</span>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #FF9800'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Administrateurs</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>{users.filter(u => u.isAdmin).length}</span>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '12px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="🔍 Rechercher par nom, téléphone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '15px',
              border: '2px solid #E0E0E0',
              borderRadius: '10px',
              outline: 'none',
              width: '100%'
            }}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              border: '2px solid #E0E0E0',
              borderRadius: '10px',
              outline: 'none',
              cursor: 'pointer',
              background: 'white'
            }}
          >
            <option value="all">Tous les rôles</option>
            <option value="USER">Utilisateurs</option>
            <option value="ADMIN">Admins</option>
            <option value="SUPER_ADMIN">Super Admins</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              fontSize: '14px',
              border: '2px solid #E0E0E0',
              borderRadius: '10px',
              outline: 'none',
              cursor: 'pointer',
              background: 'white'
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Table des utilisateurs */}
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
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#424242' }}>
                  Utilisateur
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#424242' }}>
                  Contact
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#424242' }}>
                  Rôle
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#424242' }}>
                  Statut
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#424242' }}>
                  Commandes
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#424242' }}>
                  Dépenses
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#424242' }}>
                  Inscription
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#424242' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#757575' }}>
                      Aucun utilisateur trouvé
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: '#212121', marginBottom: '4px' }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#757575' }}>
                        ID: {user.id}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '14px', color: '#424242', marginBottom: '4px' }}>
                        {user.phoneNumber}
                      </div>
                      <div style={{ fontSize: '13px', color: '#757575' }}>
                        {user.email}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: roleColors[user.role].bg,
                        color: roleColors[user.role].color,
                        display: 'inline-block'
                      }}>
                        {roleColors[user.role].label}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: user.isActive ? '#E8F5E9' : '#FFEBEE',
                        color: user.isActive ? '#2E7D32' : '#C62828',
                        display: 'inline-block'
                      }}>
                        {user.isActive ? '✓ Actif' : '✗ Inactif'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#424242' }}>
                      {user.totalOrders}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#4CAF50' }}>
                      {user.totalSpent.toLocaleString('fr-FR')} F
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: '#757575' }}>
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {user.role !== 'SUPER_ADMIN' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setWalletAction('credit')
                                setWalletAmount('')
                                setWalletReason('')
                                setShowWalletModal(true)
                              }}
                              style={{
                                padding: '6px 12px',
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title="Gérer le portefeuille"
                            >
                              Portefeuille
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setPromotionRole(user.isAdmin ? 'USER' : 'ADMIN')
                                setShowPromoteModal(true)
                              }}
                              style={{
                                padding: '6px 12px',
                                background: '#FF9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title="Changer le rôle"
                            >
                              Rôle
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              style={{
                                padding: '6px 12px',
                                background: user.isActive ? '#F44336' : '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title={user.isActive ? 'Désactiver' : 'Activer'}
                            >
                              {user.isActive ? 'Désactiver' : 'Activer'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#9E9E9E',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title="Supprimer"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                        {user.role === 'SUPER_ADMIN' && (
                          <span style={{ fontSize: '12px', color: '#757575', fontStyle: 'italic' }}>
                            Protégé
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de gestion du portefeuille */}
      {showWalletModal && selectedUser && (
        <>
          <div
            onClick={() => !walletLoading && setShowWalletModal(false)}
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
            maxWidth: '500px',
            zIndex: 2001,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: '600', color: '#212121' }}>
              Gérer le Portefeuille
            </h2>

            <div style={{
              padding: '16px',
              background: '#F5F5F5',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                {selectedUser.firstName} {selectedUser.lastName}
              </div>
              <div style={{ fontSize: '14px', color: '#757575' }}>
                {selectedUser.phoneNumber}
              </div>
            </div>

            {/* Type d'action */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#212121',
                marginBottom: '12px'
              }}>Type d'opération</label>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setWalletAction('credit')}
                  disabled={walletLoading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: walletAction === 'credit' ? '2px solid #4CAF50' : '2px solid #E0E0E0',
                    borderRadius: '10px',
                    background: walletAction === 'credit' ? '#E8F5E9' : 'white',
                    color: walletAction === 'credit' ? '#2E7D32' : '#424242',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: walletLoading ? 'not-allowed' : 'pointer',
                    opacity: walletLoading ? 0.6 : 1
                  }}
                >
                  Créditer
                </button>
                <button
                  onClick={() => setWalletAction('debit')}
                  disabled={walletLoading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: walletAction === 'debit' ? '2px solid #F44336' : '2px solid #E0E0E0',
                    borderRadius: '10px',
                    background: walletAction === 'debit' ? '#FFEBEE' : 'white',
                    color: walletAction === 'debit' ? '#C62828' : '#424242',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: walletLoading ? 'not-allowed' : 'pointer',
                    opacity: walletLoading ? 0.6 : 1
                  }}
                >
                  Débiter
                </button>
              </div>
            </div>

            {/* Montant */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#212121',
                marginBottom: '8px'
              }}>
                Montant (F CFA)
              </label>
              <input
                type="number"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="Ex: 10000"
                disabled={walletLoading}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  border: '2px solid #E0E0E0',
                  borderRadius: '10px',
                  outline: 'none',
                  opacity: walletLoading ? 0.6 : 1
                }}
              />
            </div>

            {/* Raison */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#212121',
                marginBottom: '8px'
              }}>
                Raison / Motif
              </label>
              <textarea
                value={walletReason}
                onChange={(e) => setWalletReason(e.target.value)}
                placeholder="Ex: Ristourne commande #123, Bonus fidélité, Correction erreur..."
                disabled={walletLoading}
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  border: '2px solid #E0E0E0',
                  borderRadius: '10px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  opacity: walletLoading ? 0.6 : 1
                }}
              />
            </div>

            {/* Avertissement */}
            <div style={{
              padding: '12px',
              background: walletAction === 'credit' ? '#E8F5E9' : '#FFEBEE',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              color: walletAction === 'credit' ? '#2E7D32' : '#C62828'
            }}>
              {walletAction === 'credit' ? (
                <>
                  <strong>Crédit:</strong> Le montant sera ajouté au solde du portefeuille. Cette opération sera tracée dans les logs.
                </>
              ) : (
                <>
                  <strong>Débit:</strong> Le montant sera retiré du solde. Assurez-vous que le solde est suffisant. Cette opération est irréversible.
                </>
              )}
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowWalletModal(false)
                  setWalletAmount('')
                  setWalletReason('')
                  setSelectedUser(null)
                }}
                disabled={walletLoading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#E0E0E0',
                  color: '#424242',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: walletLoading ? 'not-allowed' : 'pointer',
                  opacity: walletLoading ? 0.6 : 1
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleWalletAction}
                disabled={walletLoading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: walletAction === 'credit' ? '#4CAF50' : '#F44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: walletLoading ? 'not-allowed' : 'pointer',
                  opacity: walletLoading ? 0.6 : 1,
                  boxShadow: walletLoading ? 'none' : (walletAction === 'credit' ? '0 4px 12px rgba(76, 175, 80, 0.3)' : '0 4px 12px rgba(244, 67, 54, 0.3)')
                }}
              >
                {walletLoading ? 'Traitement...' : (walletAction === 'credit' ? 'Créditer' : 'Débiter')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal de promotion */}
      {showPromoteModal && selectedUser && (
        <>
          <div
            onClick={() => setShowPromoteModal(false)}
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
            maxWidth: '500px',
            zIndex: 2001,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: '600', color: '#212121' }}>
              Modifier le rôle
            </h2>

            <div style={{
              padding: '16px',
              background: '#F5F5F5',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '4px' }}>
                {selectedUser.firstName} {selectedUser.lastName}
              </div>
              <div style={{ fontSize: '14px', color: '#757575' }}>
                Rôle actuel: {roleColors[selectedUser.role].label}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#212121',
                marginBottom: '12px'
              }}>Nouveau rôle</label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['USER', 'ADMIN', 'SUPER_ADMIN'].map(role => (
                  <button
                    key={role}
                    onClick={() => setPromotionRole(role)}
                    style={{
                      padding: '14px',
                      border: promotionRole === role ? `2px solid ${roleColors[role].color}` : '2px solid #E0E0E0',
                      borderRadius: '10px',
                      background: promotionRole === role ? `${roleColors[role].bg}` : 'white',
                      color: promotionRole === role ? roleColors[role].color : '#424242',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{roleColors[role].label}</span>
                    {promotionRole === role && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: '#FFF3E0',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#E65100'
            }}>
              ⚠️ <strong>Attention:</strong> Cette action modifiera les permissions de l'utilisateur.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowPromoteModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#E0E0E0',
                  color: '#424242',
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
                onClick={handlePromoteUser}
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
                Confirmer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
