const db = require('../config/db');

// Obtener todo el contenido CMS
exports.getAllContent = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const result = await db.query(`
            SELECT c.*, u.nombre_completo as autor,
                (SELECT COUNT(*) FROM encuestas_votos WHERE contenido_id = c.id AND usuario_id = $1) > 0 as ya_voto,
                (SELECT json_agg(json_build_object('opcion', v.opcion_seleccionada, 'votos', v.conteo))
                 FROM (SELECT opcion_seleccionada, COUNT(*) as conteo FROM encuestas_votos WHERE contenido_id = c.id GROUP BY opcion_seleccionada) v
                ) as resultados_votos
            FROM contenidos_cms c
            JOIN usuarios u ON c.administrador_id = u.id
            ORDER BY c.fecha_publicacion DESC
        `, [usuario_id]);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener CMS:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

// Crear nuevo contenido (Solo Admin)
exports.createContent = async (req, res) => {
    try {
        const admin_id = req.user.id;
        const { tipo, titulo, cuerpo, url_imagen, opciones } = req.body;
        const jsonOpciones = opciones ? JSON.stringify(opciones) : null;

        const query = `
            INSERT INTO contenidos_cms (administrador_id, tipo, titulo, cuerpo, url_imagen, opciones)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const result = await db.query(query, [admin_id, tipo, titulo, cuerpo, url_imagen, jsonOpciones]);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error al crear contenido CMS:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

// Actualizar contenido (Solo Admin)
exports.updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, titulo, cuerpo, url_imagen, opciones } = req.body;
        const jsonOpciones = opciones ? JSON.stringify(opciones) : null;

        const query = `
            UPDATE contenidos_cms 
            SET tipo = $1, titulo = $2, cuerpo = $3, url_imagen = $4, opciones = $5
            WHERE id = $6 RETURNING *
        `;
        const result = await db.query(query, [tipo, titulo, cuerpo, url_imagen, jsonOpciones, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Contenido no encontrado' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar contenido CMS:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

// Eliminar contenido (Solo Admin)
exports.deleteContent = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`DELETE FROM contenidos_cms WHERE id = $1 RETURNING id`, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Contenido no encontrado' });
        }
        res.json({ success: true, message: 'Contenido eliminado' });
    } catch (error) {
        console.error('Error al eliminar contenido CMS:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

// Votar en una encuesta
exports.voteSurvey = async (req, res) => {
    try {
        const { id } = req.params; // ID de la encuesta (contenido_id)
        const { opcion } = req.body;
        const usuario_id = req.user.id;

        const query = `
            INSERT INTO encuestas_votos (contenido_id, usuario_id, opcion_seleccionada)
            VALUES ($1, $2, $3) RETURNING *
        `;
        const result = await db.query(query, [id, usuario_id, opcion]);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error al votar en encuesta:', error);
        if(error.code === '23505') { // Unique violation
            return res.status(400).json({ success: false, error: 'Ya has votado en esta encuesta' });
        }
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};
