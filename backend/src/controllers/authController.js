const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knexConfig = require('../../knexfile');
const environment = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexConfig[environment]);
const logger = require('../utils/logger');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification de l'existence de l'utilisateur
    const user = await knex('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérification du mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        institution: user.institution,
        operator: user.operator
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Connexion réussie pour l'utilisateur: ${user.email}`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          institution: user.institution,
          operator: user.operator
        }
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la connexion: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, role, institution, operator } = req.body;

    // Vérification si l'email existe déjà
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const [user] = await knex('users').insert({
      email,
      password: hashedPassword,
      role,
      institution,
      operator
    }).returning(['id', 'email', 'role', 'institution', 'operator']);

    logger.info(`Nouvel utilisateur créé: ${user.email}`);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Erreur lors de l'inscription: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription'
    });
  }
}; 