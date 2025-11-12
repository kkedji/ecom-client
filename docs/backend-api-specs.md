# Backend API Ecom - Spécifications Techniques

## 🏗️ Architecture Backend

### Stack Technologique Recommandée
- **Runtime**: Node.js + Express.js ou Python + FastAPI
- **Base de données**: PostgreSQL (principal) + Redis (cache)
- **ORM**: Prisma (Node.js) ou SQLAlchemy (Python)
- **Authentification**: JWT + Refresh Tokens
- **API Documentation**: Swagger/OpenAPI
- **Monitoring**: Winston (logs) + Prometheus (métriques)

### Structure des Microservices

```
ecom-backend/
├── auth-service/          # Authentification et gestion utilisateurs
├── wallet-service/        # Portefeuille et transactions
├── transport-service/     # Gestion courses et drivers
├── marketplace-service/   # Boutiques et produits
├── notification-service/  # SMS et push notifications
├── payment-service/       # Intégrations paiement
├── analytics-service/     # Rapports et analytics
└── api-gateway/          # Point d'entrée unifié
```

## 📊 Schéma de Base de Données

### Tables Principales

#### 1. Utilisateurs et Authentification
```sql
-- Table users (tous les utilisateurs)
users (
  id UUID PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  user_type ENUM('client', 'driver', 'store_owner', 'admin'),
  status ENUM('active', 'suspended', 'pending_verification'),
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table pour l'authentification
user_auth (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  password_hash VARCHAR(255),
  refresh_token VARCHAR(500),
  last_login TIMESTAMP,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- OTP et vérifications
verification_codes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  phone VARCHAR(15),
  code VARCHAR(6),
  type ENUM('registration', 'login', 'password_reset'),
  expires_at TIMESTAMP,
  used_at TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Portefeuille et Transactions
```sql
-- Portefeuilles utilisateurs
wallets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  balance DECIMAL(15,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'XOF',
  status ENUM('active', 'frozen', 'closed'),
  daily_limit DECIMAL(15,2) DEFAULT 50000.00,
  monthly_limit DECIMAL(15,2) DEFAULT 500000.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Historique des transactions
transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id),
  type ENUM('credit', 'debit'),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  category ENUM('recharge', 'transport', 'shopping', 'delivery', 'transfer', 'commission'),
  description TEXT,
  reference VARCHAR(100) UNIQUE,
  status ENUM('pending', 'completed', 'failed', 'cancelled'),
  metadata JSONB, -- Données additionnelles flexibles
  related_service_id UUID, -- ID du service lié (course, commande, etc.)
  payment_method ENUM('yas', 'flooz', 'visa', 'pispi', 'wallet'),
  external_reference VARCHAR(255), -- Référence externe (opérateur mobile, banque)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Méthodes de paiement enregistrées
