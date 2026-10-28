require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const db = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware de parsing JSON
app.use(express.json());

// Endpoint de verificacion de salud (Healthcheck)
app.get('/api/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW() as hora_db');
        res.json({
            status: 'ok',
            service: 'backend-core',
            db_time: result.rows[0].hora_db
        });
    } catch (err) {
        console.error('Fallo en la conexion a la base de datos:', err.message);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Rutas de la API REST transaccional
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/perfil', require('./routes/perfil.routes'));
app.use('/api/ofertas', require('./routes/ofertas.routes'));
app.use('/api/postulaciones', require('./routes/postulaciones.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/cms', require('./routes/cms.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

// Creacion del servidor HTTP para Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// Configuracion del adaptador Redis para Socket.IO
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPass = process.env.REDIS_PASSWORD || '';
const redisUrl = redisPass
    ? `redis://:${redisPass}@${redisHost}:${redisPort}`
    : `redis://${redisHost}:${redisPort}`;

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log('[Socket.IO] Redis Adapter conectado satisfactoriamente.');
}).catch(err => {
    console.warn('[Socket.IO] No fue posible conectar con Redis Adapter, operando en memoria local:', err.message);
});

io.on('connection', (socket) => {
    // Identificador del host para observabilidad y diagnostico
    socket.emit('server_info', { hostname: require('os').hostname() });

    socket.on('register', (userId) => {
        socket.join(`user_${userId}`);
    });
});

app.set('io', io);

server.listen(port, () => {
    console.log(`Backend Core escuchando en el puerto ${port}`);
});
