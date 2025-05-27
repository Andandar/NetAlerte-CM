const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Configuration des transports
const transports = [
  // Transport pour les erreurs
  new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  }),
  // Transport pour tous les logs
  new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  })
];

// Ajout du transport console en développement
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'netalerte-api' },
  transports,
  exitOnError: false
});

// Gestion des erreurs non capturées
logger.on('error', (error) => {
  console.error('Erreur du logger:', error);
});

module.exports = logger; 