-- Script d'initialisation PostgreSQL pour Ecom
-- Ce script est exécuté automatiquement lors du premier démarrage du conteneur

-- Créer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Créer un utilisateur pour l'application avec permissions limitées
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ecom_app') THEN
        CREATE ROLE ecom_app LOGIN PASSWORD 'ecom_app_password_2024';
    END IF;
END
$$;

-- Accorder les permissions nécessaires
GRANT CONNECT ON DATABASE ecom_db TO ecom_app;
GRANT USAGE ON SCHEMA public TO ecom_app;
GRANT CREATE ON SCHEMA public TO ecom_app;

-- Configurer PostgreSQL pour les performances
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Configuration pour l'Afrique de l'Ouest
ALTER SYSTEM SET timezone = 'Africa/Lome';
ALTER SYSTEM SET lc_monetary = 'fr_TG.UTF-8';
ALTER SYSTEM SET lc_numeric = 'fr_TG.UTF-8';

-- Recharger la configuration
SELECT pg_reload_conf();

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données Ecom initialisée avec succès pour le Togo';
END
$$;