const express = require('express');
const path = require('path');
const router = express.Router();

// Servir la vista de Login
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/login.html'));
});

// Servir la vista de Registro
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/register.html'));
});

// Servir el Dashboard
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/dashboard.html'));
});

// Servir la vista de Perfil (Postulante / Empresa)
router.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/perfil.html'));
});

// Servir la vista de Vacantes / Ofertas Laborales
router.get('/vacantes', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/vacantes.html'));
});

// Servir la vista de Postulación (Dividida CV / Oferta)
router.get('/postular', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/postular.html'));
});

// Servir la vista de Mis Postulaciones (Postulante)
router.get('/mis-postulaciones', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/mis_postulaciones.html'));
});

// Servir la vista de Gestión de Postulantes (Reclutador)
router.get('/gestion-postulantes', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/gestion_postulantes.html'));
});

// Servir la vista de Gestión de Administrador
router.get('/admin/users', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/views/admin_users.html'));
});

// Redirigir la raíz (/) al login
router.get('/', (req, res) => {
    res.redirect('/login');
});

module.exports = router;
