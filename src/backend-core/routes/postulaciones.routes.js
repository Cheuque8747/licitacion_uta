const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken);
router.use(verificarRol(['administrador', 'reclutador', 'postulante']));
const postulacionesController = require('../controllers/postulaciones.controller');

router.post('/', postulacionesController.createPostulacion);
router.post('/analizar', postulacionesController.analizarMatchIA);
router.get('/postulante/:id', postulacionesController.getPostulacionesByPostulante);
router.get('/oferta/:id', postulacionesController.getPostulantesByOferta);
router.put('/:id/estado', postulacionesController.updateEstadoPostulacion);

module.exports = router;
