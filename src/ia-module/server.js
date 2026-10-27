require('dotenv').config();
const express = require('express');
const { calcularMatch } = require('./recomendador');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Healthcheck para Docker
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ia-service', timestamp: new Date().toISOString() });
});

// Endpoint principal: Análisis y Matchmaking de CV vs Oferta
app.post('/api/ia/match', async (req, res) => {
    try {
        const { cv, oferta } = req.body;
        if (!cv || !oferta) {
            return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos: cv y oferta.' });
        }

        const jsonMatch = await calcularMatch(cv, oferta);
        res.json({
            success: true,
            match_score: jsonMatch.score,
            feedback: jsonMatch.feedback
        });
    } catch (error) {
        console.error('Error en microservicio IA (POST /api/ia/match):', error);
        res.status(500).json({ success: false, error: 'Error al procesar análisis con Inteligencia Artificial' });
    }
});

app.listen(port, () => {
    console.log(`[INFO] Microservicio de IA escuchando en el puerto ${port}`);
});
