# Guide de Déploiement Demo Netlify - Ecom Backend

## 🚀 Instructions complètes pour déployer la demo

### 1. Préparation des dépendances

Ajoutez dans votre `package.json` (section dependencies):

```json
{
  "dependencies": {
    "serverless-http": "^3.2.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "@prisma/client": "^5.6.0"
  }
}
```

### 2. Installation Netlify CLI

```bash
npm install -g netlify-cli
```

### 3. Connexion et initialisation

```bash
# Se connecter à Netlify
netlify login

# Initialiser le projet (dans le dossier racine)
netlify init
```

### 4. Configuration Base de Données Cloud

#### Option A: Neon.tech (Recommandé pour demo)
1. Aller sur [neon.tech](https://neon.tech)
2. Créer un compte gratuit
3. Créer une nouvelle base PostgreSQL
4. Copier l'URL de connexion

#### Option B: Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un projet
3. Récupérer l'URL PostgreSQL

### 5. Variables d'environnement Netlify

Dans le dashboard Netlify > Site settings > Environment variables:

```env
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-for-demo-2024
YAS_API_KEY=demo_yas_key
YAS_API_SECRET=demo_yas_secret
FLOOZ_API_KEY=demo_flooz_key
FLOOZ_API_SECRET=demo_flooz_secret
TOGOCEL_API_KEY=demo_togocel_key
MOOV_API_KEY=demo_moov_key
BCEAO_MERCHANT_ID=demo_merchant
BCEAO_SECRET_KEY=demo_secret
NODE_ENV=production
CORS_ORIGIN=*
```

### 6. Déploiement

#### Méthode 1: Via Git (Recommandé)
```bash
# Ajouter tous les fichiers
git add .
git commit -m "Backend demo configuration"
git push origin main
```

#### Méthode 2: Deploy direct
```bash
# Build et deploy
netlify deploy --prod
```

### 7. Initialisation de la base après déploiement

Une fois déployé, initialiser la base de données:

```bash
# Appeler l'endpoint d'initialisation
curl -X POST https://your-app.netlify.app/.netlify/functions/api/init-db
```

## 📱 Comment accéder au backend

### URL de base
```
https://your-app-name.netlify.app/.netlify/functions/
```

### Endpoints disponibles

#### 1. Santé de l'API
```
GET /.netlify/functions/api/health
```

#### 2. Informations de la demo
```
GET /.netlify/functions/api/info
```

#### 3. Authentification
```
POST /.netlify/functions/auth/register
POST /.netlify/functions/auth/login
POST /.netlify/functions/auth/verify-otp
GET /.netlify/functions/auth/profile
```

#### 4. Marketplace
```
GET /.netlify/functions/marketplace/stores
GET /.netlify/functions/marketplace/products
POST /.netlify/functions/marketplace/orders
```

## 🧪 Tests de l'API

### 1. Test de santé
```bash
curl https://your-app.netlify.app/.netlify/functions/api/health
```

### 2. Inscription utilisateur
```bash
curl -X POST https://your-app.netlify.app/.netlify/functions/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+22812345681",
    "firstName": "Demo",
    "lastName": "User",
    "email": "demo@example.tg"
  }'
```

### 3. Connexion (OTP = 123456)
```bash
curl -X POST https://your-app.netlify.app/.netlify/functions/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+22812345678",
    "otpCode": "123456"
  }'
```

### 4. Voir les produits
```bash
curl https://your-app.netlify.app/.netlify/functions/marketplace/products
```

## 📊 Données de test pré-chargées

### Utilisateurs
- **Client**: +22812345678 (50,000 F CFA)
- **Chauffeur**: +22812345679 (25,000 F CFA)
- **Boutique**: +22812345680 (100,000 F CFA)

### Boutique "Ama Fashion"
- Pagne Kente Traditionnel - 25,000 F CFA
- Robe Africaine Moderne - 35,000 F CFA
- Bijoux en Perles Africaines - 15,000 F CFA

### Code OTP universel
- `123456` (fonctionne pour tous les comptes en demo)

## 🔍 Debug et monitoring

### Logs Netlify
- Dashboard > Functions > View logs
- Erreurs et performances en temps réel

### Vérification base de données
```bash
# Test de connexion DB
curl https://your-app.netlify.app/.netlify/functions/api/health
```

## 📞 Support client

### Documentation API complète
L'endpoint `/api/info` retourne toutes les informations nécessaires pour utiliser l'API.

### Fonctionnalités démo
- ✅ Authentification SMS (simulée)
- ✅ Portefeuille et transactions
- ✅ Marketplace avec produits
- ✅ Système de commandes
- ✅ Transport (via autres fonctions)

---

**🎯 Résultat attendu**: Une API REST complètement fonctionnelle déployée sur Netlify, accessible via HTTPS, avec toutes les données de test pré-chargées pour une démonstration client immédiate.

Le client peut tester toutes les fonctionnalités core de l'application via des appels API ou via une interface frontend connectée à ces endpoints.