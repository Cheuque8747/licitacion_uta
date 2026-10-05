const db = require('../config/db');

exports.getAnalyticsData = async (req, res) => {
    try {
        // 1. Tasa de Empleabilidad (Estado de postulaciones: contratados vs resto)
        // Y empleabilidad por Facultad/Carrera
        const empleabilidadQuery = `
            SELECT 
                p.estado_avance, 
                pp.facultad, 
                pp.carrera, 
                pp.cohorte,
                COUNT(*) as cantidad
            FROM postulaciones p
            JOIN perfil_postulantes pp ON p.postulante_id = pp.usuario_id
            GROUP BY p.estado_avance, pp.facultad, pp.carrera, pp.cohorte
        `;
        const empleabilidadRes = await db.query(empleabilidadQuery);

        // 2. Expectativas de Renta por Carrera y Cohorte
        const rentaQuery = `
            SELECT 
                facultad,
                carrera, 
                cohorte, 
                ROUND(AVG(NULLIF(expectativa_renta, 0))) as promedio_renta,
                COUNT(*) as postulantes
            FROM perfil_postulantes
            WHERE expectativa_renta IS NOT NULL AND expectativa_renta > 0
            GROUP BY facultad, carrera, cohorte
            ORDER BY promedio_renta DESC
        `;
        const rentaRes = await db.query(rentaQuery);

        // 3. Ofertas vs Demanda (Pertinencia)
        // Ofertas por tipo y facultad requerida
        const demandaQuery = `
            SELECT 
                tipo,
                facultad_requerida,
                COUNT(*) as cantidad_ofertas
            FROM ofertas_laborales
            GROUP BY tipo, facultad_requerida
        `;
        const demandaRes = await db.query(demandaQuery);

        // Perfiles totales por facultad (para cruzar)
        const perfilesQuery = `
            SELECT facultad, carrera, cohorte, COUNT(*) as total_alumnos
            FROM perfil_postulantes
            GROUP BY facultad, carrera, cohorte
        `;
        const perfilesRes = await db.query(perfilesQuery);

        res.json({
            success: true,
            data: {
                empleabilidad: empleabilidadRes.rows,
                renta: rentaRes.rows,
                demanda: demandaRes.rows,
                perfiles: perfilesRes.rows
            }
        });
    } catch (error) {
        console.error('Error en Analytics:', error);
        res.status(500).json({ success: false, error: 'Error obteniendo datos de analítica' });
    }
};
