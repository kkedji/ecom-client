#!/bin/bash

# Script de déploiement Ecom Backend
# Usage: ./deploy.sh [development|production]

set -e

ENVIRONMENT=${1:-development}
PROJECT_NAME="ecom"

echo "🚀 Déploiement Ecom Backend - Environnement: $ENVIRONMENT"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose n'est pas installé"
fi

# Créer les répertoires nécessaires
log "Création des répertoires..."
mkdir -p logs nginx/ssl uploads

# Configuration de l'environnement
if [ "$ENVIRONMENT" = "production" ]; then
    log "Configuration pour production..."
    
    # Vérifier que le fichier .env.production existe
    if [ ! -f ".env.production" ]; then
        warn "Fichier .env.production non trouvé. Création d'un template..."
        cp .env.example .env.production
        error "Veuillez configurer .env.production avec les vraies valeurs avant de redéployer"
    fi
    
    # Utiliser le fichier d'environnement de production
    export COMPOSE_FILE="docker-compose.yml:docker-compose.prod.yml"
    export ENV_FILE=".env.production"
    
else
    log "Configuration pour développement..."
    
    # Créer .env.development si nécessaire
    if [ ! -f ".env.development" ]; then
        log "Création du fichier .env.development..."
        cp .env.example .env.development
    fi
    
    export ENV_FILE=".env.development"
fi

# Charger les variables d'environnement
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
    log "Variables d'environnement chargées depuis $ENV_FILE"
else
    warn "Fichier d'environnement $ENV_FILE non trouvé"
fi

# Arrêter les conteneurs existants
log "Arrêt des conteneurs existants..."
docker-compose down --remove-orphans || true

# Nettoyer les images obsolètes en production
if [ "$ENVIRONMENT" = "production" ]; then
    log "Nettoyage des images obsolètes..."
    docker system prune -f
fi

# Construire et démarrer les services
log "Construction et démarrage des services..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose up -d --build --force-recreate
else
    docker-compose up -d --build
fi

# Attendre que la base de données soit prête
log "Attente de la base de données..."
sleep 10

# Exécuter les migrations Prisma
log "Exécution des migrations de base de données..."
docker-compose exec backend npx prisma migrate deploy || warn "Échec des migrations (normal au premier déploiement)"

# Générer le client Prisma
log "Génération du client Prisma..."
docker-compose exec backend npx prisma generate

# Seed de la base de données en développement
if [ "$ENVIRONMENT" = "development" ]; then
    log "Seed de la base de données..."
    docker-compose exec backend npm run seed || warn "Échec du seed (normal si déjà fait)"
fi

# Vérifier la santé des services
log "Vérification de la santé des services..."
sleep 5

# Test de l'API
API_URL="http://localhost:5000"
if [ "$ENVIRONMENT" = "production" ]; then
    API_URL="https://api.ecom.tg"
fi

if curl -f "$API_URL/health" &> /dev/null; then
    log "✅ API backend fonctionnelle: $API_URL/health"
else
    warn "❌ API backend non accessible"
fi

# Afficher les logs en temps réel en développement
if [ "$ENVIRONMENT" = "development" ]; then
    log "Affichage des logs (Ctrl+C pour arrêter)..."
    docker-compose logs -f backend
else
    log "✅ Déploiement terminé!"
    log "📊 API Documentation: $API_URL/api-docs"
    log "🏥 Health Check: $API_URL/health"
    log "📱 Webhooks: $API_URL/api/webhooks/health"
    
    echo ""
    log "📋 Commandes utiles:"
    echo "  - Voir les logs: docker-compose logs -f backend"
    echo "  - Redémarrer: docker-compose restart backend"
    echo "  - Arrêter: docker-compose down"
    echo "  - Mise à jour: ./deploy.sh production"
fi