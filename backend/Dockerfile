FROM node:18-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# Création des dossiers de logs
RUN mkdir -p logs

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"] 