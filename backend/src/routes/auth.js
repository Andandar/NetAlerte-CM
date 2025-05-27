const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validation');

// Route de connexion
router.post('/login', validateLogin, authController.login);

// Route d'inscription
router.post('/register', validateRegister, authController.register);

module.exports = router; 