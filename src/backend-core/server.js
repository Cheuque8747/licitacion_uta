require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const db = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Healthcheck API (utilizado por el HEALTHCHECK de Docker)
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as hora_db');
    res.json({
      status: 'ok',
      service: 'backend-core',
      hostname: require('os').hostname(),
      db_time: result.rows[0].hora_db
    });
  } catch (err) {
    console.error('Error de salud en BD:', err);
    res.status(500).json({ error: 'Database connection failed', status: 'error' });
  }
});

// Rutas de la API REST
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/perfil', require('./routes/perfil.routes'));
app.use('/api/ofertas', require('./routes/ofertas.routes'));
app.use('/api/postulaciones', require('./routes/postulaciones.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/cms', require('./routes/cms.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

// Si existen rutas de vistas locales como fallback
try {
  app.use('/', require('./routes/view.routes'));
} catch (e) {
  // Las vistas son servidas por el microservicio Frontend
}

// Configuración de Servidor HTTP y Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Configuración de Redis Adapter para Clúster y WebSockets
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPass = process.env.REDIS_PASSWORD || '';

const redisUrl = redisPass ? `redis://:${redisPass}@${redisHost}:${redisPort}` : `redis://${redisHost}:${redisPort}`;

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log(`[INFO] Redis Adapter conectado a Socket.io en ${redisHost}:${redisPort}`);
}).catch(err => {
    console.warn(`[AVISO] No se pudo conectar a Redis (${err.message}). Socket.io operará en modo memoria local.`);
});

io.on('connection', (socket) => {
    // Informa al cliente qué nodo backend lo atiende (para el badge del navbar)
    socket.emit('server_info', { hostname: require('os').hostname() });

    socket.on('register', (userId) => {
        socket.join(`user_${userId}`);
    });
});

app.set('io', io);

server.listen(port, () => {
  console.log(`[INFO] Microservicio Backend Core corriendo en el puerto ${port}`);
});
