const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cms.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Ruta pública (pero autenticada) para leer el dashboard
router.get('/', verificarToken, cmsController.getAllContent);

// Ruta pública para votar en encuestas
router.post('/:id/vote', verificarToken, cmsController.voteSurvey);

// Rutas exclusivas para Administradores
router.post('/', verificarToken, verificarRol('administrador'), cmsController.createContent);
router.put('/:id', verificarToken, verificarRol('administrador'), cmsController.updateContent);
router.delete('/:id', verificarToken, verificarRol('administrador'), cmsController.deleteContent);

module.exports = router;
