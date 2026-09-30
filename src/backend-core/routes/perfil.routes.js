const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfil.controller');

// Obtener perfil
router.get('/', perfilController.getPerfil);

// Crear o actualizar perfil
router.post('/', perfilController.savePerfil);

module.exports = router;
