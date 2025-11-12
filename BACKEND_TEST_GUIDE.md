# 🧪 Guide de Test Backend API

## Prérequis
- Node.js v22+ installé
- npm install complété dans `/backend`

## Étapes pour tester le backend

### 1. Démarrer le serveur backend

Ouvrir un terminal dans le dossier `backend` :

```bash
cd backend
npm run dev
```

Le serveur devrait démarrer sur **http://localhost:5000**

Vous devriez voir :
```
🚀 Serveur Ecom démarré sur le port 5000
📖 Documentation API: http://localhost:5000/api-docs
🏥 Health check: http://localhost:5000/health
🔧 Mode développement activé
```

### 2. Vérifier le health check

Dans un navigateur ou avec curl, testez :
```
http://localhost:5000/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2024-11-12T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### 3. Démarrer le frontend

Dans un autre terminal, à la racine du projet :

```bash
npm run dev
```

Le frontend devrait démarrer sur **http://localhost:5173**

### 4. Accéder à la page de test

Ouvrez votre navigateur et allez sur :
```
http://localhost:5173/api-test
```

### 5. Tests disponibles sur la page

#### Test 1: Health Check ✅
- Cliquez sur "Retester"
- Vérifie que le backend est accessible
- Si ✅ apparaît, le backend est connecté !

#### Test 2: Login 🔐
- Teste l'authentification
- Endpoint: `POST /api/auth/login`
- Utilisera des credentials de test

#### Test 3: Wallet Balance 💰
- Teste la récupération du solde
- Endpoint: `GET /api/wallet/balance`
- Nécessite une connexion réussie

#### Test 4: Profile 👤
- Teste la récupération du profil
- Endpoint: `GET /api/user/profile`
- Nécessite une connexion réussie

## Configuration

### Variables d'environnement

Le fichier `.env` a été créé dans `/backend` avec des valeurs de développement.

Pour modifier l'URL de l'API dans le frontend, créez un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:5000
```

## Endpoints disponibles

### Santé
- `GET /health` - Health check du serveur

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/verify-otp` - Vérification OTP
- `POST /api/auth/refresh` - Rafraîchir le token

### Utilisateur
- `GET /api/user/profile` - Profil utilisateur
- `PUT /api/user/profile` - Modifier le profil

### Portefeuille
- `GET /api/wallet/balance` - Solde du portefeuille
- `POST /api/wallet/add-funds` - Ajouter des fonds
- `GET /api/wallet/transactions` - Historique des transactions

### Transport
- `POST /api/transport/request` - Demander une course
- `GET /api/transport/status/:rideId` - Statut d'une course
- `GET /api/transport/history` - Historique des courses

### Marketplace
- `GET /api/marketplace/products` - Liste des produits
- `GET /api/marketplace/categories` - Catégories
- `POST /api/marketplace/order` - Créer une commande

### Notifications
- `GET /api/notifications` - Liste des notifications
- `PUT /api/notifications/:id/read` - Marquer comme lu

## Documentation API complète

Une fois le backend démarré, accédez à la documentation Swagger :
```
http://localhost:5000/api-docs
```

## Résolution de problèmes

### Le backend ne démarre pas

1. Vérifier que le port 5000 n'est pas occupé
2. Vérifier le fichier `.env` dans `/backend`
3. Relancer `npm install` dans `/backend`

### Erreur de connexion CORS

Si vous voyez des erreurs CORS dans la console :
- Vérifier que le backend accepte `http://localhost:5173`
- Fichier `backend/src/server.js` ligne ~33

### Base de données

Le backend utilise SQLite en développement (fichier `dev.db`).
Pas besoin de PostgreSQL pour les tests initiaux.

## Prochaines étapes

Une fois les tests passés :
1. ✅ Backend connecté et fonctionnel
2. 🔄 Intégrer l'API dans les composants existants
3. 🔐 Implémenter l'authentification complète
4. 💳 Connecter le système de paiement mobile money
5. 📱 Ajouter les WebSockets pour le temps réel

## Support

En cas de problème, vérifiez :
- Les logs du terminal backend
- La console du navigateur (F12)
- La page `/api-test` pour les résultats détaillés
