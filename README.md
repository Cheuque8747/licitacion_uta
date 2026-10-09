# Sistema de Licitaciones UTA

Este es el repositorio del Sistema de Licitaciones UTA, una plataforma que conecta ofertas laborales y de prácticas con postulantes. El sistema facilita el reclutamiento y la selección con herramientas modernas como chat en tiempo real y análisis mediante inteligencia artificial.

## 🚀 Funcionalidades del Sistema

El sistema ofrece varias funcionalidades organizadas en módulos que cubren todo el proceso de reclutamiento:

1. **Sistema de Autenticación y Seguridad (Auth)**: Controla el acceso a la plataforma usando tokens de seguridad (JWT) y encripta las contraseñas con bcrypt.

2. **Gestión de Perfiles**: Define perfiles distintos para reclutadores (empresas) y postulantes (estudiantes o profesionales), con datos como habilidades, experiencia y expectativas salariales.

3. **Gestión de Ofertas y Postulaciones**:

- Creación, edición y publicación de ofertas de empleo y prácticas.

- Búsqueda avanzada de ofertas y sistema de postulación directa.

4. **Chat en Tiempo Real**: Permite comunicación instantánea entre reclutadores y postulantes, utilizando Socket.io para mantener la conexión activa.

5. **Módulo de Analíticas y Dashboard**: Ofrece una vista clara de métricas clave como cantidad de postulaciones, ofertas activas y estadísticas de interacción.

6. **Sistema CMS (Content Management System)**: Facilita la gestión del contenido de la plataforma, como páginas estáticas y noticias.

7. **Integración con Inteligencia Artificial (Módulo IA)**: Usa la API de Google Gemini para analizar datos y brindar asistencia inteligente, como sugerencias de candidatos o recomendaciones de ofertas.

## 👥 Roles del Sistema

El sistema opera con tres tipos de usuarios, cada uno con funciones específicas:

1. **Administrador (`administrador`)**:

- Tiene control total sobre la plataforma.

- Gestiona usuarios, configuraciones generales y monitorea el sistema.

2. **Reclutador / Empresa (`reclutador`)**:

- Representa a una empresa.

- Crea ofertas de trabajo, prácticas o pasantías.

- Revisa perfiles de postulantes y se comunica con ellos por chat.

3. **Postulante (`postulante`)**:

- Busca oportunidades laborales o de prácticas.

- Llena su perfil profesional con datos como carrera, habilidades y experiencia.

- Puede postular a ofertas y chatear con reclutadores.

## ⚙️ Configuración del Entorno (`.env`)

Para que el sistema funcione, debes crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env

# Configuración de Base de Datos (PostgreSQL)

DB_USER=admin_proyecto

DB_HOST=localhost

DB_NAME=db_licitacion

DB_PASSWORD=tu_contraseña_db

DB_PORT=5432

# Configuración del Servidor Node.js

PORT=3000

# Seguridad

JWT_SECRET=super_secret_jwt_key_uta_2024

# Integración con IA

GEMINI_API_KEY=tu_api_key_de_google_gemini

# Configuración de Redis (Requerido para el chat en entornos escalados)

REDIS_HOST=127.0.0.1

REDIS_PORT=6379

REDIS_PASSWORD=tu_contrasena_redis_si_aplica

```

## 🖥️ Despliegue: Local vs Producción (Máquinas Virtuales)

El sistema puede ejecutarse tanto en entornos locales como en producción.

### 1. Despliegue Local (Desarrollo)

Para trabajar en tu máquina, sigue estos pasos:

1. **Instalar dependencias**:

```bash

npm install

```

2. **Configurar el entorno**: Crea el archivo `.env` con tus datos de base de datos local y Redis.

3. **Poblar la base de datos**: Usa el script para llenar la base con datos de prueba.

```bash

node reset_db.js

```

4. **Iniciar el servidor**:

```bash

npm run dev

# o

npm start

```

La aplicación estará disponible en `http://localhost:3000`.

### 2. Despliegue en Máquinas / Servidores (Producción)

En producción, el sistema está diseñado para escalar y mantener alta disponibilidad.

- **Proxy Inverso / Load Balancer (Nginx)**:

La aplicación corre en el puerto 3000, pero no es accesible directamente desde internet. Nginx actúa como proxy inverso, balanceando la carga y manejando HTTP.

- **Gestión de Procesos (PM2)**:

En entornos de producción, se utiliza PM2 para ejecutar el servidor. Esto asegura que el proceso se mantenga activo, se reinicie tras fallos y se ejecute en modo cluster si es necesario.

```bash

pm2 start server.js

```

- **Redis para Escalabilidad de Socket.io**:

En entornos con múltiples servidores, se usa Redis como adaptador para Socket.io. Esto permite que los mensajes en tiempo real lleguen sin problemas, aunque los usuarios se conecten a diferentes máquinas.

- **Base de Datos Dedicada**:

PostgreSQL no debe correr en la misma máquina que la aplicación. Debe estar en un servidor aparte, accesible mediante una IP interna, para mejorar rendimiento, seguridad y facilidad de mantenimiento.