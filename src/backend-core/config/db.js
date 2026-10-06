const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la base de datos principal (VM4)
const primaryPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 2000 // Da error rápido si la VM4 cae
});

// Configuración de la base de datos de respaldo (VM5)
const replicaPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST_REPLICA || process.env.DB_HOST, 
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  connectionTimeoutMillis: 2000
});

// Control de estado de emergencia
let usingReplica = false;

// Manejo de errores silenciosos para que Node no haga crash
primaryPool.on('error', (err) => console.error('Error en BD Principal:', err.message));
replicaPool.on('error', (err) => console.error('Error en BD Réplica:', err.message));

// Función periódica que cada 1 minuto intenta reconectar con la principal (Failback)
setInterval(async () => {
  if (usingReplica) {
    try {
      await primaryPool.query('SELECT 1');
      console.log('✅ Base de datos principal (VM4) recuperada. Haciendo Failback automático...');
      usingReplica = false;
    } catch (e) {
      // Sigue muerta, no hacemos nada
    }
  }
}, 60000);

// Exportamos nuestro interceptor inteligente
module.exports = {
  async query(text, params) {
    if (usingReplica) {
      return replicaPool.query(text, params);
    } else {
      try {
        return await primaryPool.query(text, params);
      } catch (err) {
        // Interceptar errores de conexión de PostgreSQL
        if (err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH' || err.code === 'ETIMEDOUT' || err.message.includes('Connection terminated')) {
          console.warn('⚠️ Base de datos principal (VM4) caída. Haciendo Failover automático a la Réplica (VM5)...');
          usingReplica = true;
          return replicaPool.query(text, params);
        }
        throw err; // Otros errores SQL pasan normal
      }
    }
  }
};
