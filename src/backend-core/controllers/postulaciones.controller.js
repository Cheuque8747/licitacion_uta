const db = require('../config/db');

// Postulante: Crear una nueva postulación
exports.createPostulacion = async (req, res) => {
    try {
        const { oferta_id, postulante_id, cv_enviado } = req.body;

        // Verificar si ya postuló
        const check = await db.query(
            'SELECT id FROM postulaciones WHERE oferta_id = $1 AND postulante_id = $2',
            [oferta_id, postulante_id]
        );

        if (check.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Ya has postulado a esta oferta.' });
        }

        // Mock de IA Match Score (random entre 70 y 99)
        const matchScore = (Math.random() * (99 - 70) + 70).toFixed(2);
        const feedbackMock = "Fortaleza: Tienes los conocimientos básicos. Oportunidad: Sería ideal destacar más tu experiencia en proyectos prácticos relacionados a esta vacante.";

        const insertQuery = `
            INSERT INTO postulaciones (oferta_id, postulante_id, estado_avance, match_score, feedback_ia, cv_enviado)
            VALUES ($1, $2, 'enviada', $3, $4, $5)
            RETURNING *
        `;
        const result = await db.query(insertQuery, [oferta_id, postulante_id, matchScore, feedbackMock, cv_enviado || null]);

        res.json({ success: true, data: result.rows[0], message: 'Postulación enviada con éxito' });
    } catch (error) {
        console.error('Error al crear postulación:', error);
        res.status(500).json({ success: false, error: 'Error interno al enviar postulación' });
    }
};

// Postulante: Obtener sus postulaciones
exports.getPostulacionesByPostulante = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.id as postulacion_id, p.estado_avance, p.fecha_postulacion, p.match_score, p.feedback_ia, p.cv_enviado,
                   o.titulo, o.tipo, o.descripcion as oferta_descripcion,
                   e.nombre_empresa
            FROM postulaciones p
            JOIN ofertas_laborales o ON p.oferta_id = o.id
            JOIN empresas e ON o.empresa_id = e.id
            WHERE p.postulante_id = $1
            ORDER BY p.fecha_postulacion DESC
        `;
        const result = await db.query(query, [id]);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener postulaciones:', error);
        res.status(500).json({ success: false, error: 'Error interno' });
    }
};

// Reclutador: Obtener postulantes para una oferta específica
exports.getPostulantesByOferta = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.id as postulacion_id, p.estado_avance, p.match_score, p.fecha_postulacion,
                   u.id as usuario_id, u.nombre_completo, u.email,
                   perf.carrera, perf.facultad
            FROM postulaciones p
            JOIN usuarios u ON p.postulante_id = u.id
            JOIN perfil_postulantes perf ON u.id = perf.usuario_id
            WHERE p.oferta_id = $1
            ORDER BY p.match_score DESC
        `;
        const result = await db.query(query, [id]);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener postulantes:', error);
        res.status(500).json({ success: false, error: 'Error interno' });
    }
};

// Reclutador: Actualizar el estado de una postulación
exports.updateEstadoPostulacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_avance } = req.body;

        const updateQuery = `
            UPDATE postulaciones 
            SET estado_avance = $1
            WHERE id = $2
            RETURNING *
        `;
        const result = await db.query(updateQuery, [estado_avance, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Postulación no encontrada' });
        }

        res.json({ success: true, data: result.rows[0], message: 'Estado actualizado' });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ success: false, error: 'Error interno' });
    }
};
