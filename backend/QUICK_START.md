# 🚀 Guide de Démarrage Rapide - Services Email & Notifications

## ✅ Ce qui a été créé

### Nouveaux fichiers backend:
1. **`src/services/emailService.js`** - Service d'envoi d'emails avec Nodemailer
2. **`src/services/verificationService.js`** - Gestion vérification email et reset password
3. **`src/services/notificationService.js`** - Notifications centralisées (email, push, BDD)
4. **`src/routes/verification.js`** - Routes API de vérification
5. **`SERVICES_SETUP.md`** - Documentation complète

### Modifications:
- ✅ `prisma/schema.prisma` - Ajout champs vérification + table PlatformSettings
- ✅ `src/routes/admin.js` - Sauvegarde paramètres en BDD
- ✅ `src/server.js` - Routes de vérification intégrées
- ✅ `.env.example` - Variables SMTP ajoutées

---

## 🎯 Installation en 5 étapes

### 1️⃣ Installer nodemailer
```bash
cd backend
npm install nodemailer
```

### 2️⃣ Configurer votre fichier .env

Ajouter ces lignes à votre fichier `.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre.email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM=noreply@ecomplatform.tg
SMTP_FROM_NAME=ECOM Platform

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Pour Gmail:**
- Activer l'authentification 2FA
- Générer un "Mot de passe d'application" sur https://myaccount.google.com/security
- Utiliser ce mot de passe dans `SMTP_PASS`

### 3️⃣ Migrer la base de données
```bash
npx prisma generate
npx prisma db push
```

### 4️⃣ Démarrer le serveur
```bash
npm run dev
```

Vous devriez voir:
```
✅ Service email prêt
Server is running on port 5000
```

### 5️⃣ Tester l'envoi d'email

Créer un fichier test `test-email.js`:
```javascript
require('dotenv').config();
const emailService = require('./src/services/emailService');

async function test() {
  await emailService.verifyConnection();
  
  const result = await emailService.sendEmail({
    to: 'votre.email@test.com',
    subject: 'Test ECOM Platform',
    html: '<h1>Ça marche!</h1><p>Les emails fonctionnent correctement.</p>'
  });
  
  console.log(result);
}

test();
```

Exécuter:
```bash
node test-email.js
```

---

## 📧 Fonctionnalités Email Disponibles

### ✅ Vérification Email
Quand un utilisateur s'inscrit:
```javascript
POST /api/verification/send-email
{
  "userId": "user_id_here"
}
```

L'utilisateur reçoit un email avec un lien:
`http://localhost:5173/verify-email?token=ABC123...`

### ✅ Réinitialisation Mot de Passe
```javascript
POST /api/verification/request-password-reset
{
  "email": "user@example.com"
}
```

### ✅ Notifications Admin Automatiques
- ✉️ Email lors d'une nouvelle commande
- ✉️ Email lors d'un nouvel utilisateur (optionnel)
- ✉️ Email lors d'une nouvelle éco-habitude

Configurables depuis le panneau admin: **Paramètres > Notifications**

---

## ⚙️ Paramètres Admin

### Activer/Désactiver les emails:
1. Se connecter en tant que SUPER_ADMIN
2. Aller dans **Paramètres** > **Notifications**
3. Toggle "Activer les notifications email"

Les paramètres sont maintenant **sauvegardés en base de données** et persistent entre les redémarrages.

---

## 🔐 Sécurité Email

### Vérification Email Obligatoire
Dans **Paramètres** > **Sécurité** > "Exiger la vérification email":
- ✅ Activé: L'utilisateur doit vérifier son email avant d'accéder à son compte
- ❌ Désactivé: L'utilisateur peut utiliser l'app sans vérifier

---

## 🐛 Dépannage

### Erreur "Invalid login"
- Vérifier que vous utilisez un "Mot de passe d'application" et non votre mot de passe Gmail
- Vérifier que l'authentification 2FA est activée

### Emails non reçus
- Vérifier les spams
- Utiliser Mailtrap.io pour tester en dev (voir SERVICES_SETUP.md)
- Vérifier les logs du serveur

### Erreur "Connection refused"
- Vérifier SMTP_HOST et SMTP_PORT
- Vérifier votre connexion internet
- Essayer avec SMTP_PORT=465 et SMTP_SECURE=true

---

## 🚨 Important

### ✅ Services FONCTIONNELS (sans API opérateurs):
- ✅ Emails (vérification, reset password, notifications)
- ✅ Notifications push (WebSocket)
- ✅ Paramètres admin persistants
- ✅ Logs d'administration

### ❌ Services NON fonctionnels (nécessitent API opérateurs):
- ❌ SMS OTP pour vérification téléphone
- ❌ Rechargement Mobile Money (Flooz/T-Money)
- ❌ Notifications SMS

---

## 📱 Intégration Frontend

### Page de vérification email
Créer `src/pages/VerifyEmail.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    
    axios.get(`http://localhost:5000/api/verification/verify-email/${token}`)
      .then(res => {
        if (res.data.success) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, []);
  
  return (
    <div>
      {status === 'loading' && <p>Vérification en cours...</p>}
      {status === 'success' && <p>✅ Email vérifié avec succès!</p>}
      {status === 'error' && <p>❌ Lien invalide ou expiré</p>}
    </div>
  );
}
```

Ajouter la route dans votre router:
```jsx
<Route path="/verify-email" element={<VerifyEmail />} />
```

---

## 🎉 Résultat

Vous avez maintenant un système complet de:
- ✅ Gestion des emails
- ✅ Vérification d'email avec tokens sécurisés
- ✅ Réinitialisation de mot de passe
- ✅ Notifications admin par email
- ✅ Paramètres persistants en BDD
- ✅ Notifications push temps réel

Tout cela **SANS avoir besoin des API des opérateurs télécom** ! 🚀
