const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

const iaLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // Límite de 5 peticiones por IP por minuto
    message: { success: false, error: 'Has excedido el límite de análisis de IA. Por favor, intenta de nuevo en un minuto.' }
});

router.use(verificarToken);
router.use(verificarRol(['administrador', 'reclutador', 'postulante']));
const postulacionesController = require('../controllers/postulaciones.controller');

router.post('/', postulacionesController.createPostulacion);
router.post('/analizar', iaLimiter, postulacionesController.analizarMatchIA);
router.get('/postulante/:id', postulacionesController.getPostulacionesByPostulante);
router.get('/oferta/:id', postulacionesController.getPostulantesByOferta);
router.put('/:id/estado', postulacionesController.updateEstadoPostulacion);

module.exports = router;
