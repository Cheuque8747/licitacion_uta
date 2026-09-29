require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./src/backend-core/config/db');

const app = express();
const port = process.env.PORT || 3000;

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

// Servir frontend view
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/frontend/views/index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
