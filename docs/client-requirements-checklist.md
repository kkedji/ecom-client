# 📋 Checklist Client - Informations Requises pour Déploiement Ecom

## 🏦 **1. COMPTES & PARTENARIATS OBLIGATOIRES**

### Mobile Money (YAS - Togocel)
- [ ] **Contrat Merchant YAS** avec Togocel
- [ ] **Merchant ID YAS** (ex: YAS_MERCHANT_001)
- [ ] **API Key YAS** (clé secrète)
- [ ] **Webhook Secret YAS** (pour sécuriser les callbacks)
- [ ] **URL de l'API YAS** (prod: https://api.yas.tg)

### Mobile Money (FLOOZ - Moov)
- [ ] **Contrat Merchant FLOOZ** avec Moov Togo
- [ ] **Merchant ID FLOOZ** (ex: FLOOZ_MERCHANT_001)
- [ ] **API Key FLOOZ** (clé secrète)
- [ ] **Webhook Secret FLOOZ** (pour sécuriser les callbacks)
- [ ] **URL de l'API FLOOZ** (prod: https://api.flooz.tg)

### SMS Services (Obligatoire pour OTP)
**Option A: Togocel SMS**
- [ ] **Contrat SMS Business** avec Togocel
- [ ] **Short Code dédié** (ex: 2024)
- [ ] **API Key SMS Togocel**
- [ ] **URL API SMS** (ex: https://sms.togocel.tg/api)

**Option B: Moov SMS**
- [ ] **Contrat SMS Business** avec Moov
- [ ] **Short Code dédié** (ex: 2025)
- [ ] **API Key SMS Moov**
- [ ] **URL API SMS** (ex: https://sms.moov.tg/api)

### Banques/Cartes (Optionnel Phase 1)
**PI-SPI BCEAO (recommandé)**
- [ ] **Certification BCEAO** (processus 2-3 mois)
- [ ] **Merchant ID BCEAO**
- [ ] **Certificat numérique BCEAO** (.pem file)
- [ ] **API Key BCEAO**

## 🏢 **2. INFORMATIONS LÉGALES ENTREPRISE**

### Identité Entreprise
- [ ] **Nom complet de l'entreprise**
- [ ] **RCCM** (Registre de Commerce)
- [ ] **IFU** (Identifiant Fiscal Unique)
- [ ] **Adresse siège social**
- [ ] **Téléphone entreprise**
- [ ] **Email entreprise** (support@ecom.tg)

### Responsable Technique
- [ ] **Nom/Prénom responsable IT**
- [ ] **Téléphone responsable IT**
- [ ] **Email responsable IT**

## 🌐 **3. INFRASTRUCTURE & DOMAINES**

### Domaine & Certificats
- [ ] **Nom de domaine principal** (ex: ecom.tg)
- [ ] **Sous-domaines API** (ex: api.ecom.tg)
- [ ] **Certificat SSL** (Let's Encrypt ou payant)

### Hébergement (3 options)
**Option A: VPS Local (Recommandé)**
- [ ] **VPS chez Café Informatique** ou **Galaxy Telecom**
- [ ] **Specs minimum**: 4 CPU, 8GB RAM, 100GB SSD
- [ ] **Bande passante**: Illimitée
- [ ] **IP fixe**

**Option B: Cloud International**
- [ ] **Compte AWS/DigitalOcean/Linode**
- [ ] **Région**: eu-west-1 (plus proche)
- [ ] **Budget mensuel**: $50-100

**Option C: Serveur Dédié**
- [ ] **Serveur physique** chez un datacenter togolais
- [ ] **Accès root/administrateur**

### Base de Données
- [ ] **PostgreSQL 15+** (inclus dans VPS ou séparé)
- [ ] **Redis** (pour cache et sessions)
- [ ] **Backups automatiques** configurés

## 💳 **4. CONFIGURATION FINANCIÈRE**

### Comptes Bancaires
- [ ] **Compte professionnel** pour recevoir les fonds
- [ ] **RIB/IBAN** du compte principal
- [ ] **Autorisations virement** pour withdrawals

### Tarification Services
- [ ] **Commission courses** (ex: 10% du montant)
- [ ] **Commission marketplace** (ex: 5% par vente)
- [ ] **Frais de retrait** (ex: 2%)
- [ ] **Frais de transfert** (ex: 1% si > 5000 F)

### Limites Réglementaires
- [ ] **Limite dépôt journalier** par utilisateur
- [ ] **Limite retrait journalier** par utilisateur
- [ ] **Seuil KYC** (ex: 500,000 F CFA cumulé)

## 📱 **5. SERVICES EXTERNES (Optionnels)**

### Géolocalisation
- [ ] **Google Maps API Key** (ou alternative)
- [ ] **Budget mensuel Maps** (estimé)

### Notifications Push
- [ ] **Compte Firebase** (gratuit)
- [ ] **OneSignal** (alternative)

### Analytics
- [ ] **Google Analytics** property
- [ ] **Mixpanel/Amplitude** (optionnel)

### Stockage Images
- [ ] **Cloudinary** account (ou AWS S3)
- [ ] **Budget stockage** mensuel

## 🚨 **6. URGENCE & PRIORITÉS**

### Phase 1 (MVP - 2 semaines) - OBLIGATOIRE
- ✅ **YAS OU FLOOZ** (au moins un des deux)
- ✅ **SMS Togocel OU Moov** (pour OTP)
- ✅ **Domaine + Certificat SSL**
- ✅ **VPS/Hébergement**

### Phase 2 (1 mois) - Important
- 🔶 **Deuxième Mobile Money** (YAS + FLOOZ)
- 🔶 **PI-SPI BCEAO** (cartes bancaires)
- 🔶 **Google Maps API**

### Phase 3 (2-3 mois) - Nice to have
- 🔷 **Visa/Mastercard international**
- 🔷 **Analytics avancés**
- 🔷 **Multi-langues** (Français + Ewe + Kabiye)

## 📞 **CONTACTS RECOMMANDÉS AU TOGO**

### Mobile Money
- **Togocel YAS**: Direction Commerciale - +228 22 22 12 34
- **Moov FLOOZ**: Département Entreprise - +228 22 61 00 00

### Hébergement Local
- **Café Informatique**: +228 22 61 64 64
- **Galaxy Telecom**: +228 22 20 30 30
- **Togo Telecom Data**: +228 22 41 10 00

### Certification BCEAO
- **BCEAO Lomé**: Avenue de la Marina - +228 22 21 25 06

---

## ⚡ **ACTION IMMÉDIATE REQUISE**

**Pour commencer le déploiement cette semaine, j'ai besoin minimum de :**

1. ✅ **1 contrat Mobile Money** (YAS ou FLOOZ)
2. ✅ **1 contrat SMS** (Togocel ou Moov)  
3. ✅ **1 VPS/serveur** avec accès
4. ✅ **1 domaine** configuré

**Tout le reste peut être ajouté progressivement !**