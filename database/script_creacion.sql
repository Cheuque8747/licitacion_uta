-- Enum para Roles de Usuario
CREATE TYPE rol_usuario AS ENUM ('postulante', 'empresa', 'administrador');

-- Tabla Base de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Perfil de Postulantes (Estudiantes y Titulados)
CREATE TABLE perfil_postulantes (
    usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    carrera VARCHAR(100),
    facultad VARCHAR(100),
    cohorte INTEGER,
    expectativa_renta INTEGER,
    cv_texto TEXT, -- Para el análisis de la IA
    cv_url VARCHAR(255)
);

-- Perfil de Empresas (Reclutadores)
CREATE TABLE perfil_empresas (
    usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_empresa VARCHAR(150) NOT NULL,
    rut_empresa VARCHAR(20) NOT NULL,
    rubro VARCHAR(100),
    descripcion TEXT
);

-- Ofertas Laborales (Empleos, Prácticas, Pasantías)
CREATE TYPE tipo_oferta AS ENUM ('empleo', 'practica', 'pasantia');
CREATE TYPE estado_oferta AS ENUM ('borrador', 'pendiente', 'publicada', 'cerrada');

CREATE TABLE ofertas_laborales (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES perfil_empresas(usuario_id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo tipo_oferta NOT NULL,
    estado estado_oferta DEFAULT 'pendiente',
    fecha_publicacion TIMESTAMP,
    fecha_cierre TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Postulaciones (Relación entre Postulantes y Ofertas)
CREATE TABLE postulaciones (
    id SERIAL PRIMARY KEY,
    oferta_id INTEGER REFERENCES ofertas_laborales(id) ON DELETE CASCADE,
    postulante_id INTEGER REFERENCES perfil_postulantes(usuario_id) ON DELETE CASCADE,
    estado_avance VARCHAR(50) DEFAULT 'enviada', -- ej: enviada, en revisión, entrevistado, contratado
    match_score DECIMAL(5,2), -- % de match calculado por la IA
    feedback_ia TEXT, -- Retroalimentación de brechas (IA)
    fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(oferta_id, postulante_id)
);

-- Gestión de Contenidos (CMS: Noticias, Eventos, Banners)
CREATE TYPE tipo_contenido AS ENUM ('noticia', 'evento', 'banner', 'encuesta');

CREATE TABLE contenidos_cms (
    id SERIAL PRIMARY KEY,
    administrador_id INTEGER REFERENCES usuarios(id),
    tipo tipo_contenido NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    cuerpo TEXT,
    url_imagen VARCHAR(255),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
