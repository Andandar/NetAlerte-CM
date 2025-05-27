const { body, validationResult } = require('express-validator');

// Middleware de validation des erreurs
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Validation de la connexion
exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  handleValidationErrors
];

// Validation de l'inscription
exports.validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role')
    .isIn(['admin', 'operator', 'institution'])
    .withMessage('Rôle invalide'),
  body('institution')
    .if(body('role').equals('institution'))
    .notEmpty()
    .withMessage('L\'institution est requise pour ce rôle'),
  body('operator')
    .if(body('role').equals('operator'))
    .notEmpty()
    .withMessage('L\'opérateur est requis pour ce rôle'),
  handleValidationErrors
];

// Validation des utilisateurs
exports.validateUser = [
  body('email')
    .isEmail()
    .withMessage('Email invalide'),
  body('password')
    .if(body('password').exists())
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role')
    .isIn(['admin', 'operator', 'institution'])
    .withMessage('Rôle invalide'),
  body('institution')
    .if(body('role').equals('institution'))
    .notEmpty()
    .withMessage('L\'institution est requise pour ce rôle'),
  body('operator')
    .if(body('role').equals('operator'))
    .notEmpty()
    .withMessage('L\'opérateur est requis pour ce rôle'),
  handleValidationErrors
];

// Validation des signalements
exports.validateReport = [
  body('operator')
    .isIn(['Orange', 'MTN', 'Nexttel', 'Camtel', 'Autre'])
    .withMessage('Opérateur invalide'),
  body('problem_type')
    .isIn(['Appel impossible', 'SMS non reçu ou envoyé', 'Internet lent ou indisponible', 'Coupure réseau'])
    .withMessage('Type de problème invalide'),
  body('signal_strength')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('La force du signal doit être comprise entre 0 et 100'),
  body('network_type')
    .optional()
    .isString()
    .withMessage('Type de réseau invalide'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude invalide'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude invalide'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('La description ne doit pas dépasser 500 caractères'),
  handleValidationErrors
]; 