const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log de l'erreur
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }

  // Erreurs de base de données
  if (err.code === '23505') { // Violation de contrainte unique
    return res.status(409).json({
      success: false,
      error: 'Un enregistrement avec ces données existe déjà'
    });
  }

  // Erreurs par défaut
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Une erreur est survenue' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler; 