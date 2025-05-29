# NetAlerte Mobile

Application mobile pour signaler les problèmes de réseau au Cameroun.

## Prérequis

- Node.js >= 14
- npm ou yarn
- React Native CLI
- Android Studio (pour Android)
- Xcode (pour iOS, Mac uniquement)

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/votre-org/netalerte-mobile.git
cd netalerte-mobile
```

2. Installer les dépendances :
```bash
npm install
# ou
yarn install
```

3. Configuration des variables d'environnement :
- Copier `.env.example` vers `.env.development` et `.env.production`
- Remplir les variables nécessaires

4. Pour Android :
- Configurer les variables d'environnement Android
- Créer un fichier `android/local.properties` avec le chemin du SDK Android

5. Pour iOS :
```bash
cd ios
pod install
cd ..
```

## Démarrage

### Développement
```bash
npm start
# ou
yarn start
```

### Android
```bash
npm run android
# ou
yarn android
```

### iOS
```bash
npm run ios
# ou
yarn ios
```

## Structure du projet

```
mobile/
  ├── src/
  │   ├── screens/      # Écrans de l'application
  │   ├── components/   # Composants réutilisables
  │   ├── navigation/   # Configuration de la navigation
  │   ├── services/     # Services (API, etc.)
  │   └── utils/        # Utilitaires
  ├── assets/          # Images, fonts, etc.
  └── App.js           # Point d'entrée
```

## Fonctionnalités

- Signalement de problèmes réseau
- Géolocalisation
- Suivi des signalements
- Notifications push
- Mode hors ligne

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 