# 🧪 Guide de Test Complet - ECOM Platform (Sans Email/SMS)

## 📋 Résumé de la Situation

### ✅ Services DISPONIBLES pour tests (sans API externes)
- ✅ Inscription utilisateur (sans vérification email/SMS)
- ✅ Connexion / Déconnexion
- ✅ Gestion profil utilisateur
- ✅ Portefeuille virtuel (sans rechargement Mobile Money)
- ✅ Commandes transport (toutes catégories)
- ✅ Marketplace
- ✅ Éco-habitudes et crédits carbone
- ✅ Codes promo
- ✅ Panneau admin complet
- ✅ Notifications push (WebSocket)
- ✅ Analytics et statistiques

### ❌ Services DÉSACTIVÉS (en attente email société + API opérateurs)
- ❌ Vérification email
- ❌ Notifications email
- ❌ Réinitialisation mot de passe par email
- ❌ Vérification téléphone par SMS OTP
- ❌ Rechargement Mobile Money (Flooz/T-Money)
- ❌ Notifications SMS

---

## 🚀 Procédure de Test Complète

### **Étape 1 : Démarrer l'Application**

#### Backend
```bash
cd backend
npm run dev
```
✅ Le serveur démarre sur http://localhost:5000
⚠️ Vous verrez un warning: `❌ Erreur configuration email` - **C'EST NORMAL** (email désactivé)

#### Frontend
```bash
cd ..  # Retour à la racine
npm run dev
```
✅ Le frontend démarre sur http://localhost:5173

---

### **Étape 2 : Créer un Compte Utilisateur (Bypass OTP)**

#### 🔥 **Méthode A : Inscription Normale (Recommandée)**

1. **Aller sur** http://localhost:5173/signup
2. **Remplir le formulaire** :
   - Prénom: `Test`
   - Nom: `Utilisateur`
   - Téléphone: `+228 90 12 34 56` (format libre)
   - Email: `test@example.com` (optionnel)
   - Mot de passe: `Test1234`

3. **Cliquer sur "S'inscrire"**

**Ce qui se passe** :
- ✅ Le compte est créé
- ✅ Vous êtes automatiquement connecté
- ❌ Pas d'OTP envoyé (SMS désactivé)
- ❌ Pas d'email de bienvenue (email désactivé)
- ✅ `isVerified = false` mais vous pouvez quand même utiliser l'app

---

#### 🛠️ **Méthode B : Création Directe en Base de Données**

Si vous voulez créer des comptes de test rapidement :

**Via Prisma Studio** :
```bash
cd backend
npx prisma studio
```

Puis dans l'interface web (http://localhost:5555) :
1. Aller dans **User**
2. Cliquer **Add record**
3. Remplir :
   ```
   phoneNumber: +22890123456
   password: $2b$10$hashed... (voir ci-dessous pour générer)
   email: test@example.com
   firstName: Test
   lastName: User
   isVerified: true
   isActive: true
   role: USER
   ```

**Générer un mot de passe hashé** :
```javascript
// Dans la console Node.js
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('Test1234', 10));
// Résultat: $2b$10$xyz... (copier ce hash)
```

---

### **Étape 3 : Créer un Compte SUPER_ADMIN**

#### 🔥 **Méthode Recommandée : Via Route API**

