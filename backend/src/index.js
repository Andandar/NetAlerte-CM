require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const winston = require('winston');
const https = require('https');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const cron = require('node-cron');
const { generateMonthlyReport } = require('./utils/autoReport');

// Configuration du logger
const loggerWinston = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  loggerWinston.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
});
app.use(limiter);

// Documentation API
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Planification du rapport mensuel (1er du mois à 8h)
cron.schedule('0 8 1 * *', async () => {
  await generateMonthlyReport();
});

// Gestion des erreurs
app.use(errorHandler);

// Configuration du serveur
const PORT = process.env.PORT || 3000;

// Configuration HTTPS pour la production
if (process.env.NODE_ENV === 'production') {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, process.env.SSL_KEY_PATH)),
    cert: fs.readFileSync(path.join(__dirname, process.env.SSL_CERT_PATH))
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    loggerWinston.info(`Serveur HTTPS démarré sur le port ${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    loggerWinston.info(`Serveur HTTP démarré sur le port ${PORT}`);
  });
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  loggerWinston.error('Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  loggerWinston.error('Promesse rejetée non gérée:', error);
  process.exit(1);
}); 