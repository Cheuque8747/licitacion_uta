const db = require('../config/db');

exports.getUsers = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, rut, nombre_completo, email, rol, verificado, fecha_creacion FROM usuarios ORDER BY id DESC'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

exports.getEmpresas = async (req, res) => {
    try {
        const result = await db.query('SELECT id, nombre_empresa, rut_empresa, rubro FROM empresas ORDER BY nombre_empresa ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

exports.createEmpresa = async (req, res) => {
    const { nombre_empresa, rut_empresa, rubro } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO empresas (nombre_empresa, rut_empresa, rubro) VALUES ($1, $2, $3) RETURNING *',
            [nombre_empresa, rut_empresa, rubro]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        if (error.code === '25006') {
            return res.status(503).json({ success: false, error: 'Sistema en solo lectura (VM5).' });
        }
        if (error.code === '23505') {
            return res.status(400).json({ success: false, error: 'El RUT de la empresa ya existe.' });
        }
        console.error('Error al crear empresa:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

exports.verifyUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'UPDATE usuarios SET verificado = NOT verificado WHERE id = $1 RETURNING id, verificado',
            [id]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        if (error.code === '25006') {
            return res.status(503).json({ success: false, error: 'El sistema se encuentra en modo solo lectura (VM5).' });
        }
        console.error('Error al verificar usuario:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
        if (error.code === '25006') {
            return res.status(503).json({ success: false, error: 'El sistema se encuentra en modo solo lectura (VM5).' });
        }
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, email } = req.body;
    try {
        const result = await db.query(
            'UPDATE usuarios SET nombre_completo = $1, email = $2 WHERE id = $3 RETURNING id, nombre_completo, email',
            [nombre_completo, email, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        if (error.code === '25006') {
            return res.status(503).json({ success: false, error: 'El sistema se encuentra en modo solo lectura (VM5).' });
        }
        console.error('Error al editar usuario:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};
