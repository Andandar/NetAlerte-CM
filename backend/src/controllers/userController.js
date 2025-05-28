const bcrypt = require('bcryptjs');
const knexConfig = require('../../knexfile');
const environment = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexConfig[environment]);
const logger = require('../utils/logger');

exports.getUsers = async (req, res) => {
  try {
    const users = await knex('users')
      .select('id', 'email', 'role', 'institution', 'operator', 'created_at', 'updated_at');
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

exports.createUser = async (req, res) => {
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
    }).returning(['id', 'email', 'role', 'institution', 'operator', 'created_at', 'updated_at']);

    logger.info(`Nouvel utilisateur créé: ${user.email}`);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'utilisateur'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role, institution, operator } = req.body;

    // Vérification si l'utilisateur existe
    const existingUser = await knex('users').where({ id }).first();
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérification si le nouvel email est déjà utilisé
    if (email !== existingUser.email) {
      const emailExists = await knex('users').where({ email }).first();
      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Cet email est déjà utilisé'
        });
      }
    }

    // Préparation des données de mise à jour
    const updateData = {
      email,
      role,
      institution,
      operator
    };

    // Mise à jour du mot de passe si fourni
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Mise à jour de l'utilisateur
    const [user] = await knex('users')
      .where({ id })
      .update(updateData)
      .returning(['id', 'email', 'role', 'institution', 'operator', 'created_at', 'updated_at']);

    logger.info(`Utilisateur mis à jour: ${user.email}`);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'utilisateur'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification si l'utilisateur existe
    const existingUser = await knex('users').where({ id }).first();
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Suppression de l'utilisateur
    await knex('users').where({ id }).del();

    logger.info(`Utilisateur supprimé: ${existingUser.email}`);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    logger.error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
}; 