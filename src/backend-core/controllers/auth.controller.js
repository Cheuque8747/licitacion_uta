const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// Nota: Para producción usar 'bcrypt' para encriptar la contraseña. Aquí se simplifica para la demostración.

exports.register = async (req, res) => {
    let { rut, nombre_completo, email, password, rol, empresa_id } = req.body;

    // 1. Limpiar el RUT (quitar puntos y guiones, dejarlo en formato XXXXXXXX-X)
    rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rut.length < 8) {
        return res.status(400).json({ success: false, error: 'Formato de RUT inválido.' });
    }
    rut = rut.slice(0, -1) + '-' + rut.slice(-1);

    try {
        const password_hash = await bcrypt.hash(password, 10); 

        // INSERT básico
        const result = await db.query(
            `INSERT INTO usuarios (rut, nombre_completo, email, password_hash, rol) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre_completo, email, rol`,
            [rut, nombre_completo, email, password_hash, rol]
        );

        const newUser = result.rows[0];

        // Si es reclutador, vincular con la empresa
        if (rol === 'reclutador' && empresa_id) {
            await db.query(
                'INSERT INTO perfil_reclutadores (usuario_id, empresa_id) VALUES ($1, $2)',
                [newUser.id, empresa_id]
            );
        }

        const token = jwt.sign({ id: newUser.id, rol: newUser.rol }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.status(201).json({
            success: true,
            user: newUser,
            token: token
        });

    } catch (error) {
        // Error de solo lectura de la VM5
        if (error.code === '25006') {
            console.warn('⚠️ Intento de registro bloqueado: BD en Modo Solo Lectura (VM5)');
            return res.status(503).json({
                success: false,
                error: 'El sistema se encuentra en modo mantenimiento (solo lectura). No es posible crear cuentas en este momento.'
            });
        }
        
        // Error de RUT o Email duplicado (código 23505 en pg)
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                error: 'El RUT o Correo electrónico ya se encuentran registrados.'
            });
        }

        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor.'
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // SELECT funciona incluso si estamos degradados en la VM5
        const result = await db.query(
            'SELECT id, nombre_completo, email, rol, password_hash FROM usuarios WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas.' });
        }

        // Remover password antes de enviar al frontend
        delete user.password_hash;

        const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({
            success: true,
            user: user,
            token: token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor.'
        });
    }
};
