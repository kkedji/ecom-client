import React, { useState, useEffect } from 'react'

const SignUpWithOTP = ({ onSignUpComplete }) => {
  const [currentStep, setCurrentStep] = useState('phone') // phone, otp, details, complete
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    acceptTerms: false
  })
  const [otpTimer, setOtpTimer] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [errors, setErrors] = useState({})

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

  const validatePhone = (phone) => {
    // Validation pour les numéros togolais
    const togoPhoneRegex = /^(90|91|92|93|96|97|98|99|70|79)\d{6}$/
    return togoPhoneRegex.test(phone.replace(/\s+/g, ''))
  }

  const sendOTP = async () => {
    if (!validatePhone(formData.phone)) {
      setErrors({ phone: 'Numéro de téléphone invalide' })
      return
    }

    setErrors({})
    setIsResending(true)
    
    // Simulation d'envoi d'OTP (à remplacer par l'API réelle)
    try {
      console.log('Envoi OTP au:', formData.phone)
      // await api.sendOTP(formData.phone)
      
      setCurrentStep('otp')
      setOtpTimer(60) // 60 secondes avant de pouvoir renvoyer
      setIsResending(false)
    } catch (error) {
      setErrors({ phone: 'Erreur lors de l\'envoi du code' })
      setIsResending(false)
    }
  }

  const verifyOTP = async () => {
    if (formData.otp.length !== 4) {
      setErrors({ otp: 'Le code doit contenir 4 chiffres' })
      return
    }

    setErrors({})
    
    // Simulation de vérification OTP (à remplacer par l'API réelle)
    try {
      console.log('Vérification OTP:', formData.otp)
      // await api.verifyOTP(formData.phone, formData.otp)
      
      setCurrentStep('details')
    } catch (error) {
      setErrors({ otp: 'Code incorrect ou expiré' })
    }
  }

  const completeSignUp = async () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis'
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis'
    if (!formData.email.includes('@')) newErrors.email = 'Email invalide'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date de naissance requise'
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    
    // Simulation de création de compte (à remplacer par l'API réelle)
    try {
      console.log('Création de compte:', formData)
      // await api.createAccount(formData)
      
      setCurrentStep('complete')
      setTimeout(() => {
        onSignUpComplete && onSignUpComplete(formData)
      }, 2000)
    } catch (error) {
      setErrors({ general: 'Erreur lors de la création du compte' })
    }
  }

  const renderPhoneStep = () => (
    <div style={{padding: '24px', textAlign: 'center'}}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '40px',
        background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        color: 'white',
        margin: '0 auto 24px'
      }}>
        📱
      </div>
      
      <h2 style={{color: '#1B5E20', margin: '0 0 8px'}}>Vérification du numéro</h2>
      <p style={{color: '#757575', margin: '0 0 32px', lineHeight: '1.5'}}>
        Nous allons vous envoyer un code de vérification par SMS pour sécuriser votre compte
      </p>

      <div style={{marginBottom: '24px'}}>
        <div style={{
          display: 'flex',
          background: 'white',
          borderRadius: '12px',
          border: '2px solid ' + (errors.phone ? '#F44336' : '#e0e0e0'),
          overflow: 'hidden',
          marginBottom: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            background: '#f5f5f5',
            borderRight: '1px solid #e0e0e0'
          }}>
            <span style={{marginRight: '8px', fontSize: '20px'}}>🇹🇬</span>
            <span style={{fontWeight: '600'}}>+228</span>
          </div>
          <input
            type="tel"
            placeholder="90 12 34 56"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              fontSize: '16px',
              background: 'white',
              outline: 'none'
            }}
            maxLength={10}
          />
        </div>
        {errors.phone && (
          <div style={{color: '#F44336', fontSize: '14px', textAlign: 'left'}}>
            {errors.phone}
          </div>
        )}
        <div style={{
          textAlign: 'left',
          fontSize: '12px',
          color: '#757575',
          marginTop: '4px'
        }}>
          Format: 90 12 34 56 (8 chiffres)
        </div>
      </div>

      <div style={{marginBottom: '24px', fontSize: '14px', color: '#757575', lineHeight: '1.4'}}>
        <strong>Pourquoi cette vérification ?</strong><br/>
        • Protection de votre portefeuille électronique<br/>
        • Conformité aux réglementations BCEAO<br/>
        • Sécurité des transactions financières<br/>
        • Prévention des fraudes
      </div>

      <button
        onClick={sendOTP}
        disabled={isResending || !formData.phone}
        style={{
          width: '100%',
          background: isResending || !formData.phone ? '#BDBDBD' : '#1B5E20',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isResending || !formData.phone ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isResending ? (
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
            Envoi en cours...
          </>
        ) : (
          'Envoyer le code de vérification'
        )}
      </button>
    </div>
  )

  const renderOTPStep = () => (
    <div style={{padding: '24px', textAlign: 'center'}}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '40px',
        background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        color: 'white',
        margin: '0 auto 24px'
      }}>
        🔐
      </div>
      
      <h2 style={{color: '#1B5E20', margin: '0 0 8px'}}>Code de vérification</h2>
      <p style={{color: '#757575', margin: '0 0 32px', lineHeight: '1.5'}}>
        Saisissez le code à 4 chiffres envoyé au<br/>
        <strong>+228 {formData.phone}</strong>
      </p>

      <div style={{marginBottom: '24px'}}>
        <input
          type="text"
          placeholder="0000"
          value={formData.otp}
          onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
          style={{
            width: '120px',
            padding: '16px',
            border: '2px solid ' + (errors.otp ? '#F44336' : '#e0e0e0'),
            borderRadius: '12px',
            fontSize: '24px',
            fontWeight: '600',
            textAlign: 'center',
            letterSpacing: '8px',
            background: 'white',
            outline: 'none'
          }}
          maxLength={4}
        />
        {errors.otp && (
          <div style={{color: '#F44336', fontSize: '14px', marginTop: '8px'}}>
            {errors.otp}
          </div>
        )}
      </div>

      <button
        onClick={verifyOTP}
        disabled={formData.otp.length !== 4}
        style={{
          width: '100%',
          background: formData.otp.length !== 4 ? '#BDBDBD' : '#1B5E20',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: formData.otp.length !== 4 ? 'not-allowed' : 'pointer',
          marginBottom: '16px'
        }}
      >
        Vérifier le code
      </button>

      <div style={{fontSize: '14px', color: '#757575'}}>
        {otpTimer > 0 ? (
          <span>Renvoyer le code dans {otpTimer}s</span>
        ) : (
          <button
            onClick={sendOTP}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#1B5E20',
              fontSize: '14px',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Renvoyer le code
          </button>
        )}
      </div>

      <button
        onClick={() => setCurrentStep('phone')}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#757575',
          fontSize: '14px',
          marginTop: '16px',
          cursor: 'pointer'
        }}
      >
        ← Modifier le numéro
      </button>
    </div>
  )

  const renderDetailsStep = () => (
    <div style={{padding: '24px'}}>
      <div style={{textAlign: 'center', marginBottom: '32px'}}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '40px',
          background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: 'white',
          margin: '0 auto 16px'
        }}>
          👤
        </div>
        <h2 style={{color: '#1B5E20', margin: '0 0 8px'}}>Informations personnelles</h2>
        <p style={{color: '#757575', margin: 0}}>
          Complétez votre profil pour finaliser l'inscription
        </p>
      </div>

      <div style={{display: 'grid', gap: '16px', marginBottom: '24px'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
          <div>
            <input
              type="text"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid ' + (errors.firstName ? '#F44336' : '#e0e0e0'),
                borderRadius: '12px',
                fontSize: '16px',
                background: 'white',
                outline: 'none'
              }}
            />
            {errors.firstName && (
              <div style={{color: '#F44336', fontSize: '12px', marginTop: '4px'}}>
                {errors.firstName}
              </div>
            )}
          </div>
          
          <div>
            <input
              type="text"
              placeholder="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid ' + (errors.lastName ? '#F44336' : '#e0e0e0'),
                borderRadius: '12px',
                fontSize: '16px',
                background: 'white',
                outline: 'none'
              }}
            />
            {errors.lastName && (
              <div style={{color: '#F44336', fontSize: '12px', marginTop: '4px'}}>
                {errors.lastName}
              </div>
            )}
          </div>
        </div>

        <div>
          <input
            type="email"
            placeholder="Adresse email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid ' + (errors.email ? '#F44336' : '#e0e0e0'),
              borderRadius: '12px',
              fontSize: '16px',
              background: 'white',
              outline: 'none'
            }}
          />
          {errors.email && (
            <div style={{color: '#F44336', fontSize: '12px', marginTop: '4px'}}>
              {errors.email}
            </div>
          )}
        </div>

        <div>
          <input
            type="date"
            placeholder="Date de naissance"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
            style={{
              width: '100%',
              padding: '16px',
              border: '2px solid ' + (errors.dateOfBirth ? '#F44336' : '#e0e0e0'),
              borderRadius: '12px',
              fontSize: '16px',
              background: 'white',
              outline: 'none'
            }}
          />
          {errors.dateOfBirth && (
            <div style={{color: '#F44336', fontSize: '12px', marginTop: '4px'}}>
              {errors.dateOfBirth}
            </div>
          )}
        </div>
      </div>

      <div style={{marginBottom: '24px'}}>
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          fontSize: '14px',
          lineHeight: '1.4',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
            style={{marginTop: '2px'}}
          />
          <span style={{color: errors.acceptTerms ? '#F44336' : '#757575'}}>
            J'accepte les{' '}
            <span style={{color: '#1B5E20', textDecoration: 'underline'}}>
              conditions d'utilisation
            </span>
            {' '}et la{' '}
            <span style={{color: '#1B5E20', textDecoration: 'underline'}}>
              politique de confidentialité
            </span>
          </span>
        </label>
        {errors.acceptTerms && (
          <div style={{color: '#F44336', fontSize: '12px', marginTop: '4px'}}>
            {errors.acceptTerms}
          </div>
        )}
      </div>

      {errors.general && (
        <div style={{
          background: '#FFEBEE',
          border: '1px solid #F44336',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          color: '#F44336',
          fontSize: '14px'
        }}>
          {errors.general}
        </div>
      )}

      <button
        onClick={completeSignUp}
        style={{
          width: '100%',
          background: '#1B5E20',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Créer mon compte
      </button>
    </div>
  )

  const renderCompleteStep = () => (
    <div style={{padding: '24px', textAlign: 'center'}}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '40px',
        background: '#4CAF50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        color: 'white',
        margin: '0 auto 24px'
      }}>
        ✅
      </div>
      
      <h2 style={{color: '#1B5E20', margin: '0 0 16px'}}>Compte créé avec succès !</h2>
      <p style={{color: '#757575', margin: '0 0 32px', lineHeight: '1.5'}}>
        Bienvenue dans l'écosystème Ecom !<br/>
        Votre portefeuille est maintenant activé et prêt à être utilisé.
      </p>

      <div style={{
        background: '#E8F5E8',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <div style={{fontSize: '24px', marginBottom: '8px'}}>🎉</div>
        <h3 style={{color: '#1B5E20', margin: '0 0 8px'}}>Bonus de bienvenue</h3>
        <p style={{color: '#1B5E20', margin: 0, fontSize: '14px'}}>
          500 F crédités sur votre portefeuille !
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '24px',
        border: '1px solid #e0e0e0'
      }}>
        <h4 style={{margin: '0 0 12px', color: '#212121'}}>Prochaines étapes :</h4>
        <div style={{textAlign: 'left', fontSize: '14px', color: '#757575', lineHeight: '1.6'}}>
          • Explorez nos services de transport<br/>
          • Découvrez notre marketplace<br/>
          • Rechargez votre portefeuille<br/>
          • Invitez vos amis et gagnez des bonus
        </div>
      </div>

      <div style={{fontSize: '12px', color: '#757575'}}>
        Redirection automatique dans quelques secondes...
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5E8 0%, #F5F5F5 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Progress Bar */}
        <div style={{
          height: '4px',
          background: '#e0e0e0',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            background: '#1B5E20',
            width: currentStep === 'phone' ? '25%' : 
                   currentStep === 'otp' ? '50%' : 
                   currentStep === 'details' ? '75%' : '100%',
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        {/* Content */}
        {currentStep === 'phone' && renderPhoneStep()}
        {currentStep === 'otp' && renderOTPStep()}
        {currentStep === 'details' && renderDetailsStep()}
        {currentStep === 'complete' && renderCompleteStep()}
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

export default SignUpWithOTP