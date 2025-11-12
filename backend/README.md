# ECOM Backend API

Backend API pour l'application ECOM - Transport, Marketplace et Wallet au Togo.

## 🚀 Déploiement sur Render.com

### Variables d'environnement requises :

```env
DATABASE_URL=postgresql://neondb_owner:npg_akEi5GZ7dBXM@ep-muddy-lake-agah6z3u-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=a8f5e9c3b2d4f7a1e6c8b9d2f4a7e1c3b5d8f2a4e7c1b9d6f3a8e2c5b7d1f4a9e3c6b8d2f5a1e7c4b9d3f6a2e8c1b5d7f4a9e2c6b3d8f1a5e7c4b2d9f6a3e1c8b5d2f7a4e9c3b6d1f8a2e5c7b4d9f3a6e1c8b2d5f7a4e9
JWT_EXPIRES_IN=24h
NODE_ENV=production
PORT=5000
```

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
