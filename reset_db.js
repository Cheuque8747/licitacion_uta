const fs = require('fs');
const path = require('path');
const db = require('./src/backend-core/config/db');

async function resetDatabase() {
    console.log('🔄 Iniciando reseteo de la base de datos...');
    
    try {
        // 1. Borrar todas las tablas actuales (Precaución: esto borra TODOS los datos)
        console.log('🗑️ Borrando esquema actual...');
        await db.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        
        // 2. Leer el archivo SQL
        console.log('📖 Leyendo script_creacion.sql...');
        const sqlPath = path.join(__dirname, 'database', 'script_creacion.sql');
        const sqlScript = fs.readFileSync(sqlPath, 'utf8');
        
        // 3. Ejecutar el script SQL
        console.log('⚙️ Ejecutando script de creación (creando tablas y tipos)...');
        await db.query(sqlScript);
        
        // 4. Insertar un Administrador por defecto para que puedas iniciar sesión
        console.log('👤 Creando usuario Administrador por defecto...');
        await db.query(`
            INSERT INTO usuarios (rut, nombre_completo, email, password_hash, rol, verificado)
            VALUES ('11111111-1', 'Súper Administrador', 'admin@uta.cl', 'admin123', 'administrador', TRUE);
        `);

        // 5. Crear datos de prueba (MOCK DATA)
        console.log('🏗️ Insertando datos de prueba ricos y variados (Empresas, Reclutadores, Postulantes, Ofertas)...');
        
        // Empresas
        await db.query(`
            INSERT INTO empresas (nombre_empresa, rut_empresa, rubro) VALUES 
            ('Codelco', '61704000-K', 'Minería'),
            ('Banco de Chile', '97004000-5', 'Banca y Finanzas'),
            ('Latam Airlines', '89862200-2', 'Transporte y Logística'),
            ('Entel', '92580000-7', 'Telecomunicaciones y TI'),
            ('Falabella', '77261280-K', 'Retail y Comercio');
        `);

        // Estructuras de datos ricas para iterar
        const reclutadoresData = [
            { rut: '12345678-5', nombre: 'Carlos Silva', email: 'csilva@codelco.cl', empId: 1, cargo: 'Jefe de Adquisición de Talento' },
            { rut: '13456789-5', nombre: 'María González', email: 'mgonzalez@bancochile.cl', empId: 2, cargo: 'Analista Senior RRHH' },
            { rut: '14567890-5', nombre: 'Luis Soto', email: 'lsoto@latam.cl', empId: 3, cargo: 'HR Business Partner' },
            { rut: '15678901-5', nombre: 'Ana Rojas', email: 'arojas@entel.cl', empId: 4, cargo: 'IT Recruiter' },
            { rut: '16789012-5', nombre: 'Jorge Tapia', email: 'jtapia@falabella.cl', empId: 5, cargo: 'Coordinador de Selección' }
        ];

        const ofertasData = {
            1: [ // Codelco
                { tit: 'Ingeniero de Proyectos Mina', desc: 'Buscamos un ingeniero para liderar proyectos de optimización de procesos en rajo abierto. Deberá coordinar equipos multidisciplinarios y asegurar el cumplimiento de normativas de seguridad.', exp: 'Mínimo 3 años en faena minera.', hab: 'Gestión de proyectos, Liderazgo, Norma ISO 45001, SAP', tipo: 'empleo', fac: 'Facultad de Ingeniería', car: ['Ingeniería Civil Industrial', 'Ingeniería Mecánica'] },
                { tit: 'Práctica: Desarrollo de Software Industrial', desc: 'Únete a nuestro equipo de innovación digital. El practicante apoyará en la programación de paneles de control IoT para maquinaria pesada.', exp: 'Estudiante de último año, sin experiencia laboral previa requerida.', hab: 'Python, C++, IoT, Trabajo en equipo', tipo: 'practica', fac: 'Facultad de Ingeniería', car: ['Ingeniería Civil Informática', 'Ingeniería Civil Eléctrica'] },
                { tit: 'Especialista en Evaluación Ambiental', desc: 'Se requiere profesional para realizar estudios de impacto ambiental y proponer estrategias de mitigación en nuevos yacimientos.', exp: 'Al menos 2 años en estudios ambientales.', hab: 'Evaluación de Impacto, Normativa Ambiental, Sistemas de Información Geográfica (SIG)', tipo: 'empleo', fac: 'Facultad de Ciencias Agronómicas', car: ['Agronomía'] }
            ],
            2: [ // Banco de Chile
                { tit: 'Analista de Riesgo Crediticio', desc: 'Responsable de evaluar carteras de clientes empresas y modelar escenarios de riesgo macroeconómico. Se requiere alta capacidad analítica.', exp: '2 años en el sector financiero o banca.', hab: 'Excel Avanzado, Modelamiento Financiero, SQL, Análisis Crítico', tipo: 'empleo', fac: 'Facultad de Administración y Economía', car: ['Ingeniería Comercial', 'Ingeniería en Información y Control de Gestión'] },
                { tit: 'Data Scientist (Prevención de Fraudes)', desc: 'Buscamos talento para diseñar y entrenar algoritmos de Machine Learning enfocados en la detección de transacciones anómalas en tiempo real.', exp: 'Experiencia comprobable en modelos predictivos (puede ser tesis).', hab: 'Python, R, Machine Learning, TensorFlow, Big Data', tipo: 'empleo', fac: 'Facultad de Ciencias', car: ['Licenciatura en Matemática'] },
                { tit: 'Práctica: Auditoría Interna', desc: 'Apoyo en la revisión de procesos internos, control de normativas CMF y levantamiento de matrices de riesgo operacional.', exp: 'Sin experiencia previa. Estudiante regular.', hab: 'Contabilidad, Auditoría, Normativa IFRS, Proactividad', tipo: 'practica', fac: 'Facultad de Administración y Economía', car: ['Contador Auditor'] }
            ],
            3: [ // Latam
                { tit: 'Ingeniero de Confiabilidad Aeronáutica', desc: 'Mantenimiento predictivo e ingeniería de confiabilidad para flota Boeing. Análisis de fallas e implementación de mejoras.', exp: 'Deseable 1 año en mantenimiento industrial.', hab: 'Termodinámica, Análisis de Fallas, Inglés Técnico avanzado', tipo: 'empleo', fac: 'Facultad de Ingeniería', car: ['Ingeniería Mecánica', 'Ingeniería Civil Eléctrica'] },
                { tit: 'Psicólogo/a Organizacional', desc: 'Liderar procesos de reclutamiento de tripulantes de cabina, realizar entrevistas por competencias y aplicar pruebas psicométricas.', exp: '2 años en selección masiva.', hab: 'Entrevistas por competencias, Test de Zulliger, Liderazgo, Empatía', tipo: 'empleo', fac: 'Facultad de Ciencias Sociales y Jurídicas', car: ['Psicología'] },
                { tit: 'Trainee: Optimización de Rutas', desc: 'Programa de talentos para analizar datos de vuelo y proponer optimizaciones de consumo de combustible y logística de tripulación.', exp: 'Recién egresado.', hab: 'Logística, Python, Análisis estadístico, Resolución de problemas', tipo: 'empleo', fac: 'Facultad de Ingeniería', car: ['Ingeniería Civil Industrial', 'Ingeniería Civil Informática'] }
            ],
            4: [ // Entel
                { tit: 'Cloud Architect', desc: 'Diseño e implementación de soluciones en la nube (AWS/Azure) para clientes corporativos. Migración de infraestructura legacy.', exp: '3+ años en arquitectura Cloud.', hab: 'AWS, Kubernetes, Terraform, CI/CD, Microservicios', tipo: 'empleo', fac: 'Facultad de Ingeniería', car: ['Ingeniería Civil Informática'] },
                { tit: 'Abogado/a de Asuntos Regulatorios', desc: 'Asesoría jurídica en materia de telecomunicaciones, revisión de contratos tecnológicos y representación ante la Subtel.', exp: 'Mínimo 4 años en derecho corporativo o regulatorio.', hab: 'Derecho Corporativo, Ley de Telecomunicaciones, Negociación', tipo: 'empleo', fac: 'Facultad de Ciencias Sociales y Jurídicas', car: ['Derecho'] },
                { tit: 'Pasantía: Analista NOC', desc: 'Pasantía de verano para monitorear el centro de operaciones de red, detectar caídas de señal y escalar incidencias.', exp: 'No requiere experiencia.', hab: 'Redes TCP/IP, Linux Básico, Trabajo bajo presión', tipo: 'pasantia', fac: 'Facultad de Ingeniería', car: ['Ingeniería Civil Eléctrica', 'Ingeniería Civil Informática'] }
            ],
            5: [ // Falabella
                { tit: 'Product Manager E-commerce', desc: 'Liderar el roadmap de la app móvil. Definir KPIs, trabajar con equipos ágiles (UX/Devs) y aumentar la tasa de conversión.', exp: '2 años como Product Owner o Product Manager.', hab: 'Metodologías Ágiles (Scrum), Google Analytics, Visión Estratégica', tipo: 'empleo', fac: 'Facultad de Administración y Economía', car: ['Ingeniería Comercial', 'Ingeniería en Información y Control de Gestión'] },
                { tit: 'Práctica Trabajador Social (Bienestar)', desc: 'Apoyo en la gerencia de Bienestar. Gestión de beneficios corporativos, atención a colaboradores y levantamiento de casos sociales.', exp: 'Estudiante en busca de práctica profesional.', hab: 'Empatía, Manejo de crisis, Conocimiento de red pública de salud', tipo: 'practica', fac: 'Facultad de Ciencias Sociales y Jurídicas', car: ['Trabajo Social'] },
                { tit: 'Analista de Control de Gestión', desc: 'Control presupuestario de las tiendas físicas, análisis de mermas, y reportabilidad directa a gerencia de operaciones.', exp: '1 año en control de gestión.', hab: 'PowerBI, Excel Experto, SAP FI/CO, Orientación a resultados', tipo: 'empleo', fac: 'Facultad de Administración y Economía', car: ['Ingeniería Comercial', 'Contador Auditor'] }
            ]
        };

        for (let r of reclutadoresData) {
            // Crear usuario
            const resUser = await db.query(
                `INSERT INTO usuarios (rut, nombre_completo, email, password_hash, rol, verificado) VALUES ($1, $2, $3, '123456', 'reclutador', TRUE) RETURNING id`,
                [r.rut, r.nombre, r.email]
            );
            const rId = resUser.rows[0].id;

            // Crear perfil
            await db.query(`INSERT INTO perfil_reclutadores (usuario_id, empresa_id, cargo) VALUES ($1, $2, $3)`, [rId, r.empId, r.cargo]);
            
            // Insertar ofertas
            const ofertas = ofertasData[r.empId];
            for (let o of ofertas) {
                await db.query(`
                    INSERT INTO ofertas_laborales 
                    (empresa_id, reclutador_id, titulo, descripcion, experiencia_solicitada, habilidades_requeridas, tipo, estado, facultad_requerida, carrera_requerida) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, 'publicada', $8, $9)
                `, [r.empId, rId, o.tit, o.desc, o.exp, o.hab, o.tipo, o.fac, o.car]);
            }
        }

        // Postulantes Ricos en Datos
        const postulantesData = [
            { rut: '20111222-1', nombre: 'Pedro Fuentes', email: 'pedro@alumnos.uta.cl', fac: 'Facultad de Ingeniería', car: 'Ingeniería Civil Informática', cohorte: 2018, 
              resumen: 'Desarrollador Full Stack apasionado por la creación de soluciones eficientes. Me especializo en ecosistemas JavaScript (Node.js, React). En busca de mi primera oportunidad profesional desafiante.',
              exp: '- Proyecto de Título: Sistema predictivo de demanda usando IA (2023).\n- Freelance: Desarrollo de e-commerce para pyme local (2022).',
              hab: 'JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker, Git', renta: 1200000 },
            
            { rut: '20222333-2', nombre: 'Sofía Arancibia', email: 'sofia@alumnos.uta.cl', fac: 'Facultad de Administración y Economía', car: 'Ingeniería Comercial', cohorte: 2019,
              resumen: 'Ingeniera Comercial con fuerte enfoque en control de gestión y finanzas. Altamente analítica, orientada a objetivos y con capacidad para trabajar bajo presión.',
              exp: '- Práctica Profesional en Banco Estado: Apoyo en análisis crediticio Pyme.\n- Ayudantía: Finanzas Corporativas (2 semestres).',
              hab: 'Excel Avanzado (Macros), PowerBI, Análisis Financiero, Liderazgo', renta: 1100000 },
              
            { rut: '20333444-3', nombre: 'Mateo Rojas', email: 'mateo@alumnos.uta.cl', fac: 'Facultad de Ciencias', car: 'Licenciatura en Matemática', cohorte: 2020,
              resumen: 'Matemático con alto interés en el análisis de datos y machine learning. Me encanta encontrar patrones ocultos en grandes volúmenes de datos para aportar valor al negocio.',
              exp: '- Investigación académica: Modelamiento de propagación de virus usando ecuaciones diferenciales.\n- Proyecto Personal: Dashboards interactivos de datos de criptomonedas.',
              hab: 'Python (Pandas, Scikit-Learn), R, SQL, Pensamiento Lógico, Estadística Avanzada', renta: 1500000 },
              
            { rut: '20444555-4', nombre: 'Camila Vergara', email: 'camila@alumnos.uta.cl', fac: 'Facultad de Ciencias Sociales y Jurídicas', car: 'Psicología', cohorte: 2017,
              resumen: 'Psicóloga Organizacional titulada. Disfruto construyendo mejores climas laborales y detectando el talento adecuado para cada cultura corporativa.',
              exp: '- Analista de Selección Junior en Consultora HR (1 año).\n- Práctica en Desarrollo Organizacional en empresa constructora.',
              hab: 'Reclutamiento TI, Test de Lüscher, Zulliger, Entrevistas STAR, Empatía, Resolución de conflictos', renta: 1000000 },
              
            { rut: '20555666-5', nombre: 'Lucas Morales', email: 'lucas@alumnos.uta.cl', fac: 'Facultad de Ciencias Agronómicas', car: 'Agronomía', cohorte: 2019,
              resumen: 'Agrónomo enfocado en la sustentabilidad y eficiencia hídrica. Busco integrar tecnología a los procesos agrícolas tradicionales.',
              exp: '- Práctica Agrícola: Manejo de riego tecnificado en Valle de Azapa.\n- Trabajo de campo en control de plagas.',
              hab: 'Sistemas de Riego, SIG (QGIS), Manejo Integrado de Plagas, Trabajo en Terreno', renta: 950000 }
        ];

        for (let p of postulantesData) {
            const resUser = await db.query(
                `INSERT INTO usuarios (rut, nombre_completo, email, password_hash, rol, verificado) VALUES ($1, $2, $3, '123456', 'postulante', TRUE) RETURNING id`,
                [p.rut, p.nombre, p.email]
            );
            await db.query(
                `INSERT INTO perfil_postulantes (usuario_id, carrera, facultad, cohorte, resumen, experiencia, habilidades, expectativa_renta) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
                [resUser.rows[0].id, p.car, p.fac, p.cohorte, p.resumen, p.exp, p.hab, p.renta]
            );
        }

        console.log('✅ ¡Base de datos recreada exitosamente con datos de prueba!');
        console.log('--------------------------------------------------');
        console.log('Ahora puedes iniciar sesión con:');
        console.log('Admin: admin@uta.cl / admin123');
        console.log('Reclutador: carlos@codelco.cl / 123456');
        console.log('Postulante: pedro@alumnos.uta.cl / 123456');
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ Error al resetear la base de datos:', error);
    } finally {
        process.exit();
    }
}

resetDatabase();
