const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

// Route publique pour créer un signalement
router.post('/', reportController.createReport);

// Routes protégées nécessitant une authentification
router.get('/', auth, reportController.getReports);
router.get('/stats', auth, reportController.getStats);
router.get('/recent', auth, reportController.getRecentReports);

module.exports = router; 