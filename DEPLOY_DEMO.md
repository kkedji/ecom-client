# Déploiement Demo - Ecom Backend

## 🚀 Configuration Netlify Functions

Votre backend Ecom est maintenant configuré pour être déployé sur Netlify avec des fonctions serverless. Voici comment procéder:

### 1. Préparation du déploiement

```bash
# Installer Netlify CLI globalement
npm install -g netlify-cli

# Se connecter à Netlify
netlify login

# Initialiser le projet Netlify
netlify init
```

### 2. Configuration des variables d'environnement

Dans le dashboard Netlify, ajouter ces variables d'environnement:

```env
# Database (utiliser Neon.tech ou Supabase pour la demo)
DATABASE_URL="postgresql://username:password@host:5432/database"

# JWT
JWT_SECRET="your-super-secret-jwt-key-for-demo"

# Services (versions mock pour la demo)
YAS_API_KEY="demo_yas_key"
YAS_API_SECRET="demo_yas_secret"
FLOOZ_API_KEY="demo_flooz_key"
FLOOZ_API_SECRET="demo_flooz_secret"
TOGOCEL_API_KEY="demo_togocel_key"
MOOV_API_KEY="demo_moov_key"

# BCEAO (mock pour demo)
BCEAO_MERCHANT_ID="demo_merchant"
BCEAO_SECRET_KEY="demo_secret"

# App Config
NODE_ENV="production"
CORS_ORIGIN="https://your-frontend-url.netlify.app"
```

### 3. Base de données cloud (Recommandé pour demo)

#### Option A: Neon.tech (Gratuit)
1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer une nouvelle base de données PostgreSQL
3. Copier l'URL de connexion dans `DATABASE_URL`

#### Option B: Supabase (Gratuit)
1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Utiliser l'URL PostgreSQL dans `DATABASE_URL`

### 4. Structure des fichiers pour Netlify

```
/
├── netlify/
│   └── functions/
│       ├── api.js           # Point d'entrée principal
│       ├── auth.js          # Routes d'authentification
│       ├── wallet.js        # Routes portefeuille
│       ├── transport.js     # Routes transport
│       ├── marketplace.js   # Routes marketplace
│       └── webhooks.js      # Webhooks paiements
├── netlify.toml            # Configuration Netlify
├── package.json
└── README.md
```

### 5. Déploiement

```bash
# Build et déploiement
netlify deploy --prod

# Ou via Git (recommandé)
git add .
git commit -m "Demo deployment configuration"
git push origin main
```

### 6. Initialisation de la base de données

Après le déploiement, initialiser la base:

```bash
# Via fonction Netlify (automatique au premier appel)
curl https://your-app.netlify.app/.netlify/functions/api/health

# Ou manuellement via Prisma
npx prisma migrate deploy
npx prisma db seed
```

## 📱 Fonctionnalités disponibles en demo

### 🔐 Authentification
- **Endpoint**: `/.netlify/functions/auth/`
- **Features**: Inscription, connexion, OTP (simulé)
- **Test**: Utiliser les numéros +22812345678, +22812345679, +22812345680

### 💰 Portefeuille
- **Endpoint**: `/.netlify/functions/wallet/`
- **Features**: Consultation solde, historique, recharge (simulée)
- **Test**: Comptes pré-financés disponibles

### 🚗 Transport
- **Endpoint**: `/.netlify/functions/transport/`
- **Features**: Demande course, suivi temps réel (simulé)
- **Test**: Chauffeur disponible à Lomé

### 🛍️ Marketplace
- **Endpoint**: `/.netlify/functions/marketplace/`
- **Features**: Catalogue produits, commandes
- **Test**: Boutique "Ama Fashion" avec 3 produits

### 🔗 Webhooks
- **Endpoint**: `/.netlify/functions/webhooks/`
- **Features**: Simulation paiements YAS, FLOOZ, BCEAO
- **Test**: Transactions automatiques

## 🔍 Comment tester l'API

### Base URL
```
https://your-app-name.netlify.app/.netlify/functions/
```

### Endpoints principaux

#### 1. Health Check
```bash
GET /.netlify/functions/api/health
```

#### 2. Inscription
```bash
POST /.netlify/functions/auth/register
{
  "phoneNumber": "+22812345681",
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.tg"
}
```

#### 3. Connexion
```bash
POST /.netlify/functions/auth/login
{
  "phoneNumber": "+22812345678",
  "otpCode": "123456"
}
```

#### 4. Consulter le portefeuille
```bash
GET /.netlify/functions/wallet/balance
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 5. Lister les produits
```bash
GET /.netlify/functions/marketplace/products
```

#### 6. Demander une course
```bash
POST /.netlify/functions/transport/request
Authorization: Bearer YOUR_JWT_TOKEN
{
  "fromLat": 6.1319,
  "fromLng": 1.2228,
  "toLat": 6.1667,
  "toLng": 1.2833,
  "fromAddress": "Tokoin, Lomé",
  "toAddress": "Aéroport de Lomé"
}
```

## 🎯 Données de test disponibles

### Utilisateurs
- **Client**: +22812345678 (50,000 F CFA)
- **Chauffeur**: +22812345679 (25,000 F CFA, en ligne)
- **Boutique**: +22812345680 (100,000 F CFA)

### Produits (Boutique Ama Fashion)
1. Pagne Kente Traditionnel - 25,000 F CFA
2. Robe Africaine Moderne - 35,000 F CFA  
3. Bijoux en Perles Africaines - 15,000 F CFA

### OTP de test
- **Code universel**: `123456` (fonctionne pour tous les numéros en mode demo)

## 📊 Monitoring

### Logs Netlify
- Dashboard Netlify > Functions > Logs
- Erreurs et performances en temps réel

### Base de données
- Interface admin via Neon/Supabase
- Monitoring des requêtes et performances

## 🔧 Debug et troubleshooting

### Problèmes courants

1. **Fonction timeout**: Augmenter timeout dans netlify.toml
2. **Database connection**: Vérifier DATABASE_URL
3. **CORS errors**: Configurer CORS_ORIGIN correctement
4. **JWT errors**: Vérifier JWT_SECRET

### Support
- Logs détaillés disponibles via Netlify dashboard
- Variables d'environnement configurables via interface
- Redéploiement automatique via Git

---

**🎉 Votre backend Ecom est maintenant prêt pour la démo!**

Le client pourra tester toutes les fonctionnalités core:
- ✅ Authentification mobile
- ✅ Portefeuille et paiements
- ✅ Demande et suivi de courses
- ✅ Navigation marketplace
- ✅ Gestion commandes

*Toutes les intégrations Togo (YAS, FLOOZ, SMS) sont simulées pour la demo et pourront être activées avec les vraies clés API du client.*