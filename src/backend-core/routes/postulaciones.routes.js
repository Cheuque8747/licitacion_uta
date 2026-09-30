const express = require('express');
const router = express.Router();
const postulacionesController = require('../controllers/postulaciones.controller');

router.post('/', postulacionesController.createPostulacion);
router.get('/postulante/:id', postulacionesController.getPostulacionesByPostulante);
router.get('/oferta/:id', postulacionesController.getPostulantesByOferta);
router.put('/:id/estado', postulacionesController.updateEstadoPostulacion);

module.exports = router;
