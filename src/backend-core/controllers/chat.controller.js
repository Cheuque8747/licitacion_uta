const db = require('../config/db');

// Obtener mensajes de una postulación
exports.getMensajes = async (req, res) => {
    try {
        const { postulacion_id } = req.params;
        const usuario_id = req.user.id;
        
        // TODO: En producción, validar que req.user.id sea el postulante de esa postulacion_id 
        // o el reclutador dueño de la oferta de esa postulacion_id.

        const query = `
            SELECT m.*, u.nombre_completo, u.rol 
            FROM mensajes_chat m
            JOIN usuarios u ON m.emisor_id = u.id
            WHERE m.postulacion_id = $1
            ORDER BY m.fecha_envio ASC
        `;
        const result = await db.query(query, [postulacion_id]);

        // Marcar como leídos los mensajes que NO son míos
        await db.query(
            `UPDATE mensajes_chat SET leido = true WHERE postulacion_id = $1 AND emisor_id != $2`,
            [postulacion_id, usuario_id]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

// Enviar un mensaje
exports.enviarMensaje = async (req, res) => {
    try {
        const { postulacion_id, mensaje } = req.body;
        const emisor_id = req.user.id;

        const insertQuery = `
            INSERT INTO mensajes_chat (postulacion_id, emisor_id, mensaje)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await db.query(insertQuery, [postulacion_id, emisor_id, mensaje]);
        
        // Obtener el destinatario para Socket.io
        const relQuery = `
            SELECT p.postulante_id, o.reclutador_id, u.nombre_completo 
            FROM postulaciones p 
            JOIN ofertas_laborales o ON p.oferta_id = o.id 
            JOIN usuarios u ON u.id = $1
            WHERE p.id = $2
        `;
        const relResult = await db.query(relQuery, [emisor_id, postulacion_id]);
        
        if (relResult.rows.length > 0) {
            const rel = relResult.rows[0];
            const recipientId = (emisor_id === rel.postulante_id) ? rel.reclutador_id : rel.postulante_id;
            
            // Emitir evento si el usuario está conectado
            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');
            if (io && connectedUsers && connectedUsers.has(recipientId)) {
                const recipientSocketId = connectedUsers.get(recipientId);
                const msgData = {
                    ...result.rows[0],
                    nombre_completo: rel.nombre_completo
                };
                io.to(recipientSocketId).emit('nuevo_mensaje', msgData);
            }
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

// Obtener cantidad de mensajes sin leer globales para el usuario
exports.getNotificacionesNoLeidas = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const rol = req.user.rol;
        let count = 0;

        if (rol === 'postulante') {
            const result = await db.query(`
                SELECT COUNT(m.id) as no_leidos
                FROM mensajes_chat m
                JOIN postulaciones p ON m.postulacion_id = p.id
                WHERE p.postulante_id = $1 AND m.emisor_id != $1 AND m.leido = false
            `, [usuario_id]);
            count = result.rows[0].no_leidos;
        } else if (rol === 'reclutador') {
            const result = await db.query(`
                SELECT COUNT(m.id) as no_leidos
                FROM mensajes_chat m
                JOIN postulaciones p ON m.postulacion_id = p.id
                JOIN ofertas_laborales o ON p.oferta_id = o.id
                WHERE o.reclutador_id = $1 AND m.emisor_id != $1 AND m.leido = false
            `, [usuario_id]);
            count = result.rows[0].no_leidos;
        }

        res.json({ success: true, count: parseInt(count) });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

// Obtener detalle de mensajes no leídos (Dropdown)
exports.getDetalleNotificaciones = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const rol = req.user.rol;
        let result;

        if (rol === 'postulante') {
            result = await db.query(`
                SELECT m.id, m.mensaje, m.fecha_envio, u.nombre_completo as remitente, o.titulo as oferta_titulo, p.id as postulacion_id, o.id as oferta_id
                FROM mensajes_chat m
                JOIN usuarios u ON m.emisor_id = u.id
                JOIN postulaciones p ON m.postulacion_id = p.id
                JOIN ofertas_laborales o ON p.oferta_id = o.id
                WHERE p.postulante_id = $1 AND m.emisor_id != $1 AND m.leido = false
                ORDER BY m.fecha_envio DESC LIMIT 5
            `, [usuario_id]);
        } else if (rol === 'reclutador') {
            result = await db.query(`
                SELECT m.id, m.mensaje, m.fecha_envio, u.nombre_completo as remitente, o.titulo as oferta_titulo, p.id as postulacion_id, o.id as oferta_id
                FROM mensajes_chat m
                JOIN usuarios u ON m.emisor_id = u.id
                JOIN postulaciones p ON m.postulacion_id = p.id
                JOIN ofertas_laborales o ON p.oferta_id = o.id
                WHERE o.reclutador_id = $1 AND m.emisor_id != $1 AND m.leido = false
                ORDER BY m.fecha_envio DESC LIMIT 5
            `, [usuario_id]);
        }

        res.json({ success: true, data: result.rows || [] });
    } catch (error) {
        console.error('Error al obtener detalle notificaciones:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};

// Marcar todas las notificaciones globales como leídas
exports.marcarTodoLeido = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const rol = req.user.rol;

        if (rol === 'postulante') {
            await db.query(`
                UPDATE mensajes_chat m
                SET leido = true
                FROM postulaciones p
                WHERE m.postulacion_id = p.id
                AND p.postulante_id = $1
                AND m.emisor_id != $1
                AND m.leido = false
            `, [usuario_id]);
        } else if (rol === 'reclutador') {
            await db.query(`
                UPDATE mensajes_chat m
                SET leido = true
                FROM postulaciones p
                JOIN ofertas_laborales o ON p.oferta_id = o.id
                WHERE m.postulacion_id = p.id
                AND o.reclutador_id = $1
                AND m.emisor_id != $1
                AND m.leido = false
            `, [usuario_id]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error al marcar notificaciones como leídas:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
};
