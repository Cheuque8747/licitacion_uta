require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./src/backend-core/config/db');

const app = express();
const port = 3000; // ⚠️ Puerto bloqueado en 3000 por el upstream de Nginx (VM1)

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/frontend/public')));

// Healthcheck API
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as hora_db');
    res.json({ status: 'ok', db_time: result.rows[0].hora_db });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Rutas de la API
app.use('/api/auth', require('./src/backend-core/routes/auth.routes'));
app.use('/api/admin', require('./src/backend-core/routes/admin.routes'));
app.use('/api/perfil', require('./src/backend-core/routes/perfil.routes'));
app.use('/api/ofertas', require('./src/backend-core/routes/ofertas.routes'));
app.use('/api/postulaciones', require('./src/backend-core/routes/postulaciones.routes'));

// Rutas de Vistas (Frontend)
app.use('/', require('./src/backend-core/routes/view.routes'));

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
