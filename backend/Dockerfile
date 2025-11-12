# Backend Dockerfile - Use Debian instead of Alpine for OpenSSL 1.1 compatibility
FROM node:18-bullseye-slim

# Install system dependencies including OpenSSL 1.1
RUN apt-get update -y && \
    apt-get install -y \
    postgresql-client \
    openssl \
    libssl1.1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma/ ./prisma/

# Installer les dépendances
RUN npm ci --only=production

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY src/ ./src/

# Créer un utilisateur non-root (Debian syntax)
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Changer la propriété des fichiers
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Commande de démarrage
CMD ["node", "src/server.js"]