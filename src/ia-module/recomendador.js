const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializar la API de Gemini (usa la key del archivo .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analiza el CV frente a la oferta y retorna un JSON con el score y feedback
 */
async function calcularMatch(cv, oferta, retries = 3) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

        const prompt = `
            Eres un reclutador experto. Analiza el siguiente perfil (CV) frente a la Oferta Laboral.
            Devuelve SOLO un JSON con este formato exacto: 
            {
              "score": <numero de 0 a 100 indicando el % de match>,
              "fortalezas": ["fortaleza 1", "fortaleza 2"],
              "brechas": ["brecha 1", "brecha 2"],
              "recomendaciones": ["recomendacion 1", "recomendacion 2"]
            }
            Genera al menos 2 puntos detallados para cada categoría. No uses formato markdown (\`\`\`), devuelve el JSON crudo.
            
            OFERTA LABORAL:
            Título: ${oferta.titulo}
            Descripción: ${oferta.descripcion}
            Experiencia: ${oferta.experiencia_solicitada || 'No especificada'}
            Habilidades: ${oferta.habilidades_requeridas || 'No especificadas'}
            
            CURRÍCULUM DEL POSTULANTE:
            Carrera: ${cv.carrera}
            Resumen: ${cv.resumen}
            Experiencia: ${cv.experiencia}
            Habilidades: ${cv.habilidades}
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        // Limpiar posible formato Markdown de JSON
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = JSON.parse(responseText);

        // Renderizar un diseño UI avanzado con los arrays
        const feedbackHTML = `
            <div class="row g-3 mt-2">
                <div class="col-md-4">
                    <div class="card h-100 border-success shadow-sm" style="background-color: #f8fff9;">
                        <div class="card-header bg-transparent border-success text-success fw-bold">
                            <i class="bi bi-check-circle-fill me-2"></i>Fortalezas
                        </div>
                        <div class="card-body text-dark" style="font-size: 0.9rem;">
                            <ul class="mb-0 ps-3">
                                ${jsonMatch.fortalezas.map(f => `<li class="mb-2">${f}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 border-warning shadow-sm" style="background-color: #fffdf5;">
                        <div class="card-header bg-transparent border-warning text-warning-emphasis fw-bold">
                            <i class="bi bi-exclamation-triangle-fill me-2 text-warning"></i>Brechas
                        </div>
                        <div class="card-body text-dark" style="font-size: 0.9rem;">
                            <ul class="mb-0 ps-3">
                                ${jsonMatch.brechas.map(b => `<li class="mb-2">${b}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card h-100 border-info shadow-sm" style="background-color: #f5fcff;">
                        <div class="card-header bg-transparent border-info text-info-emphasis fw-bold">
                            <i class="bi bi-lightbulb-fill me-2 text-info"></i>Recomendaciones
                        </div>
                        <div class="card-body text-dark" style="font-size: 0.9rem;">
                            <ul class="mb-0 ps-3">
                                ${jsonMatch.recomendaciones.map(r => `<li class="mb-2">${r}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return { score: jsonMatch.score, feedback: feedbackHTML };

    } catch (error) {
        if (error.status === 503 && retries > 0) {
            console.warn(`Servicio de IA saturado (503). Reintentando en 2 segundos... (Intentos restantes: ${retries - 1})`);
            await new Promise(res => setTimeout(res, 2000));
            return calcularMatch(cv, oferta, retries - 1);
        }
        console.error("Error en IA Module (calcularMatch):", error);
        throw error;
    }
}

module.exports = { calcularMatch };
// Nodemon trigger restart
