require('dotenv').config();
const express = require('express');
const { calcularMatch } = require('./recomendador');

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

// Endpoint de verificacion de estado
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'ia-service' });
});

// Logica comun para calculo de compatibilidad con Gemini
const procesarMatch = async (req, res) => {
    try {
        const { cv, oferta } = req.body;
        if (!cv || !oferta) {
            return res.status(400).json({
                success: false,
                error: 'Los campos cv y oferta son obligatorios.'
            });
        }

        const resultado = await calcularMatch(cv, oferta);
        return res.json({
            success: true,
            match_score: resultado.score,
            feedback: resultado.feedback
        });
    } catch (error) {
        console.error('Error procesando compatibilidad en ia-service:', error.message || error);
        return res.status(500).json({
            success: false,
            error: 'Error interno al procesar el analisis de perfil con IA.'
        });
    }
};

// Endpoints compatibles para llamadas directas y ruteo Nginx
app.post('/analizar', procesarMatch);
app.post('/api/ia/analizar', procesarMatch);
app.post('/match', procesarMatch);
app.post('/api/ia/match', procesarMatch);

app.listen(port, () => {
    console.log(`Microservicio ia-service escuchando en el puerto ${port}`);
});
