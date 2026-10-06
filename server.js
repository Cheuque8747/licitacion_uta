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
app.use('/api/chat', require('./src/backend-core/routes/chat.routes'));
app.use('/api/cms', require('./src/backend-core/routes/cms.routes'));
app.use('/api/analytics', require('./src/backend-core/routes/analytics.routes'));

// Rutas de Vistas (Frontend)
app.use('/', require('./src/backend-core/routes/view.routes'));

const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Configuración de Redis para Socket.io
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPass = process.env.REDIS_PASSWORD || '';

const redisUrl = redisPass ? `redis://:${redisPass}@${redisHost}:${redisPort}` : `redis://${redisHost}:${redisPort}`;

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Redis Adapter conectado a Socket.io');
}).catch(err => {
    console.error('Error conectando Redis Adapter:', err);
});

io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        // En lugar de usar Map en memoria, unimos al socket a una "sala" con su ID
        socket.join(`user_${userId}`);
    });
});

app.set('io', io);

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
