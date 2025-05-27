const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');
const knex = require('../../knexfile');

// Routes protégées nécessitant une authentification
router.get('/', auth, userController.getUsers);
router.post('/', auth, validateUser, userController.createUser);
router.put('/:id', auth, validateUser, userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);

// Route pour enregistrer le token FCM
router.post('/fcm-token', auth, async (req, res) => {
  await knex('users').where({ id: req.user.id }).update({ fcm_token: req.body.fcm_token });
  res.json({ success: true });
});

module.exports = router; 