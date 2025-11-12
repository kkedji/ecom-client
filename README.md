# Ecom — PWA Mobilité Durable 🌱

Application Progressive Web App (PWA) pour la mobilité durable, marketplace d'énergies renouvelables et gestion de l'empreinte carbone.

## 🚀 Déploiement Live

**URL de Test** : [https://ecom-pwa.netlify.app](https://ecom-pwa.netlify.app) *(à venir)*

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-BADGE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)

## 📱 Fonctionnalités

- ✅ **Interface Mobile-First** : Design adapté aux captures d'écran fournies
- ✅ **Navigation Drawer** : Menu latéral avec profil utilisateur
- ✅ **Multilingue** : Français (principal) + Anglais
- ✅ **PWA Complète** : Service Worker + Manifest + Offline
- ✅ **Pages Implémentées** :
  - 🏠 Accueil (portefeuille + services)
  - ⚙️ Paramètres (profil + préférences)
  - ❓ Aide (support + FAQ)
  - 🏷️ Réductions (codes promo + parrainage)
  - 📚 Mes Activités (courses + commandes)
  - ✍️ Inscription (formulaire complet)

## 🛠️ Technologies

- **Frontend** : React 18 + Vite
- **Routing** : React Router DOM v6
- **Styling** : CSS natif (mobile-first)
- **PWA** : Service Worker + Web App Manifest
- **Déploiement** : Netlify (optimisé)

## 💻 Développement Local

### Prérequis
- Node.js 16+
- npm 8+

### Installation & Lancement

```powershell
# Cloner le projet
git clone https://github.com/VOTRE-USERNAME/ecom-pwa.git
cd ecom-pwa

# Autoriser l'exécution de scripts (Windows PowerShell)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173) dans votre navigateur.

### Scripts Disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Aperçu du build
```

## 🎯 Pages de Test

- **Accueil** : `/` - Portefeuille + grid services
- **Paramètres** : `/settings` - Profil utilisateur
- **Aide** : `/help` - Support client
- **Réductions** : `/marketplace` - Codes promo
- **Activités** : `/transport` - Courses/commandes
- **Inscription** : `/signup` - Formulaire passager

## 📊 Performance & PWA

### Lighthouse Score Objectifs
- Performance : 90+
- Accessibility : 95+
- Best Practices : 95+
- SEO : 90+
- PWA : 95+

### Fonctionnalités PWA
- ✅ Installation ("Add to Home Screen")
- ✅ Mode offline fonctionnel
- ✅ Service Worker avec cache intelligent
- ✅ Manifest complet avec icônes
- ✅ Shortcuts (livraison, marketplace)

## 🔧 Configuration Netlify

Le projet inclut une configuration complète pour Netlify :

- `netlify.toml` : Build settings + redirects SPA + headers sécurisés
- Service Worker optimisé pour cache CDN
- Meta tags SEO complets (Open Graph, Twitter Cards)
- Optimisations bundle (code splitting, compression)

## 🧪 Tests & Validation

### Tests Recommandés
1. **Navigation** : Toutes les pages + drawer
2. **Responsive** : Mobile, tablette, desktop
3. **PWA** : Installation + mode offline
4. **Performance** : Audit Lighthouse
5. **Cross-browser** : Chrome, Firefox, Safari

### Outils de Test
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- Chrome DevTools (Application tab)

## 📚 Documentation

- [Architecture Technique](./docs/architecture.md)
- [Plan de Développement](./docs/development-plan.md)
- [Monétisation & Gamification](./docs/monetization-gamification.md)
- [Exemples de Code](./docs/code-examples.md)
- [Guide Déploiement Netlify](./docs/netlify-deployment.md)

## 🎨 Design System

### Couleurs
- **Primary** : `#1B5E20` (vert foncé)
- **Primary Light** : `#4CAF50` (vert clair)
- **Background** : `#F5F5F5` (gris clair)
- **Surface** : `#FFFFFF` (blanc)
- **Text** : `#212121` (noir)

### Typographie
- **Font** : System fonts (-apple-system, Roboto, etc.)
- **Sizes** : 12px (labels) → 32px (logos)
- **Weights** : 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

- **Email** : skksean28@gmail.com
- **Tel** : +22890151369

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Fait avec 💚 pour un monde plus durable**
