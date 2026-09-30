const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.use(verificarToken);
router.use(verificarRol(['administrador']));
const adminController = require('../controllers/admin.controller');

// Obtener todas las empresas
router.get('/empresas', adminController.getEmpresas);

// Crear nueva empresa
router.post('/empresas', adminController.createEmpresa);

// Obtener todos los usuarios
router.get('/users', adminController.getUsers);

// Verificar/Desverificar usuario
router.put('/users/:id/verify', adminController.verifyUser);

// Editar usuario
router.put('/users/:id', adminController.updateUser);

// Eliminar usuario
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
