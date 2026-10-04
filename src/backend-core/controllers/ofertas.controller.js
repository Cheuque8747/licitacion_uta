const db = require('../config/db');

exports.getOfertas = async (req, res) => {
    try {
        const { facultad, carrera, tipo, view_mode } = req.query;
        let reclutador_id = req.query.reclutador_id;
        if (req.user && req.user.rol === 'reclutador') {
            reclutador_id = req.user.id;
        }
        let query = `
            SELECT o.*, e.nombre_empresa, e.rut_empresa, e.rubro
            FROM ofertas_laborales o
            JOIN empresas e ON o.empresa_id = e.id
            WHERE o.estado = 'publicada'
        `;
        const params = [];

        if (facultad) {
            params.push(facultad);
            query += ` AND o.facultad_requerida = $${params.length}`;
        }
        if (carrera) {
            params.push(carrera);
            // ANY() verifica si la carrera solicitada está en el array carrera_requerida
            query += ` AND $${params.length} = ANY(o.carrera_requerida)`;
        }
        if (tipo) {
            params.push(tipo);
            query += ` AND o.tipo = $${params.length}`;
        }
        
        // Manejo de las vistas para el reclutador
        if (reclutador_id) {
            const mode = view_mode || 'mis_ofertas'; // por defecto sus ofertas
            
            if (mode === 'mis_ofertas') {
                // Solo las creadas por este usuario específico
                params.push(reclutador_id);
                query += ` AND o.reclutador_id = $${params.length}`;
            } 
            else if (mode === 'mi_empresa') {
                // De la empresa, pero NO creadas por este reclutador
                query = `
                    SELECT o.*, e.nombre_empresa, e.rut_empresa, e.rubro
                    FROM ofertas_laborales o
                    JOIN empresas e ON o.empresa_id = e.id
                    JOIN perfil_reclutadores pr ON pr.empresa_id = e.id
                    WHERE pr.usuario_id = $1 AND o.reclutador_id != $1 AND o.estado = 'publicada'
                `;
                params.length = 0;
                params.push(reclutador_id);
                
                if (facultad) { params.push(facultad); query += ` AND o.facultad_requerida = $${params.length}`; }
                if (carrera) { params.push(carrera); query += ` AND $${params.length} = ANY(o.carrera_requerida)`; }
                if (tipo) { params.push(tipo); query += ` AND o.tipo = $${params.length}`; }
            }
            // Si el mode === 'todas', simplemente usa la query base con los filtros, no se agrega restricción de empresa
        }

        query += ` ORDER BY o.fecha_creacion DESC`;

        const result = await db.query(query, params);
        res.json({ success: true, data: result.rows });

    } catch (error) {
        console.error('Error al obtener ofertas:', error);
        res.status(500).json({ success: false, error: 'Error al obtener ofertas' });
    }
};

exports.createOferta = async (req, res) => {
    try {
        const { titulo, descripcion, experiencia_solicitada, habilidades_requeridas, tipo, facultad_requerida, carrera_requerida } = req.body;
        const usuario_id = req.user.id;

        const reclutadorCheck = await db.query(`SELECT empresa_id FROM perfil_reclutadores WHERE usuario_id = $1`, [usuario_id]);
        
        if (reclutadorCheck.rows.length === 0) {
            return res.status(403).json({ success: false, error: 'Usuario no autorizado para crear ofertas' });
        }

        const empresa_id = reclutadorCheck.rows[0].empresa_id;

        const insertQuery = `
            INSERT INTO ofertas_laborales 
            (empresa_id, reclutador_id, titulo, descripcion, experiencia_solicitada, habilidades_requeridas, tipo, estado, facultad_requerida, carrera_requerida, fecha_publicacion) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'publicada', $8, $9, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        // Solución Falla de Estabilidad por Casteo: Asegurarse que siempre sea un array
        const carrerasSeguras = Array.isArray(carrera_requerida) ? carrera_requerida : (carrera_requerida ? [carrera_requerida] : []);

        const params = [empresa_id, usuario_id, titulo, descripcion, experiencia_solicitada, habilidades_requeridas, tipo, facultad_requerida, carrerasSeguras];
        
        const result = await db.query(insertQuery, params);
        res.json({ success: true, data: result.rows[0], message: 'Oferta creada exitosamente' });

    } catch (error) {
        console.error('Error al crear oferta:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al crear la oferta' });
    }
};

exports.getOfertaById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT o.*, 
                   e.nombre_empresa, e.rut_empresa, e.rubro,
                   u.nombre_completo AS reclutador_nombre, u.email AS reclutador_email
            FROM ofertas_laborales o
            JOIN empresas e ON o.empresa_id = e.id
            LEFT JOIN usuarios u ON o.reclutador_id = u.id
            WHERE o.id = $1
        `;
        const result = await db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Oferta no encontrada' });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error al obtener oferta:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor al obtener oferta' });
    }
};
