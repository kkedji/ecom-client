import React, { useState } from 'react'

export default function Help() {
  const [expandedSection, setExpandedSection] = useState(null)

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div style={{padding: '16px'}}>
      {/* Introduction */}
      <div style={{textAlign: 'center', marginBottom: '32px'}}>
        <div style={{
          width: '200px',
          height: '120px',
          margin: '0 auto 16px',
          background: '#f5f5f5',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <img 
            src="/src/assets/images/ecom-logo.png" 
            alt="Ecom Logo" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = '<div style="color: #1B5E20; fontSize: 24px; fontWeight: bold;">Ecom</div>'
            }}
          />
        </div>
        <h2 style={{color: '#1B5E20', marginBottom: '8px'}}>Bienvenue dans le monde des Ecom</h2>
        <p style={{color: '#757575', lineHeight: '1.5'}}>
          Véhicules de transport avec chauffeur. Ce guide vous aidera à 
          comprendre comment utiliser les services de Ecom pour vos déplacements.
        </p>
      </div>

      {/* Guide d'utilisation */}
      <div style={{background: 'white', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden'}}>
        <div 
          onClick={() => toggleSection('guide')}
          style={{
            padding: '16px',
            borderBottom: '1px solid #E0E0E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{display: 'flex', alignItems: 'center'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span style={{fontSize: '16px', fontWeight: '500'}}>Guide d'utilisation</span>
          </div>
          <span style={{fontSize: '16px', color: '#1B5E20'}}>
            {expandedSection === 'guide' ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedSection === 'guide' && (
          <div style={{padding: '16px'}}>
            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#1B5E20', marginBottom: '8px'}}>1. Téléchargez l'application</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Téléchargez l'application Ecom sur playstore ou applestore pour commander un Ecom.
              </p>
            </div>
            
            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#1B5E20', marginBottom: '8px'}}>2. Créez un compte</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Créez un compte en entrant vos informations personnelles, telles que votre nom, 
                adresse e-mail et numéro de téléphone.
              </p>
            </div>
            
            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#1B5E20', marginBottom: '8px'}}>3. Demandez une course</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Ouvrez l'application et entrez votre destination. Vous pouvez également 
                sélectionner le type de véhicule souhaité et ajouter des détails 
                supplémentaires, tels que des arrêts en cours de route.
              </p>
            </div>

            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#1B5E20', marginBottom: '8px'}}>4. Confirmez la course</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Vérifiez les détails de votre course, y compris le temps d'attente estimé, 
                le coût approximatif et les informations sur le conducteur. Confirmez la course 
                pour que le conducteur puisse vous prendre en charge.
              </p>
            </div>

            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#1B5E20', marginBottom: '8px'}}>5. Montez à bord</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Le conducteur arrivera à l'endroit convenu pour vous prendre en charge. 
                Montez à bord et profitez du voyage.
              </p>
            </div>

            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#1B5E20', marginBottom: '8px'}}>6. Payez la course</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                À la fin du voyage, vous pouvez payer directement à travers l'application en 
                utilisant une carte de crédit ou un autre mode de paiement enregistré.
              </p>
            </div>

            <div>
              <h3 style={{color: '#1B5E20', marginBottom: '8px'}}>7. Évaluez le conducteur</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Après chaque course, vous pouvez évaluer le conducteur et laisser un 
                commentaire sur votre expérience de voyage. Cela aide à maintenir une 
                qualité de service élevée pour tous les utilisateurs.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div style={{background: 'white', borderRadius: '12px', marginBottom: '16px', overflow: 'hidden'}}>
        <div 
          onClick={() => toggleSection('faq')}
          style={{
            padding: '16px',
            borderBottom: '1px solid #E0E0E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{display: 'flex', alignItems: 'center'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '16px'}}>
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style={{fontSize: '16px', fontWeight: '500'}}>Foire aux questions</span>
          </div>
          <span style={{fontSize: '16px', color: '#1B5E20'}}>
            {expandedSection === 'faq' ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedSection === 'faq' && (
          <div style={{padding: '16px'}}>
            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#2196F3', marginBottom: '8px'}}>Comment fonctionne l'application Ecom?</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                L'application Ecom vous permet de commander un véhicule de transport avec chauffeur en quelques clics. 
                Vous pouvez choisir votre point de départ et d'arrivée, ainsi que la date et l'heure souhaitées. 
                La demande sera transmise à un conducteur disponible à proximité, qui vous emmènera à destination.
              </p>
            </div>
            
            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#2196F3', marginBottom: '8px'}}>Comment commander un Ecom dans l'application ?</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Pour commander un Ecom, ouvrez l'application Ecom, entrez votre adresse de départ et de destination, 
                sélectionnez le type de véhicule souhaité et suivez les instructions pour finaliser la commande.
              </p>
            </div>

            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#2196F3', marginBottom: '8px'}}>Comment payer ma course Ecom?</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Vous pouvez payer votre course Ecom en utilisant une carte bancaire enregistrée dans l'application, 
                ou en espèces au moment de la course.
              </p>
            </div>

            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#2196F3', marginBottom: '8px'}}>Comment annuler ma course Ecom?</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Vous pouvez annuler votre course Ecom en utilisant l'option d'annulation dans l'application, 
                ou en appelant le service clientèle. Il est important de noter que des frais d'annulation 
                peuvent s'appliquer en fonction des conditions générales de l'application.
              </p>
            </div>

            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#2196F3', marginBottom: '8px'}}>Comment créer un compte dans l'application Ecom ?</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Pour créer un compte dans l'application Ecom, vous devrez fournir vos informations personnelles, 
                telles que votre nom, adresse e-mail et numéro de téléphone.
              </p>
            </div>

            <div>
              <h3 style={{color: '#2196F3', marginBottom: '8px'}}>Comment évaluer un chauffeur de Ecom ?</h3>
              <p style={{color: '#757575', lineHeight: '1.5'}}>
                Après chaque voyage en Ecom, vous pouvez évaluer le chauffeur en utilisant les options de l'application, 
                telles que les étoiles ou les commentaires. Cela aide les applications Ecom à évaluer la qualité de leurs chauffeurs 
                et à améliorer leur service.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confidentialité */}
      <div style={{background: 'white', borderRadius: '12px', overflow: 'hidden'}}>
        <div 
          onClick={() => toggleSection('privacy')}
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{display: 'flex', alignItems: 'center'}}>
            <span style={{marginRight: '16px', fontSize: '20px'}}>�</span>
            <span style={{fontSize: '16px', fontWeight: '500'}}>Règles de confidentialité</span>
          </div>
          <span style={{fontSize: '16px', color: '#1B5E20'}}>
            {expandedSection === 'privacy' ? '▼' : '▶'}
          </span>
        </div>
        
        {expandedSection === 'privacy' && (
          <div style={{padding: '16px'}}>
            <p style={{color: '#757575', lineHeight: '1.5', marginBottom: '16px'}}>
              Nous nous engageons à protéger vos données personnelles et à respecter votre vie privée. 
              Toutes les informations collectées sont utilisées uniquement pour améliorer nos services.
            </p>
            <p style={{color: '#757575', lineHeight: '1.5'}}>
              Vos données de localisation sont cryptées et ne sont partagées qu'avec votre conducteur 
              attribué pour faciliter la prise en charge et la livraison.
            </p>
          </div>
        )}
      </div>

      {/* Contact */}
      <div style={{textAlign: 'center', marginTop: '32px', padding: '16px'}}>
        <p style={{color: '#757575', lineHeight: '1.5'}}>
          En suivant ces étapes simples, vous pouvez facilement utiliser les services de Ecom pour vos déplacements. 
          N'hésitez pas à contacter le support si vous avez des questions ou des problèmes.
        </p>
      </div>
    </div>
  )
}