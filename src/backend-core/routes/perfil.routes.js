const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken);
router.use(verificarRol(['administrador', 'reclutador', 'postulante']));
const perfilController = require('../controllers/perfil.controller');

// Obtener perfil
router.get('/', perfilController.getPerfil);

// Crear o actualizar perfil
router.post('/', perfilController.savePerfil);

module.exports = router;
