# ECOM Backend API

Backend API pour l'application ECOM - Transport, Marketplace et Wallet au Togo.

## 🚀 Déploiement sur Render.com

### Variables d'environnement requises :

```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
NODE_ENV=production
PORT=5000
```

**⚠️ IMPORTANT:** Ne JAMAIS commiter les vraies valeurs. Configurer ces variables directement sur Render.com.

## 📦 Installation locale

```bash
npm install
npm run generate  # Générer Prisma Client
npm run dev       # Démarrer en mode développement
```

## 🔗 Endpoints principaux

- `GET /health` - Health check
- `POST /api/auth/login` - Connexion utilisateur
- `GET /api/user/profile` - Profil utilisateur
- `GET /api/wallet/balance` - Solde du wallet
- `POST /api/wallet/add-funds` - Recharger le wallet

## 🛠 Technologies

- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
