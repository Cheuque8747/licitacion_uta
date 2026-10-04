const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/auth');
const chatController = require('../controllers/chat.controller');

router.use(verificarToken);

router.get('/notificaciones/noleidos', chatController.getNotificacionesNoLeidas);
router.get('/notificaciones/detalle', chatController.getDetalleNotificaciones);
router.put('/notificaciones/marcar-leido', chatController.marcarTodoLeido);
router.get('/:postulacion_id', chatController.getMensajes);
router.post('/', chatController.enviarMensaje);

module.exports = router;
