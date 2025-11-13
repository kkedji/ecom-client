import React, { useState, useEffect } from 'react'
import adminApiService from '../../services/adminApiService'

export default function EcoHabitsValidator() {
  const [filter, setFilter] = useState('pending') // pending, validated, rejected
  const [loading, setLoading] = useState(true)
  const [habitsList, setHabitsList] = useState([])
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [validationComment, setValidationComment] = useState('')
  const [co2Saved, setCo2Saved] = useState('')

  useEffect(() => {
    loadHabits()
  }, [filter])

  const loadHabits = async () => {
    setLoading(true)
    try {
      const result = filter === 'pending' 
        ? await adminApiService.getPendingEcoHabits()
        : await adminApiService.getAllEcoHabits(filter)

      if (result.success) {
        setHabitsList(result.data.map(habit => ({
          id: habit.id,
          userId: habit.userId,
          userName: `${habit.user?.firstName || ''} ${habit.user?.lastName || ''}`.trim() || 'Utilisateur',
          title: habit.title,
          description: habit.description,
          category: habit.category,
          impact: habit.estimatedImpact || 0,
          frequency: habit.frequency,
          proofs: habit.proofUrls || [],
          status: habit.status,
          createdAt: new Date(habit.createdAt).toLocaleDateString('fr-FR'),
          validatedAt: habit.validatedAt ? new Date(habit.validatedAt).toLocaleDateString('fr-FR') : null,
          adminComment: habit.adminComment || ''
        })))
      }
    } catch (error) {
      console.error('Erreur chargement habitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = {
    transport: { label: '🚴 Transport', color: '#4CAF50' },
    energy: { label: '⚡ Énergie', color: '#FF9800' },
    food: { label: '🥗 Alimentation', color: '#8BC34A' },
    waste: { label: '♻️ Déchets', color: '#00BCD4' },
    water: { label: '💧 Eau', color: '#2196F3' },
    other: { label: '🌍 Autre', color: '#9C27B0' }
  }

  const handleValidate = async (habitId, approved) => {
    if (approved && !co2Saved) {
      alert('Veuillez entrer le CO₂ économisé')
      return
    }

    try {
      const result = approved
        ? await adminApiService.validateEcoHabit(habitId, parseFloat(co2Saved), validationComment)
        : await adminApiService.rejectEcoHabit(habitId, validationComment)

      if (result.success) {
        const credits = approved ? parseFloat(co2Saved) * 62 : 0
        alert(
          approved 
            ? `✅ Habitude validée ! ${credits.toLocaleString('fr-FR')} FCFA de crédits accordés.`
            : '❌ Habitude rejetée.'
        )
        setSelectedHabit(null)
        setValidationComment('')
        setCo2Saved('')
        await loadHabits()
      } else {
        alert('Erreur: ' + (result.error || 'Impossible de valider'))
      }
    } catch (error) {
      console.error('Erreur validation:', error)
      alert('Erreur lors de la validation')
    }

    // TODO: Appeler l'API backend
    // await apiService.post(`/api/admin/eco-habits/${habitId}/validate`, {
    //   approved,
    //   comment: validationComment,
    //   credits
    // })
  }

  const filteredHabits = habitsList.filter(h => h.status === filter)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: '16px', color: '#757575' }}>
          Chargement des éco-habitudes...
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 'none' }}>
      {/* Stats rapides */}
      <div style={{
        display: 'grid',
        alignItems: 'start',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #FF9800'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>En attente</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>
              {habitsList.filter(h => h.status === 'pending').length}
            </span>
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
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Validées</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>
              {habitsList.filter(h => h.status === 'validated').length}
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
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1E293B' }}>Rejetées</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#F44336' }}>
              {habitsList.filter(h => h.status === 'rejected').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {[
          { value: 'pending', label: 'En attente', color: '#FF9800' },
          { value: 'validated', label: 'Validées', color: '#4CAF50' },
          { value: 'rejected', label: 'Rejetées', color: '#F44336' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              border: filter === tab.value ? `2px solid ${tab.color}` : '2px solid transparent',
              background: filter === tab.value ? `${tab.color}15` : '#F5F5F5',
              color: filter === tab.value ? tab.color : '#757575',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Liste des habitudes */}
      <div style={{
        display: 'grid',
        gap: '16px'
      }}>
        {filteredHabits.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <p style={{ fontSize: '16px', color: '#757575' }}>
              Aucune habitude {filter === 'pending' ? 'en attente' : filter === 'validated' ? 'validée' : 'rejetée'}
            </p>
          </div>
        ) : (
          filteredHabits.map(habit => (
            <div
              key={habit.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${categories[habit.category]?.color || '#9E9E9E'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#212121' }}>
                      {habit.title}
                    </h3>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: `${categories[habit.category]?.color}20`,
                      color: categories[habit.category]?.color
                    }}>
                      {categories[habit.category]?.label}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', color: '#757575', marginBottom: '4px' }}>
                    Par <strong>{habit.userName}</strong> • {new Date(habit.createdAt).toLocaleDateString('fr-FR')}
                  </div>

                  {habit.impact && (
                    <div style={{ fontSize: '14px', color: '#4CAF50', fontWeight: '600' }}>
                      Impact estimé: {habit.impact} kg CO₂/mois • {(habit.impact * 62).toLocaleString('fr-FR')} FCFA potentiel
                    </div>
                  )}
                </div>

                {habit.status === 'pending' && (
                  <button
                    onClick={() => setSelectedHabit(habit)}
                    style={{
                      padding: '10px 20px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Examiner
                  </button>
                )}
              </div>

              <p style={{ margin: '0 0 16px', fontSize: '15px', color: '#424242', lineHeight: '1.6' }}>
                {habit.description}
              </p>

              {/* Preuves */}
              {habit.proofs.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#757575', marginBottom: '8px' }}>
                    Preuves ({habit.proofs.length})
                  </div>
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {habit.proofs.map((proof, index) => (
                      <img
                        key={index}
                        src={proof}
                        alt={`Preuve ${index + 1}`}
                        style={{
                          width: '120px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: '2px solid #E0E0E0'
                        }}
                        onClick={() => window.open(proof, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Commentaire admin si validé/rejeté */}
              {habit.adminComment && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: habit.status === 'validated' ? '#E8F5E9' : '#FFEBEE',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: habit.status === 'validated' ? '#2E7D32' : '#C62828'
                }}>
                  <strong>Commentaire admin:</strong> {habit.adminComment}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de validation */}
      {selectedHabit && (
        <>
          <div
            onClick={() => setSelectedHabit(null)}
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
            zIndex: 2001,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: '600', color: '#212121' }}>
              Validation de l'habitude
            </h2>

            <div style={{
              padding: '16px',
              background: '#F5F5F5',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#212121', marginBottom: '8px' }}>
                {selectedHabit.title}
              </div>
              <div style={{ fontSize: '14px', color: '#757575', marginBottom: '8px' }}>
                Impact estimé: {selectedHabit.impact} kg CO₂
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#212121',
                marginBottom: '8px'
              }}>CO₂ économisé (kg) *</label>
              <input
                type="number"
                value={co2Saved}
                onChange={(e) => setCo2Saved(e.target.value)}
                placeholder="Ex: 15.5"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: '2px solid #E0E0E0',
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {co2Saved && (
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#4CAF50', marginTop: '8px' }}>
                  Crédits: {(parseFloat(co2Saved) * 62).toLocaleString('fr-FR')} FCFA
                </div>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#212121',
                marginBottom: '8px'
              }}>Commentaire (optionnel)</label>
              <textarea
                value={validationComment}
                onChange={(e) => setValidationComment(e.target.value)}
                placeholder="Ajoutez un commentaire pour l'utilisateur..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: '2px solid #E0E0E0',
                  borderRadius: '12px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleValidate(selectedHabit.id, false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#F44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>❌</span> Rejeter
              </button>
              <button
                onClick={() => handleValidate(selectedHabit.id, true)}
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
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>✅</span> Valider
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
