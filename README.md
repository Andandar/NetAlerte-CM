# NetAlerte CM

Application de signalement des problèmes de réseau mobile au Cameroun.

## 🎯 Objectif

NetAlerte CM permet aux citoyens de signaler rapidement les problèmes de réseau mobile (appels, SMS, internet) aux opérateurs et institutions compétentes.

## 🏗️ Architecture

Le projet est composé de trois parties principales :

1. **Application Mobile** (React Native)
   - Application Android légère
   - Signalement rapide des problèmes
   - Fonctionnement hors ligne
   - Pas de compte utilisateur requis

2. **Dashboard Web**
   - Interface d'administration
   - Visualisation des signalements
   - Statistiques en temps réel
   - Gestion des utilisateurs

3. **Backend**
   - API REST (Node.js + Express)
   - Base de données PostgreSQL
   - Authentification JWT
   - Documentation Swagger

## 🚀 Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- Android Studio (pour l'application mobile)
- Git
- Docker et Docker Compose (optionnel)

### Installation du Backend

```bash
cd backend
npm install
cp .env.example .env  # Configurez vos variables d'environnement
npm run dev
```

### Installation du Dashboard

```bash
cd dashboard
npm install
cp .env.example .env
npm start
```

### Installation de l'Application Mobile

```bash
cd mobile
npm install
cp .env.example .env
npx react-native run-android
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` dans chaque dossier (backend, dashboard, mobile) en vous basant sur les fichiers `.env.example`.

### Base de données

```bash
# Création de la base de données
createdb netalerte_cm

# Migration de la base de données
cd backend
npm run migrate
```

## 📱 Fonctionnalités

### Application Mobile
- Signalement rapide des problèmes
- Géolocalisation automatique
- Mode hors ligne
- Notifications push

### Dashboard
- Tableau de bord en temps réel
- Gestion des utilisateurs
- Statistiques détaillées
- Export des données

### Backend
- API RESTful
- Authentification JWT
- Validation des données
- Documentation Swagger

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- Votre Nom - Développeur Principal

## 🙏 Remerciements

- Tous les contributeurs
- La communauté open source