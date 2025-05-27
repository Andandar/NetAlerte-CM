const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  try {
    // Récupération du token depuis le header Authorization
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant'
      });
    }

    // Vérification du token
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
    logger.error(`Erreur d'authentification: ${error.message}`);
    res.status(401).json({
      success: false,
      error: 'Token invalide ou expiré'
    });
  }
}; 