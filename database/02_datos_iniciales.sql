-- Insercion de Empresas de Prueba
INSERT INTO empresas (nombre_empresa, rut_empresa, rubro, descripcion) VALUES 
('Codelco', '61704000-K', 'Mineria', 'Empresa estatal dedicada a la explotacion y procesamiento de cobre.'),
('Banco de Chile', '97004000-5', 'Banca y Finanzas', 'Institucion financiera lider en servicios bancarios e inversiones.'),
('Latam Airlines', '89862200-2', 'Transporte y Logistica', 'Grupo aeronautico con amplia red de destinos en Sudamerica.'),
('Entel', '92580000-7', 'Telecomunicaciones y TI', 'Empresa proveedora de telecomunicaciones y servicios digitales.'),
('Falabella', '77261280-K', 'Retail y Comercio', 'Plataforma de comercio minorista y soluciones para el cliente.')
ON CONFLICT (rut_empresa) DO NOTHING;

-- Insercion de Usuarios Reclutadores
-- Password generica: 123456 ($2b$10$1QB0/gUVAJLovJJYqqWszenOtcA3JyM9Ww8bZq/uB8mpxY5RC1fVa)
INSERT INTO usuarios (rut, nombre_completo, email, password_hash, rol, verificado) VALUES
('12345678-5', 'Carlos Silva', 'csilva@codelco.cl', '$2b$10$1QB0/gUVAJLovJJYqqWszenOtcA3JyM9Ww8bZq/uB8mpxY5RC1fVa', 'reclutador', TRUE),
('13456789-5', 'Maria Gonzalez', 'mgonzalez@bancochile.cl', '$2b$10$1QB0/gUVAJLovJJYqqWszenOtcA3JyM9Ww8bZq/uB8mpxY5RC1fVa', 'reclutador', TRUE),
('14567890-5', 'Luis Soto', 'lsoto@latam.cl', '$2b$10$1QB0/gUVAJLovJJYqqWszenOtcA3JyM9Ww8bZq/uB8mpxY5RC1fVa', 'reclutador', TRUE),
('15678901-5', 'Ana Rojas', 'arojas@entel.cl', '$2b$10$1QB0/gUVAJLovJJYqqWszenOtcA3JyM9Ww8bZq/uB8mpxY5RC1fVa', 'reclutador', TRUE),
('16789012-5', 'Jorge Tapia', 'jtapia@falabella.cl', '$2b$10$1QB0/gUVAJLovJJYqqWszenOtcA3JyM9Ww8bZq/uB8mpxY5RC1fVa', 'reclutador', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Perfiles de Reclutadores
INSERT INTO perfil_reclutadores (usuario_id, empresa_id, cargo)
SELECT u.id, e.id, 'Jefe de Seleccion y Atraccion de Talento'
FROM usuarios u, empresas e
WHERE u.email = 'csilva@codelco.cl' AND e.nombre_empresa = 'Codelco'
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO perfil_reclutadores (usuario_id, empresa_id, cargo)
SELECT u.id, e.id, 'Analista Senior RRHH'
FROM usuarios u, empresas e
WHERE u.email = 'mgonzalez@bancochile.cl' AND e.nombre_empresa = 'Banco de Chile'
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO perfil_reclutadores (usuario_id, empresa_id, cargo)
SELECT u.id, e.id, 'HR Business Partner'
FROM usuarios u, empresas e
WHERE u.email = 'lsoto@latam.cl' AND e.nombre_empresa = 'Latam Airlines'
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO perfil_reclutadores (usuario_id, empresa_id, cargo)
SELECT u.id, e.id, 'IT Recruiter'
FROM usuarios u, empresas e
WHERE u.email = 'arojas@entel.cl' AND e.nombre_empresa = 'Entel'
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO perfil_reclutadores (usuario_id, empresa_id, cargo)
SELECT u.id, e.id, 'Coordinador de Seleccion'
FROM usuarios u, empresas e
WHERE u.email = 'jtapia@falabella.cl' AND e.nombre_empresa = 'Falabella'
ON CONFLICT (usuario_id) DO NOTHING;

-- Insercion de Usuarios Postulantes
INSERT INTO usuarios (rut, nombre_completo, email, password_hash, rol, verificado) VALUES
('20111222-1', 'Pedro Fuentes', 'pedro@alumnos.uta.cl', '$2b$10$1QB0/gUVAJLovJJYqqWszenOtcA3JyM9Ww8bZq/uB8mpxY5RC1fVa', 'postulante', TRUE),
('20222333-2', 'Sofia Arancibia', 'sofia@alumnos.uta.cl', '$2b$10$1QB0/gUVAJLovJJYqqWszenOtcA3JyM9Ww8bZq/uB8mpxY5RC1fVa', 'postulante', TRUE),
('20333444-3', 'Mateo Rojas', 'mateo@alumnos.uta.cl', '$2b$10$1QB0/gUVAJLovJJYqqWszenOtcA3JyM9Ww8bZq/uB8mpxY5RC1fVa', 'postulante', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Perfiles de Postulantes
INSERT INTO perfil_postulantes (usuario_id, carrera, facultad, cohorte, expectativa_renta, resumen, experiencia, habilidades)
SELECT id, 'Ingenieria Civil Informatica', 'Facultad de Ingenieria', 2018, 1200000,
'Desarrollador Full Stack con enfoque en Node.js, arquitectura distribuida y contenedores.',
'Desarrollo de proyectos academicos y soluciones freelance para pymes.',
'JavaScript, Node.js, Express, PostgreSQL, Docker, Git'
FROM usuarios WHERE email = 'pedro@alumnos.uta.cl'
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO perfil_postulantes (usuario_id, carrera, facultad, cohorte, expectativa_renta, resumen, experiencia, habilidades)
SELECT id, 'Ingenieria Comercial', 'Facultad de Administracion y Economia', 2019, 1100000,
'Ingeniera Comercial con experiencia en control de gestion y evaluacion financiera.',
'Practica profesional en banca y ayudantias en finanzas corporativas.',
'Excel Avanzado, Modelamiento Financiero, PowerBI, SQL'
FROM usuarios WHERE email = 'sofia@alumnos.uta.cl'
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO perfil_postulantes (usuario_id, carrera, facultad, cohorte, expectativa_renta, resumen, experiencia, habilidades)
SELECT id, 'Licenciatura en Matematica', 'Facultad de Ciencias', 2020, 1500000,
'Matematico orientado a ciencia de datos y modelamiento algoritmico.',
'Investigacion aplicada y construccion de modelos estadisticos predictivos.',
'Python, R, Machine Learning, SQL, Estadistica'
FROM usuarios WHERE email = 'mateo@alumnos.uta.cl'
ON CONFLICT (usuario_id) DO NOTHING;

-- Ofertas Laborales Base
INSERT INTO ofertas_laborales (empresa_id, reclutador_id, titulo, descripcion, experiencia_solicitada, habilidades_requeridas, tipo, estado, facultad_requerida, carrera_requerida)
SELECT e.id, u.id, 'Ingeniero de Proyectos Mina',
'Liderar proyectos de optimizacion operativa en faena. Coordinacion de equipos tecnicos y control de estandares.',
'Minimo 3 anos en mineria o faenas industriales.',
'Gestion de proyectos, Liderazgo, Seguridad ISO, SAP',
'empleo', 'publicada', 'Facultad de Ingenieria', ARRAY['Ingenieria Civil Industrial', 'Ingenieria Mecanica']
FROM empresas e, usuarios u
WHERE e.nombre_empresa = 'Codelco' AND u.email = 'csilva@codelco.cl';

INSERT INTO ofertas_laborales (empresa_id, reclutador_id, titulo, descripcion, experiencia_solicitada, habilidades_requeridas, tipo, estado, facultad_requerida, carrera_requerida)
SELECT e.id, u.id, 'Practica Profesional Desarrollo de Software',
'Integrarse al equipo de transformacion digital para construir interfaces y servicios backend en infraestructura de nube.',
'Estudiante regular de ultimo ano.',
'Node.js, PostgreSQL, Docker, JavaScript, Git',
'practica', 'publicada', 'Facultad de Ingenieria', ARRAY['Ingenieria Civil Informatica', 'Ingenieria de Ejecucion en Computacion e Informatica']
FROM empresas e, usuarios u
WHERE e.nombre_empresa = 'Codelco' AND u.email = 'csilva@codelco.cl';

INSERT INTO ofertas_laborales (empresa_id, reclutador_id, titulo, descripcion, experiencia_solicitada, habilidades_requeridas, tipo, estado, facultad_requerida, carrera_requerida)
SELECT e.id, u.id, 'Analista de Riesgo Financiero',
'Evaluacion de modelos crediticios y analisis cuantitativo de carteras de clientes comerciales.',
'2 anos en instituciones financieras o auditoria.',
'Excel Avanzado, Finanzas Corporativas, SQL, PowerBI',
'empleo', 'publicada', 'Facultad de Administracion y Economia', ARRAY['Ingenieria Comercial', 'Contador Auditor']
FROM empresas e, usuarios u
WHERE e.nombre_empresa = 'Banco de Chile' AND u.email = 'mgonzalez@bancochile.cl';
