const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Solo administradores pueden ver analítica
router.get('/', verificarToken, verificarRol('administrador'), analyticsController.getAnalyticsData);

module.exports = router;
