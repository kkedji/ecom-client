# Configuration SMS/OTP pour Togo

## 🇹🇬 Opérateurs Locaux (Recommandé)

### Togocel
- **Contact** : Direction Technique Togocel
- **Documentation** : API SMS Togocel
- **Prérequis** :
  - Contrat commercial avec Togocel
  - Short code dédié (ex: 2024)
  - API Key et endpoint
  - Certification sécurité

### Moov Togo  
- **Contact** : Département API Moov Togo
- **Documentation** : SDK Mobile Moov
- **Prérequis** :
  - Accord partenaire Moov
  - Credentials API
  - Webhook endpoints configurés

## 🌍 Solutions Internationales (Fallback)

### Twilio
```javascript
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
  fromNumber: '+15551234567' // Numéro international
};
```

### AWS SNS
```javascript
const snsConfig = {
  region: 'eu-west-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
```

## 📋 Démarches Administratives

### 1. Togocel
- [ ] Contacter Service Entreprise Togocel
- [ ] Fournir business plan et projections volume SMS
- [ ] Négocier tarifs (généralement 15-25 F CFA par SMS)
- [ ] Obtenir short code et API credentials
- [ ] Tests d'intégration technique

### 2. Moov Togo
- [ ] Rendez-vous Direction Commerciale Moov
- [ ] Présenter projet et volume prévu
- [ ] Négocier conditions commerciales
- [ ] Configuration technique API
- [ ] Certification sandbox puis production

### 3. Certification ARTNT (Autorité de Régulation)
- [ ] Déclaration activité SMS commercial
- [ ] Respect réglementation télécoms Togo
- [ ] Agrément si volume > 100k SMS/mois

## 💰 Coûts Estimés

### Tarification SMS
- **Togocel** : 15-20 F CFA par SMS
- **Moov** : 18-25 F CFA par SMS  
- **International** : 50-80 F CFA par SMS

### Frais d'installation
- **Setup fee** : 50,000 - 200,000 F CFA
- **Dépôt de garantie** : 100,000 - 500,000 F CFA
- **Frais certification** : 25,000 - 100,000 F CFA