payment_methods (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type ENUM('mobile_money', 'card', 'bank_account'),
  provider ENUM('yas', 'flooz', 'visa', 'mastercard', 'pispi'),
  identifier VARCHAR(255), -- Numéro de téléphone, 4 derniers chiffres carte, etc.
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. Transport et Courses
```sql
-- Profils drivers
drivers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  license_number VARCHAR(50) UNIQUE,
  vehicle_type ENUM('taxi', 'moto', 'car', 'van'),
  vehicle_plate VARCHAR(20),
  is_online BOOLEAN DEFAULT FALSE,
  current_location POINT,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_rides INTEGER DEFAULT 0,
  status ENUM('active', 'suspended', 'pending_approval'),
  documents JSONB, -- Permis, assurance, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Courses
rides (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  service_type ENUM('taxi', 'lux', 'driver', 'delivery'),
  pickup_location POINT NOT NULL,
  pickup_address TEXT,
  destination_location POINT NOT NULL,
  destination_address TEXT,
  distance_km DECIMAL(10,2),
  estimated_duration INTEGER, -- en minutes
  status ENUM('requested', 'accepted', 'in_progress', 'completed', 'cancelled'),
  fare DECIMAL(10,2),
  payment_status ENUM('pending', 'paid', 'refunded'),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  customer_comment TEXT,
  driver_comment TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. Marketplace et Boutiques
```sql
-- Boutiques
stores (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  address TEXT,
  location POINT,
  phone VARCHAR(15),
  email VARCHAR(255),
  logo_url VARCHAR(500),
  cover_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  delivery_time_min INTEGER DEFAULT 30,
  delivery_time_max INTEGER DEFAULT 60,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_orders INTEGER DEFAULT 0,
  business_hours JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Produits
products (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  images JSONB, -- URLs des images
  specifications JSONB, -- Caractéristiques produit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Commandes
orders (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  order_number VARCHAR(20) UNIQUE,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'),
  subtotal DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  payment_status ENUM('pending', 'paid', 'refunded'),
  delivery_address TEXT,
  delivery_location POINT,
  special_instructions TEXT,
  estimated_delivery TIMESTAMP,
  placed_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Détails des commandes
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📡 API Endpoints Principaux

### 1. Authentification (/api/auth)
```javascript
POST /api/auth/send-otp          // Envoi code OTP
POST /api/auth/verify-otp        // Vérification OTP
POST /api/auth/register          // Inscription
POST /api/auth/login             // Connexion
POST /api/auth/refresh           // Renouvellement token
POST /api/auth/logout            // Déconnexion
```

### 2. Portefeuille (/api/wallet)
```javascript
GET  /api/wallet/balance         // Solde actuel
GET  /api/wallet/transactions    // Historique transactions
POST /api/wallet/recharge        // Rechargement
POST /api/wallet/transfer        // Transfert
GET  /api/wallet/methods         // Méthodes de paiement
POST /api/wallet/methods         // Ajouter méthode
```

### 3. Transport (/api/transport)
```javascript
POST /api/transport/request-ride // Demander course
GET  /api/transport/rides        // Historique courses
PUT  /api/transport/rides/:id    // Mettre à jour course
POST /api/transport/rating       // Noter course

// Pour les drivers
GET  /api/driver/pending-rides   // Courses disponibles
POST /api/driver/accept-ride     // Accepter course
PUT  /api/driver/status          // Statut en ligne/hors ligne
GET  /api/driver/earnings        // Gains
```

### 4. Marketplace (/api/marketplace)
```javascript
GET  /api/stores                 // Liste boutiques
GET  /api/stores/:id             // Détails boutique
GET  /api/stores/:id/products    // Produits d'une boutique
POST /api/orders                 // Passer commande
GET  /api/orders                 // Mes commandes
PUT  /api/orders/:id             // Mettre à jour commande

// Pour les boutiques
GET  /api/store/dashboard        // Tableau de bord
GET  /api/store/orders           // Commandes reçues
GET  /api/store/products         // Mes produits
POST /api/store/products         // Ajouter produit
PUT  /api/store/products/:id     // Modifier produit
```

### 5. Analytics (/api/analytics)
```javascript
GET  /api/analytics/overview     // Vue d'ensemble
GET  /api/analytics/transactions // Rapports transactions
GET  /api/analytics/rides        // Rapports transport
GET  /api/analytics/orders       // Rapports commandes
GET  /api/analytics/revenue      // Rapports revenus
POST /api/analytics/export       // Export données
```

## 📈 Système de Rapports et Exports

### Rapports Automatiques
```javascript
// Types de rapports disponibles
const reportTypes = {
  DAILY_SUMMARY: 'daily_summary',
  WEEKLY_REVENUE: 'weekly_revenue', 
  MONTHLY_ANALYTICS: 'monthly_analytics',
  TRANSACTION_DETAIL: 'transaction_detail',
  STORE_PERFORMANCE: 'store_performance',
  DRIVER_EARNINGS: 'driver_earnings'
};

// Formats d'export
const exportFormats = {
  PDF: 'pdf',
  EXCEL: 'xlsx',
  CSV: 'csv',
  JSON: 'json'
};
```

### API de Génération de Rapports
```javascript
POST /api/reports/generate
{
  "type": "monthly_analytics",
  "format": "xlsx",
  "date_from": "2025-10-01",
  "date_to": "2025-10-31",
  "filters": {
    "store_id": "uuid",
    "service_type": "transport"
  }
}

// Réponse
{
  "report_id": "uuid",
  "status": "generating",
  "download_url": null,
  "estimated_completion": "2025-10-19T15:30:00Z"
}
```

## 🔄 Intégrations Nécessaires

### 1. Service SMS (OTP)
- **Opérateurs locaux**: Togocel, Moov Togo
- **Alternatives**: Twilio, AWS SNS
- **Configuration requise**: 
  - Contrats avec opérateurs
  - API keys et endpoints
  - Templates de messages

### 2. Paiements Mobile Money
- **YAS (Togocel)**: API d'intégration directe
- **FLOOZ (Moov)**: SDK mobile + API
- **Configuration requise**:
  - Agrément auprès des opérateurs
  - Certificats de sécurité
  - Clés API et webhook endpoints

### 3. Cartes Bancaires
- **Visa/Mastercard**: Via agrégateurs locaux
- **Recommandé**: Partenariat avec banque locale
- **Configuration requise**:
  - Certification PCI DSS
  - Terminal de paiement virtuel
  - Clés de cryptage

### 4. PI-SPI BCEAO
- **Plateforme officielle**: Système interbancaire
- **Configuration requise**:
  - Agrément BCEAO
  - Certificats bancaires
  - Interface API dédiée

## 🔐 Sécurité et Conformité

### Mesures de Sécurité
```javascript
// Chiffrement des données sensibles
const securityConfig = {
  encryption: 'AES-256-GCM',
  hashing: 'bcrypt',
  jwt_secret: process.env.JWT_SECRET,
  refresh_token_expiry: '7d',
  access_token_expiry: '15m'
};

// Validation des transactions
const transactionLimits = {
  daily_limit: 50000,    // 50,000 F CFA
  monthly_limit: 500000, // 500,000 F CFA
  single_transaction_max: 25000
};
```

### Conformité Réglementaire
- **KYC (Know Your Customer)**: Vérification identité via OTP
- **AML (Anti-Money Laundering)**: Surveillance transactions
- **BCEAO**: Respect des directives bancaires
- **CNIL Togo**: Protection données personnelles

Cette architecture backend fournit une base solide pour gérer tous les aspects de l'écosystème Ecom, avec une scalabilité et une sécurité appropriées pour un service financier au Togo.