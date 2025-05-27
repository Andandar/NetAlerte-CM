const knex = require('../../knexfile');
const logger = require('../utils/logger');
const { sendMail } = require('../utils/mailer');

exports.createReport = async (req, res) => {
  try {
    const {
      operator,
      problem_type,
      signal_strength,
      network_type,
      latitude,
      longitude,
      description,
      region
    } = req.body;

    // Validation des données requises
    if (!operator || !problem_type) {
      return res.status(400).json({
        success: false,
        error: 'Opérateur et type de problème sont requis'
      });
    }

    // Validation des coordonnées géographiques
    if (latitude && (latitude < -90 || latitude > 90)) {
      return res.status(400).json({
        success: false,
        error: 'Latitude invalide'
      });
    }

    if (longitude && (longitude < -180 || longitude > 180)) {
      return res.status(400).json({
        success: false,
        error: 'Longitude invalide'
      });
    }

    // Validation de la force du signal
    if (signal_strength && (signal_strength < 0 || signal_strength > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Force du signal invalide'
      });
    }

    const [report] = await knex('reports').insert({
      operator,
      problem_type,
      signal_strength,
      network_type,
      latitude,
      longitude,
      description,
      region,
      user_id: req.user?.id || null,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    logger.info(`Nouveau signalement créé: ${report.id}`);

    // Envoi d'un email à l'admin
    try {
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `Nouveau signalement - ${operator} (${problem_type})`,
        text: `Un nouveau signalement a été créé :\n\nOpérateur : ${operator}\nType de problème : ${problem_type}\nRégion : ${region || '-'}\nForce du signal : ${signal_strength || '-'}\nTechnologie : ${network_type || '-'}\nDescription : ${description || '-'}\nLatitude : ${latitude || '-'}\nLongitude : ${longitude || '-'}\nDate : ${new Date().toLocaleString('fr-FR')}`
      });
    } catch (mailErr) {
      logger.error('Erreur lors de l\'envoi de l\'email admin : ' + mailErr.message);
      // On continue même si l'email échoue
    }

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error(`Erreur lors de la création du signalement: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du signalement'
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const {
      operator,
      status,
      startDate,
      endDate,
      region,
      problem_type,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    // Construction de la requête de base
    let query = knex('reports')
      .select('*')
      .orderBy(sortBy, sortOrder);

    // Application des filtres
    if (operator) {
      query = query.where('operator', operator);
    }

    if (status) {
      query = query.where('status', status);
    }

    if (region) {
      query = query.where('region', 'ilike', `%${region}%`);
    }

    if (problem_type) {
      query = query.where('problem_type', problem_type);
    }

    if (startDate && endDate) {
      query = query.whereBetween('created_at', [startDate, endDate]);
    }

    // Calcul du nombre total d'enregistrements
    const totalQuery = query.clone().count('* as total').first();
    const total = await totalQuery;

    // Application de la pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Exécution de la requête
    const reports = await query;

    // Calcul des métadonnées de pagination
    const totalPages = Math.ceil(total.total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total.total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des signalements: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des signalements'
    });
  }
};

exports.getReportStats = async (req, res) => {
  try {
    const stats = await knex('reports')
      .select('operator')
      .count('* as count')
      .groupBy('operator');

    const problemTypes = await knex('reports')
      .select('problem_type')
      .count('* as count')
      .groupBy('problem_type');

    const statusCounts = await knex('reports')
      .select('status')
      .count('* as count')
      .groupBy('status');

    res.json({
      success: true,
      data: {
        byOperator: stats,
        byProblemType: problemTypes,
        byStatus: statusCounts
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    const [report] = await knex('reports')
      .where({ id })
      .update({
        status,
        resolution_notes,
        resolved_at: status === 'resolved' ? new Date() : null
      })
      .returning('*');

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Signalement non trouvé'
      });
    }

    logger.info(`Statut du signalement ${id} mis à jour: ${status}`);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du statut'
    });
  }
}; 