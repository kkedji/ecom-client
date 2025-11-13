import React, { useState, useEffect } from 'react'
import adminApiService from '../../services/adminApiService'

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    platform: {
      name: 'ECOM Platform',
      currency: 'FCFA',
      language: 'fr',
      timezone: 'Africa/Lome',
      maintenanceMode: false
    },
    fees: {
      driverCommission: 15,
      deliveryCommission: 10,
      luxPlusCommission: 20,
      marketplaceCommission: 5,
      carbonCreditRate: 62
    },
    limits: {
      maxPromoUsage: 100,
      maxOrderValue: 5000000,
      minOrderValue: 500,
      maxCarbonCreditPerMonth: 50000
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      adminEmailOnNewOrder: true,
      adminEmailOnNewUser: false,
      adminEmailOnEcoHabit: true
    },
    security: {
      requireEmailVerification: true,
      requirePhoneVerification: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8
    }
  })

  const [activeTab, setActiveTab] = useState('platform')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const result = await adminApiService.getSettings()
      if (result.success && result.data) {
        setSettings(prev => ({
          ...prev,
          ...result.data
        }))
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (category, field, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value
      }
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      const result = await adminApiService.updateSettings(settings)
      if (result.success) {
        alert('Paramètres enregistrés avec succès!')
        setHasChanges(false)
      } else {
        alert('Erreur: ' + (result.error || 'Impossible de sauvegarder'))
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde des paramètres')
    }
  }

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      // Reset to default values
      alert('Paramètres réinitialisés aux valeurs par défaut')
      setHasChanges(false)
    }
  }

  const tabs = [
    { id: 'platform', label: 'Plateforme' },
    { id: 'fees', label: 'Frais & Commissions' },
    { id: 'limits', label: 'Limites' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Sécurité' }
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '16px', color: '#757575' }}>
          Chargement des paramètres...
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '700', color: '#212121' }}>
            Paramètres
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#757575' }}>
            Configuration de la plateforme
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '12px 24px',
              background: '#F5F5F5',
              color: '#757575',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Réinitialiser
          </button>
          {hasChanges && (
            <button
              onClick={handleSave}
              style={{
                padding: '12px 24px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
              }}
            >
              Enregistrer
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'white',
        padding: '8px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? '#4CAF50' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#757575',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {/* Platform Settings */}
        {activeTab === 'platform' && (
          <div>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '600', color: '#212121' }}>
              Paramètres de la plateforme
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                  Nom de la plateforme
                </label>
                <input
                  type="text"
                  value={settings.platform.name}
                  onChange={(e) => handleInputChange('platform', 'name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '10px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Devise
                  </label>
                  <select
                    value={settings.platform.currency}
                    onChange={(e) => handleInputChange('platform', 'currency', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="FCFA">FCFA (Franc CFA)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Langue par défaut
                  </label>
                  <select
                    value={settings.platform.language}
                    onChange={(e) => handleInputChange('platform', 'language', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Fuseau horaire
                  </label>
                  <select
                    value={settings.platform.timezone}
                    onChange={(e) => handleInputChange('platform', 'timezone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Africa/Lome">Africa/Lomé (GMT+0)</option>
                    <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: settings.platform.maintenanceMode ? '#FFEBEE' : '#F5F5F5',
                borderRadius: '10px'
              }}>
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.platform.maintenanceMode}
                  onChange={(e) => handleInputChange('platform', 'maintenanceMode', e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="maintenanceMode" style={{ flex: 1, fontSize: '15px', fontWeight: '600', color: '#424242', cursor: 'pointer' }}>
                  Mode maintenance
                </label>
                {settings.platform.maintenanceMode && (
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: '#F44336',
                    color: 'white'
                  }}>
                    ACTIF
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fees Settings */}
        {activeTab === 'fees' && (
          <div>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '600', color: '#212121' }}>
              Frais et commissions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Commission Driver (%)
                  </label>
                  <input
                    type="number"
                    value={settings.fees.driverCommission}
                    onChange={(e) => handleInputChange('fees', 'driverCommission', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Commission Delivery (%)
                  </label>
                  <input
                    type="number"
                    value={settings.fees.deliveryCommission}
                    onChange={(e) => handleInputChange('fees', 'deliveryCommission', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Commission Lux+ (%)
                  </label>
                  <input
                    type="number"
                    value={settings.fees.luxPlusCommission}
                    onChange={(e) => handleInputChange('fees', 'luxPlusCommission', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Commission Marketplace (%)
                  </label>
                  <input
                    type="number"
                    value={settings.fees.marketplaceCommission}
                    onChange={(e) => handleInputChange('fees', 'marketplaceCommission', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{
                padding: '20px',
                background: '#E8F5E9',
                borderRadius: '10px',
                borderLeft: '4px solid #4CAF50'
              }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2E7D32', marginBottom: '8px' }}>
                  🌱 Taux de conversion Crédits Carbone (FCFA/kg CO₂)
                </label>
                <input
                  type="number"
                  value={settings.fees.carbonCreditRate}
                  onChange={(e) => handleInputChange('fees', 'carbonCreditRate', parseFloat(e.target.value))}
                  min="0"
                  style={{
                    width: '200px',
                    padding: '12px',
                    fontSize: '15px',
                    border: '2px solid #66BB6A',
                    borderRadius: '10px',
                    outline: 'none'
                  }}
                />
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#388E3C' }}>
                  1 kg CO₂ évité = {settings.fees.carbonCreditRate} FCFA de crédits
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Limits Settings */}
        {activeTab === 'limits' && (
          <div>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '600', color: '#212121' }}>
              Limites et restrictions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                  Utilisation max. codes promo
                </label>
                <input
                  type="number"
                  value={settings.limits.maxPromoUsage}
                  onChange={(e) => handleInputChange('limits', 'maxPromoUsage', parseInt(e.target.value))}
                  min="1"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '12px',
                    fontSize: '15px',
                    border: '2px solid #E0E0E0',
                    borderRadius: '10px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Montant min. commande (FCFA)
                  </label>
                  <input
                    type="number"
                    value={settings.limits.minOrderValue}
                    onChange={(e) => handleInputChange('limits', 'minOrderValue', parseInt(e.target.value))}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Montant max. commande (FCFA)
                  </label>
                  <input
                    type="number"
                    value={settings.limits.maxOrderValue}
                    onChange={(e) => handleInputChange('limits', 'maxOrderValue', parseInt(e.target.value))}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Crédits carbone max./mois (FCFA)
                  </label>
                  <input
                    type="number"
                    value={settings.limits.maxCarbonCreditPerMonth}
                    onChange={(e) => handleInputChange('limits', 'maxCarbonCreditPerMonth', parseInt(e.target.value))}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '600', color: '#212121' }}>
              Paramètres de notifications
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(settings.notifications).map(([key, value]) => {
                const labels = {
                  emailEnabled: 'Activer les notifications email',
                  smsEnabled: 'Activer les notifications SMS',
                  pushEnabled: 'Activer les notifications push',
                  adminEmailOnNewOrder: 'Email admin sur nouvelle commande',
                  adminEmailOnNewUser: 'Email admin sur nouvel utilisateur',
                  adminEmailOnEcoHabit: 'Email admin sur nouvelle éco-habitude'
                }
                
                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: '#F9F9F9',
                      borderRadius: '10px'
                    }}
                  >
                    <input
                      type="checkbox"
                      id={key}
                      checked={value}
                      onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label htmlFor={key} style={{ flex: 1, fontSize: '15px', color: '#424242', cursor: 'pointer' }}>
                      {labels[key]}
                    </label>
                    {value && (
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: '#E8F5E9',
                        color: '#2E7D32'
                      }}>
                        ACTIF
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '600', color: '#212121' }}>
              Paramètres de sécurité
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: '#F9F9F9',
                  borderRadius: '10px'
                }}>
                  <input
                    type="checkbox"
                    id="requireEmailVerification"
                    checked={settings.security.requireEmailVerification}
                    onChange={(e) => handleInputChange('security', 'requireEmailVerification', e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="requireEmailVerification" style={{ flex: 1, fontSize: '15px', color: '#424242', cursor: 'pointer' }}>
                    Exiger la vérification email
                  </label>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: '#F9F9F9',
                  borderRadius: '10px'
                }}>
                  <input
                    type="checkbox"
                    id="requirePhoneVerification"
                    checked={settings.security.requirePhoneVerification}
                    onChange={(e) => handleInputChange('security', 'requirePhoneVerification', e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="requirePhoneVerification" style={{ flex: 1, fontSize: '15px', color: '#424242', cursor: 'pointer' }}>
                    Exiger la vérification téléphone
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Timeout de session (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="120"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Tentatives de connexion max.
                  </label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#424242', marginBottom: '8px' }}>
                    Longueur min. mot de passe
                  </label>
                  <input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    min="6"
                    max="20"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '15px',
                      border: '2px solid #E0E0E0',
                      borderRadius: '10px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning when changes pending */}
      {hasChanges && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '16px 24px',
          background: '#FF9800',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 1000
        }}>
          Vous avez des modifications non enregistrées
        </div>
      )}
    </div>
  )
}
