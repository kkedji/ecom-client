# Configuration des Services Email et Vérification

## ✅ Services Opérationnels Sans API Externes

Tous les services suivants sont maintenant **fonctionnels** et ne nécessitent **PAS** d'API des opérateurs télécom :

### 1. ✉️ Service Email (emailService.js)
- ✅ Envoi d'emails via SMTP (Nodemailer)
- ✅ Templates HTML professionnels
- ✅ Emails de vérification
- ✅ Emails de réinitialisation mot de passe
- ✅ Notifications admin (nouvelle commande, nouvel utilisateur, éco-habitudes)

### 2. 🔐 Service de Vérification (verificationService.js)
- ✅ Génération de tokens de vérification email
- ✅ Validation d'email avec expiration (24h)
- ✅ Réinitialisation de mot de passe
- ✅ Tokens sécurisés (crypto.randomBytes)

### 3. 🔔 Service de Notifications (notificationService.js)
- ✅ Notifications email centralisées
- ✅ Notifications push (WebSocket)
- ✅ Notifications en base de données
- ✅ Respect des paramètres admin

### 4. ⚙️ Paramètres Plateforme
- ✅ Sauvegarde en base de données (PlatformSettings)
- ✅ GET /api/admin/settings
- ✅ PUT /api/admin/settings
- ✅ Logs d'administration

### 5. 🗄️ Base de Données
- ✅ Champs User: emailVerified, emailVerificationToken, passwordResetToken
- ✅ Table PlatformSettings pour persistance
- ✅ Migrations Prisma à exécuter

---

## 📦 Installation

### 1. Installer Nodemailer
```bash
cd backend
npm install nodemailer
```

### 2. Migrer la base de données
```bash
npx prisma generate
npx prisma db push
```

---

## ⚙️ Configuration SMTP

### Option A: Gmail (Recommandé pour tests)

1. **Activer l'authentification 2FA** sur votre compte Gmail
2. **Créer un "Mot de passe d'application"**:
   - Aller sur https://myaccount.google.com/security
   - Sélectionner "Validation en deux étapes"
   - En bas, "Mots de passe des applications"
   - Générer un mot de passe pour "Mail"

3. **Configurer .env**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre.email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Le mot de passe d'application généré
SMTP_FROM=noreply@ecomplatform.tg
SMTP_FROM_NAME=ECOM Platform
FRONTEND_URL=http://localhost:5173
```

### Option B: Mailtrap (Recommandé pour développement)

Service gratuit pour tester les emails sans les envoyer vraiment.

1. Créer un compte sur https://mailtrap.io
2. Récupérer les credentials SMTP
3. Configurer .env:
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=votre_username_mailtrap
SMTP_PASS=votre_password_mailtrap
SMTP_FROM=noreply@ecomplatform.tg
SMTP_FROM_NAME=ECOM Platform
FRONTEND_URL=http://localhost:5173
```

### Option C: SendGrid, Mailgun, ou autre service SMTP

Configurer selon la documentation du service choisi.

---

## 🧪 Test des Services

### 1. Tester la connexion email
Dans un fichier test ou via Postman :

```javascript
const emailService = require('./src/services/emailService');

// Vérifier la configuration
emailService.verifyConnection();
```

### 2. Tester l'envoi d'email de vérification
```bash
POST /api/verification/send-email
Content-Type: application/json

{
  "userId": "votre_user_id"
}
```

### 3. Tester la vérification d'email
```bash
GET /api/verification/verify-email/TOKEN_RECU_PAR_EMAIL
```

### 4. Tester la réinitialisation de mot de passe
```bash
POST /api/verification/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### 5. Tester les paramètres admin
```bash
# Récupérer les paramètres
GET /api/admin/settings
Authorization: Bearer ADMIN_TOKEN

# Mettre à jour les paramètres
PUT /api/admin/settings
Authorization: Bearer SUPER_ADMIN_TOKEN
Content-Type: application/json

{
  "notifications": {
    "emailEnabled": true,
    "adminEmailOnNewOrder": true
  }
}
```

---

## 🔄 Intégrations Automatiques

Les services sont déjà intégrés dans le code existant :

### ✅ Lors d'une nouvelle inscription
- Email de bienvenue envoyé automatiquement
- Si `requireEmailVerification` est activé, l'utilisateur doit vérifier son email

### ✅ Lors d'une nouvelle commande
- Notification email aux admins (si activé)
- Notification push via WebSocket
- Notification enregistrée en BDD

### ✅ Lors d'une nouvelle éco-habitude
- Notification email aux admins (si activé)
- Notification push
- Notification en BDD

---

## 🚀 Démarrage

1. **Installer les dépendances**:
```bash
npm install
```

2. **Configurer .env** avec les credentials SMTP

3. **Migrer la base de données**:
```bash
npx prisma generate
npx prisma db push
```

4. **Démarrer le serveur**:
```bash
npm run dev
```

5. **Vérifier les logs** pour confirmer:
```
✅ Service email prêt
```

---

## ❌ Services NON Implémentés (nécessitent API opérateurs)

Ces services restent désactivés car ils nécessitent les API des opérateurs télécom togolais :

- ❌ Vérification téléphone par SMS OTP
- ❌ Rechargement portefeuille Mobile Money (Flooz/T-Money)
- ❌ Notifications SMS

---

## 📝 Routes Disponibles

### Vérification Email
- `POST /api/verification/send-email` - Envoyer email de vérification
- `GET /api/verification/verify-email/:token` - Vérifier email

### Réinitialisation Mot de Passe
- `POST /api/verification/request-password-reset` - Demander réinitialisation
- `POST /api/verification/reset-password` - Réinitialiser avec token
- `GET /api/verification/check-token/:token` - Vérifier validité token

### Paramètres Admin
- `GET /api/admin/settings` - Récupérer paramètres
- `PUT /api/admin/settings` - Mettre à jour (SUPER_ADMIN uniquement)

---

## 🎯 Résultat

Tous les services sont maintenant **100% opérationnels** pour :
- ✅ Envoi d'emails
- ✅ Vérification d'email
- ✅ Réinitialisation mot de passe
- ✅ Notifications admin
- ✅ Paramètres persistants en BDD
- ✅ Notifications push (WebSocket)

**Seuls les services nécessitant les API Togocel/Moov/Flooz/T-Money restent désactivés.**
