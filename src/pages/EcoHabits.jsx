import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import apiService from '../services/apiService'

export default function EcoHabits() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('declare') // declare, profile, credits
  const [loading, setLoading] = useState(false)
  const [habitForm, setHabitForm] = useState({
    title: '',
    description: '',
    category: 'transport',
    impact: '',
    frequency: 'daily',
    proofs: []
  })
  const [habits, setHabits] = useState([])
  const [carbonProfile, setCarbonProfile] = useState({
    totalEmissions: 0,
    savedEmissions: 0,
    credits: 0,
    validatedHabits: 0,
    pendingValidation: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger le profil carbone
      const profileResult = await apiService.getCarbonProfile()
      if (profileResult.success) {
        setCarbonProfile(profileResult.data)
      }

      // Charger les habitudes
      const habitsResult = await apiService.getEcoHabits()
      if (habitsResult.success) {
        setHabits(habitsResult.data || [])
      }
    } catch (error) {
      console.error('Erreur chargement données éco-habitudes:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'transport', label: '🚴 Transport', color: '#4CAF50' },
    { value: 'energy', label: '⚡ Énergie', color: '#FF9800' },
    { value: 'food', label: '🥗 Alimentation', color: '#8BC34A' },
    { value: 'waste', label: '♻️ Déchets', color: '#00BCD4' },
    { value: 'water', label: '💧 Eau', color: '#2196F3' },
    { value: 'other', label: '🌍 Autre', color: '#9C27B0' }
  ]

  const handleProofUpload = (event) => {
    const files = Array.from(event.target.files)
    const proofUrls = files.map(file => URL.createObjectURL(file))
    setHabitForm({ ...habitForm, proofs: [...habitForm.proofs, ...proofUrls] })
  }

  const removeProof = (index) => {
    const newProofs = habitForm.proofs.filter((_, i) => i !== index)
    setHabitForm({ ...habitForm, proofs: newProofs })
  }

  const handleSubmitHabit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await apiService.submitEcoHabit(habitForm)
      if (result.success) {
        alert('✅ Habitude enregistrée ! Elle sera validée sous 48-72h.')
        setHabitForm({
          title: '',
          description: '',
          category: 'transport',
          impact: '',
          frequency: 'daily',
          proofs: []
        })
        // Recharger les données
        await loadData()
      } else {
        alert(`❌ Erreur : ${result.error}`)
      }
    } catch (error) {
      console.error('Erreur soumission habitude:', error)
      alert('❌ Erreur lors de l\'enregistrement de l\'habitude')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', paddingBottom: '80px', padding: '16px' }}>
      {/* Header Card */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#212121' }}>
          Éco-habitudes
        </h1>
      </div>

      {/* Stats Cards */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{
            background: '#E8F5E9',
            borderRadius: '12px',
            padding: '16px',
            border: '2px solid #4CAF50'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2E7D32' }}>
              {carbonProfile.savedEmissions} kg
            </div>
            <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '4px' }}>
              CO₂ évité
            </div>
          </div>
          <div style={{
            background: '#E3F2FD',
            borderRadius: '12px',
            padding: '16px',
            border: '2px solid #2196F3'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1565C0' }}>
              {carbonProfile.credits.toLocaleString('fr-FR')} F
            </div>
            <div style={{ fontSize: '12px', color: '#2196F3', marginTop: '4px' }}>
              Crédits carbone
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '16px',
        display: 'flex',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'declare', label: 'Déclarer', icon: '📝' },
          { id: 'profile', label: 'Mon Profil', icon: '📊' },
          { id: 'credits', label: 'Crédits', icon: '💰' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '10px',
              border: activeTab === tab.id ? '2px solid #4CAF50' : '2px solid transparent',
              background: activeTab === tab.id ? '#E8F5E9' : '#F5F5F5',
              color: activeTab === tab.id ? '#4CAF50' : '#757575',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ padding: '16px' }}>
        {/* TAB: Déclarer une habitude */}
        {activeTab === 'declare' && (
          <div>
            <div style={{
              background: '#E3F2FD',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              borderLeft: '4px solid #2196F3'
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#1976D2' }}>
                💡 Comment ça marche ?
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#1565C0', lineHeight: '1.6' }}>
                Décrivez vos actions éco-responsables, ajoutez des preuves (photos, factures) et gagnez des crédits carbone validés.
              </p>
            </div>

            <form onSubmit={handleSubmitHabit} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#212121' }}>
                Nouvelle habitude éco-responsable
              </h2>

              {/* Titre */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Titre de l'habitude *</label>
                <input
                  type="text"
                  value={habitForm.title}
                  onChange={(e) => setHabitForm({ ...habitForm, title: e.target.value })}
                  placeholder="Ex: Vélo pour aller au travail"
                  required
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

              {/* Catégorie */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Catégorie *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setHabitForm({ ...habitForm, category: cat.value })}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: habitForm.category === cat.value ? `2px solid ${cat.color}` : '2px solid #E0E0E0',
                        background: habitForm.category === cat.value ? `${cat.color}15` : 'white',
                        color: habitForm.category === cat.value ? cat.color : '#757575',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Description détaillée *</label>
                <textarea
                  value={habitForm.description}
                  onChange={(e) => setHabitForm({ ...habitForm, description: e.target.value })}
                  placeholder="Décrivez votre effort écologique en détail..."
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Impact estimé */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Impact CO₂ estimé (kg/mois)</label>
                <input
                  type="number"
                  value={habitForm.impact}
                  onChange={(e) => setHabitForm({ ...habitForm, impact: e.target.value })}
                  placeholder="Ex: 15"
                  step="0.1"
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

              {/* Fréquence */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Fréquence *</label>
                <select
                  value={habitForm.frequency}
                  onChange={(e) => setHabitForm({ ...habitForm, frequency: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: 'white'
                  }}
                >
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                  <option value="occasional">Occasionnelle</option>
                </select>
              </div>

              {/* Upload Preuves */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#212121',
                  marginBottom: '8px'
                }}>Preuves (photos, factures, etc.)</label>
                
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleProofUpload}
                  style={{ display: 'none' }}
                  id="proof-upload"
                />
                
                <label
                  htmlFor="proof-upload"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px',
                    border: '2px dashed #4CAF50',
                    borderRadius: '12px',
                    background: '#F1F8F4',
                    cursor: 'pointer',
                    color: '#4CAF50',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Ajouter des preuves
                </label>

                {/* Preview des preuves */}
                {habitForm.proofs.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginTop: '12px'
                  }}>
                    {habitForm.proofs.map((proof, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={proof}
                          alt={`Preuve ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeProof(index)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#F44336',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#4CAF50',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                }}
              >
                Soumettre pour validation
              </button>
            </form>

            {/* Liste des habitudes déclarées */}
            {habits.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#212121', marginBottom: '16px' }}>
                  Mes déclarations
                </h3>
                {habits.map(habit => (
                  <div key={habit.id} style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#212121' }}>
                        {habit.title}
                      </h4>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: habit.status === 'validated' ? '#E8F5E9' : '#FFF3E0',
                        color: habit.status === 'validated' ? '#4CAF50' : '#FF9800',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {habit.status === 'validated' ? '✓ Validé' : '⏳ En attente'}
                      </span>
                    </div>
                    <p style={{ margin: '8px 0', fontSize: '14px', color: '#757575', lineHeight: '1.5' }}>
                      {habit.description}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#9E9E9E', marginTop: '8px' }}>
                      <span>{categories.find(c => c.value === habit.category)?.label}</span>
                      <span>•</span>
                      <span>{new Date(habit.date).toLocaleDateString('fr-FR')}</span>
                      {habit.proofs.length > 0 && (
                        <>
                          <span>•</span>
                          <span>📎 {habit.proofs.length} preuve(s)</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Mon Profil Carbone */}
        {activeTab === 'profile' && (
          <div>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#212121' }}>
                📊 Mon Profil Carbone
              </h2>

              {/* Statistiques */}
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{
                  padding: '16px',
                  background: '#E8F5E9',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#2E7D32', marginBottom: '4px' }}>
                      CO₂ évité ce mois
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1B5E20' }}>
                      {carbonProfile.savedEmissions} kg
                    </div>
                  </div>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                  }}>
                    🌱
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{
                    padding: '16px',
                    background: '#FFF3E0',
                    borderRadius: '12px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#F57C00', marginBottom: '4px' }}>
                      Habitudes validées
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#E65100' }}>
                      {carbonProfile.validatedHabits}
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    background: '#E3F2FD',
                    borderRadius: '12px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#1976D2', marginBottom: '4px' }}>
                      En validation
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0D47A1' }}>
                      {carbonProfile.pendingValidation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphique simplifié */}
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#212121', marginBottom: '12px' }}>
                  Évolution mensuelle
                </h3>
                <div style={{
                  height: '160px',
                  background: '#F5F5F5',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  padding: '16px'
                }}>
                  {[40, 65, 55, 80, 90, 125.5].map((value, index) => (
                    <div key={index} style={{
                      flex: 1,
                      background: index === 5 ? '#4CAF50' : '#C8E6C9',
                      height: `${(value / 140) * 100}%`,
                      borderRadius: '4px',
                      position: 'relative'
                    }}>
                      {index === 5 && (
                        <div style={{
                          position: 'absolute',
                          top: '-24px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#4CAF50',
                          whiteSpace: 'nowrap'
                        }}>
                          {value}kg
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  fontSize: '11px',
                  color: '#9E9E9E'
                }}>
                  <span>J-5</span>
                  <span>J-4</span>
                  <span>J-3</span>
                  <span>J-2</span>
                  <span>Hier</span>
                  <span style={{ fontWeight: '600', color: '#4CAF50' }}>Aujourd'hui</span>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#212121' }}>
                💡 Recommandations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: '🚴', text: 'Utilisez le vélo 2x/semaine de plus', impact: '+8 kg CO₂/mois' },
                  { icon: '🌱', text: 'Passez à 3 repas végétariens/semaine', impact: '+12 kg CO₂/mois' },
                  { icon: '💡', text: 'Éteignez les appareils en veille', impact: '+5 kg CO₂/mois' }
                ].map((rec, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#F5F5F5',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '24px' }}>{rec.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', color: '#212121', marginBottom: '2px' }}>
                        {rec.text}
                      </div>
                      <div style={{ fontSize: '12px', color: '#4CAF50', fontWeight: '600' }}>
                        {rec.impact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Crédits Carbone */}
        {activeTab === 'credits' && (
          <div>
            {/* Solde des crédits */}
            <div style={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              color: 'white',
              boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)'
            }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                Solde total de crédits carbone
              </div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '16px' }}>
                {carbonProfile.credits.toLocaleString('fr-FR')} FCFA
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'white',
                  color: '#4CAF50',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  💸 Vendre
                </button>
                <button style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid white',
                  background: 'transparent',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  📊 Historique
                </button>
              </div>
            </div>

            {/* Comment ça marche */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#212121' }}>
                💰 Comment fonctionnent les crédits carbone ?
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  {
                    step: '1',
                    title: 'Accumulation',
                    desc: 'Vos habitudes validées génèrent des crédits progressivement',
                    icon: '📈'
                  },
                  {
                    step: '2',
                    title: 'Validation',
                    desc: 'Processus de contrôle automatique sous 48-72h',
                    icon: '✅'
                  },
                  {
                    step: '3',
                    title: 'Monétisation',
                    desc: '1 kg CO₂ évité = 62 FCFA de crédit carbone',
                    icon: '💵'
                  },
                  {
                    step: '4',
                    title: 'Utilisation',
                    desc: 'Vendez ou compensez avec vos crédits',
                    icon: '🔄'
                  }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#E8F5E9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#212121',
                        marginBottom: '4px'
                      }}>
                        {item.step}. {item.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#757575', lineHeight: '1.5' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions récentes */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#212121' }}>
                Transactions récentes
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                color: '#9E9E9E'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '16px', opacity: 0.3 }}>
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <p style={{ fontSize: '14px', textAlign: 'center' }}>
                  Aucune transaction pour le moment.<br/>
                  Continuez à déclarer vos habitudes !
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
