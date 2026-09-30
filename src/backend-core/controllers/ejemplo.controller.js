const db = require('../config/db');

/**
 * Ejemplo de Controlador con Degradación Elegante
 * Captura el error de modo Solo Lectura (VM4 caída, operando con VM5)
 */
exports.crearEjemplo = async (req, res) => {
  const { dato } = req.body;

  try {
    // Intentar hacer un INSERT
    const result = await db.query(
      'INSERT INTO tabla_ejemplo (dato) VALUES ($1) RETURNING *',
      [dato]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    // 25006 es el código de PostgreSQL para "read_only_sql_transaction"
    if (error.code === '25006') {
      console.warn('⚠️ Intento de escritura en Base de Datos de Solo Lectura (VM5 activa)');
      return res.status(503).json({
        success: false,
        error: 'El sistema se encuentra temporalmente en modo de mantenimiento (solo lectura). No se pueden guardar cambios en este momento, pero puedes seguir navegando.',
        errorCode: 'READ_ONLY_MODE'
      });
    }

    // Para cualquier otro error no esperado (500)
    console.error('Error inesperado en BD:', error);
    res.status(500).json({
      success: false,
      error: 'Ocurrió un error en el servidor.'
    });
  }
};

/**
 * Los SELECT no tendrán problemas en la VM5
 */
exports.obtenerEjemplos = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tabla_ejemplo');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
};
