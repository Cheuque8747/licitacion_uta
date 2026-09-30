const db = require('../config/db');

exports.getPerfil = async (req, res) => {
    const { id, rol, view_id } = req.query; // En prod, id y rol vienen del token. view_id es si un reclutador ve a otro.
    const targetId = view_id || id;
    const targetRol = view_id ? 'postulante' : rol; // Por ahora asumimos que si hay view_id, estamos viendo un postulante.
    
    try {
        let result;
        if (targetRol === 'postulante') {
            result = await db.query(
                `SELECT u.nombre_completo, u.email, p.carrera, p.facultad, p.cohorte, p.expectativa_renta, 
                        p.resumen, p.experiencia, p.habilidades 
                 FROM usuarios u 
                 LEFT JOIN perfil_postulantes p ON u.id = p.usuario_id 
                 WHERE u.id = $1`, [targetId]
            );
        } else if (targetRol === 'reclutador') {
            result = await db.query(
                `SELECT r.cargo, e.nombre_empresa, e.rut_empresa, e.rubro 
                 FROM perfil_reclutadores r 
                 JOIN empresas e ON r.empresa_id = e.id 
                 WHERE r.usuario_id = $1`, [id]
            );
        } else {
            return res.status(400).json({ success: false, error: 'Rol no válido para perfil' });
        }

        res.json({ success: true, data: result.rows[0] || null });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

exports.savePerfil = async (req, res) => {
    const { id, rol, perfilData } = req.body; 

    try {
        if (rol === 'postulante') {
            const { carrera, facultad, cohorte, expectativa_renta, resumen, experiencia, habilidades } = perfilData;
            await db.query(
                `INSERT INTO perfil_postulantes (usuario_id, carrera, facultad, cohorte, expectativa_renta, resumen, experiencia, habilidades) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (usuario_id) DO UPDATE 
                 SET carrera = EXCLUDED.carrera, facultad = EXCLUDED.facultad, cohorte = EXCLUDED.cohorte, 
                     expectativa_renta = EXCLUDED.expectativa_renta, resumen = EXCLUDED.resumen, 
                     experiencia = EXCLUDED.experiencia, habilidades = EXCLUDED.habilidades`,
                [id, carrera, facultad, cohorte, expectativa_renta, resumen, experiencia, habilidades]
            );
        } else if (rol === 'reclutador') {
            const { cargo } = perfilData;
            // Solo se actualiza el cargo, los datos de la empresa los maneja el admin
            await db.query(
                `UPDATE perfil_reclutadores SET cargo = $1 WHERE usuario_id = $2`,
                [cargo, id]
            );
        } else {
            return res.status(400).json({ success: false, error: 'Rol no válido' });
        }

        res.json({ success: true, message: 'Perfil guardado exitosamente' });
    } catch (error) {
        if (error.code === '25006') {
            return res.status(503).json({ success: false, error: 'El sistema se encuentra en modo solo lectura (VM5 activa). No se pueden guardar cambios.' });
        }
        console.error('Error al guardar perfil:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};
