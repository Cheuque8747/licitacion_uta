const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken);
router.use(verificarRol(['administrador', 'reclutador', 'postulante']));
const ofertasController = require('../controllers/ofertas.controller');

router.get('/', ofertasController.getOfertas);
router.get('/:id', ofertasController.getOfertaById);
router.post('/', verificarRol(['reclutador', 'administrador']), ofertasController.createOferta);

module.exports = router;