**Requête POST** (Postman, Thunder Client, ou fetch) :
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "phoneNumber": "+22890000001",
  "password": "Admin123456",
  "email": "admin@ecomplatform.tg",
  "firstName": "Super",
  "lastName": "Admin"
}
```

Puis **manuellement dans Prisma Studio**, changer :
- `role: SUPER_ADMIN`
- `isAdmin: true`
- `isVerified: true`

---

### **Étape 4 : Tests Possibles Sans Email/SMS**

#### ✅ **1. Tests Utilisateur**

**Connexion** :
```
POST /api/auth/login
{
  "phoneNumber": "+22890123456",
  "password": "Test1234"
}
```

**Profil** :
```
GET /api/user/profile
Authorization: Bearer {token}
```

**Mise à jour profil** :
```
PUT /api/user/profile
{
  "firstName": "Nouveau",
  "email": "nouveau@email.com"
}
```

---

#### ✅ **2. Tests Portefeuille**

**Consulter solde** :
```
GET /api/wallet/balance
```

**Simuler un crédit manuel** (via Prisma Studio) :
- Créer une transaction dans la table `Transaction`
- Type: `CREDIT`
- Amount: `50000`
- Status: `COMPLETED`

Le solde se met à jour automatiquement !

---

#### ✅ **3. Tests Transport**

**Demander une course** :
```
POST /api/transport/request
{
  "serviceType": "LUX",
  "pickupLocation": {
    "address": "Aéroport Lomé",
    "lat": 6.1667,
    "lng": 1.2333
  },
  "dropoffLocation": {
    "address": "Hôtel Sarakawa",
    "lat": 6.1333,
    "lng": 1.2167
  },
  "scheduledTime": "2025-11-13T15:00:00Z",
  "passengers": 2
}
```

**Voir historique courses** :
```
GET /api/transport/history
```

---

#### ✅ **4. Tests Marketplace**

**Créer un produit** (en tant que vendeur) :
```
POST /api/marketplace/products
{
  "name": "Ordinateur HP",
  "description": "Laptop neuf",
  "price": 450000,
  "category": "ELECTRONICS",
  "stock": 5
}
```

**Passer commande** :
```
POST /api/marketplace/orders
{
  "items": [
    {
      "productId": "xxx",
      "quantity": 1
    }
  ],
  "deliveryAddress": "Tokoin, Lomé"
}
```

---

#### ✅ **5. Tests Éco-Habitudes**

**Déclarer une éco-habitude** :
```
POST /api/user/eco-habits
{
  "habitType": "Covoiturage",
  "description": "Trajet partagé Lomé-Kara",
  "date": "2025-11-13",
  "proofImage": "base64_image...",
  "co2Saved": 15
}
```

**Admin valide** :
```
PUT /api/admin/eco-habits/{id}/validate
```

**Crédits carbone ajoutés automatiquement** ✅

---

#### ✅ **6. Tests Codes Promo**

**Admin crée un code** :
```
POST /api/admin/promo-codes
{
  "code": "WELCOME2024",
  "discount": 20,
  "type": "PERCENTAGE",
  "maxUsage": 100,
  "validFrom": "2025-11-01",
  "validUntil": "2025-12-31"
}
```

**Utilisateur applique le code** :
```
POST /api/transport/apply-promo
{
  "code": "WELCOME2024",
  "orderId": "xxx"
}
```

---

#### ✅ **7. Tests Admin**

**Dashboard** :
```
GET /api/admin/dashboard
Authorization: Bearer {admin_token}
```

**Gestion utilisateurs** :
```
GET /api/admin/users?page=1&limit=10
POST /api/admin/users/{id}/toggle-status
PUT /api/admin/users/{id}/promote
```

**Statistiques** :
```
GET /api/admin/analytics?period=7d
GET /api/admin/revenue?startDate=2025-11-01&endDate=2025-11-13
```

**Paramètres plateforme** :
```
GET /api/admin/settings
PUT /api/admin/settings
{
  "fees": {
    "driverCommission": 15
  },
  "limits": {
    "maxOrderValue": 5000000
  }
}
```

---

### **Étape 5 : Tests Interface Frontend**

#### 🌐 **Pages Utilisateur Testables**

1. **Accueil** : http://localhost:5173/
2. **Inscription/Connexion** : http://localhost:5173/login
3. **Profil** : http://localhost:5173/profile
4. **Portefeuille** : http://localhost:5173/wallet
5. **Transport** : http://localhost:5173/transport
6. **Marketplace** : http://localhost:5173/marketplace
7. **Éco-Habitudes** : http://localhost:5173/eco-habits
8. **Réductions** : http://localhost:5173/reductions
9. **Historique** : http://localhost:5173/history

#### 🔧 **Pages Admin Testables**

1. **Dashboard Admin** : http://localhost:5173/admin/dashboard
2. **Utilisateurs** : http://localhost:5173/admin/users
3. **Analytics** : http://localhost:5173/admin/analytics
4. **Codes Promo** : http://localhost:5173/admin/promo-codes
5. **Éco-Habitudes** : http://localhost:5173/admin/eco-habits
6. **Notifications** : http://localhost:5173/admin/notifications
7. **Export** : http://localhost:5173/admin/export
8. **Paramètres** : http://localhost:5173/admin/settings

---

## 🔐 Contourner les Limitations

### **1. Pas de vérification email ?**
✅ **Solution** : Tous les comptes fonctionnent même avec `emailVerified = false`

### **2. Pas d'OTP SMS ?**
✅ **Solution** : L'inscription fonctionne directement sans vérification

### **3. Pas de rechargement Mobile Money ?**
✅ **Solution** : Créditez manuellement via Prisma Studio :
```sql
-- Dans Prisma Studio, table Transaction
type: CREDIT
amount: 50000
status: COMPLETED
userId: {votre_user_id}
```

### **4. Mot de passe oublié sans email ?**
✅ **Solution** : Réinitialisez via Prisma Studio :
```javascript
// Générer nouveau hash
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('NouveauMotDePasse123', 10);
// Copier le hash dans le champ password de l'utilisateur
```

---

## 📊 Données de Test à Créer

### **Users** (3 types)
- 1 SUPER_ADMIN : `admin@ecom.tg` / `Admin123456`
- 1 ADMIN : `moderator@ecom.tg` / `Modo123456`
- 5 USER : `user1@ecom.tg` ... `user5@ecom.tg` / `User1234`

### **Wallet**
- Chaque user : solde initial de 50 000 F

### **Products** (Marketplace)
- 10 produits dans différentes catégories
- Prix variés : 5 000 F à 500 000 F

### **Promo Codes**
- `WELCOME2024` : -20%
- `FIRST10` : -10% première commande
- `ECO50` : -5000 F transport écolo

### **EcoHabits**
- 5 déclarations en attente de validation
- 10 validées (crédits distribués)

---

## ✅ Checklist Complète de Test

### **Phase 1 : Authentification**
- [ ] Créer un compte utilisateur
- [ ] Se connecter
- [ ] Se déconnecter
- [ ] Créer un compte admin

### **Phase 2 : Utilisateur**
- [ ] Voir/modifier profil
- [ ] Consulter portefeuille
- [ ] Voir historique transactions
- [ ] Demander une course
- [ ] Parcourir marketplace
- [ ] Passer commande marketplace
- [ ] Déclarer éco-habitude
- [ ] Utiliser code promo

### **Phase 3 : Admin**
- [ ] Dashboard : voir statistiques
- [ ] Gérer utilisateurs (liste, désactiver, promouvoir)
- [ ] Analytics : graphiques, revenus
- [ ] Valider/rejeter éco-habitudes
- [ ] Créer/modifier codes promo
- [ ] Export données CSV
- [ ] Modifier paramètres plateforme

### **Phase 4 : Fonctionnalités Avancées**
- [ ] Notifications push (WebSocket)
- [ ] Filtres et recherche
- [ ] Pagination
- [ ] Upload images
- [ ] Responsive design

---

## 🔄 Quand Activer Email/SMS (Plus Tard)

### **Avec email société :**
1. Récupérer credentials SMTP
2. Mettre à jour `.env` :
   ```env
   SMTP_USER=contact@votresociete.tg
   SMTP_PASS=mot_de_passe
   ```
3. Redémarrer serveur
4. Tester envoi email : `POST /api/verification/send-email`

### **Avec API SMS (si disponibles) :**
1. Obtenir clés API Togocel/Moov
2. Mettre à jour `.env`
3. Activer vérification téléphone dans paramètres admin

---

## 🎯 Résultat

Vous pouvez tester **90% de l'application** sans :
- Email
- SMS
- Mobile Money
- API externes

Tous les autres services sont **100% fonctionnels** ! 🚀

---

## 📞 Support

Si besoin d'aide pour :
- Créer des données de test
- Debugger un service
- Ajouter une fonctionnalité

Revenez vers moi ! 😊
