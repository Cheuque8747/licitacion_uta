const express = require('express');
const router = express.Router();
const ofertasController = require('../controllers/ofertas.controller');

router.get('/', ofertasController.getOfertas);
router.get('/:id', ofertasController.getOfertaById);
router.post('/', ofertasController.createOferta);

module.exports = router;
