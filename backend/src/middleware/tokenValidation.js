const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const validateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérification de l'expiration du token
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        error: 'Token expiré'
      });
    }

    // Ajout des informations de l'utilisateur à la requête
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error(`Erreur de validation du token: ${error.message}`);
    res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    next();
  };
};

module.exports = {
  validateToken,
  checkRole
}; 