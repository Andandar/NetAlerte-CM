const express = require('express');
const router = express.Router();

router.post('/notify', (req, res) => {
  // Traiter la notification externe
  res.json({ success: true });
});

module.exports = router; 