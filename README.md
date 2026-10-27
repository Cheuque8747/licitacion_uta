# Sistema de Licitaciones UTA

Este es el repositorio del Sistema de Licitaciones UTA, una plataforma que conecta ofertas laborales y de prácticas con postulantes. El sistema facilita el reclutamiento y la selección con herramientas modernas como chat en tiempo real y análisis mediante inteligencia artificial.

## Funcionalidades del Sistema

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

## Roles del Sistema

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

## Configuración del Entorno (`.env`)

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

## Despliegue: Local vs Producción (Máquinas Virtuales)

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

---

## Unidad 2: Arquitectura de Microservicios con Docker

En la Unidad 2, el sistema evoluciona a una **arquitectura basada en contenedores** orquestada con Docker Compose, garantizando aislamiento, reproducibilidad, seguridad perimetral y alta disponibilidad.

### Descomposición de Microservicios (4.5)
1. **`gateway` (Proxy Inverso Nginx):** Punto de entrada único perimetral (puerto 8080 en host). Enruta tráfico a Frontend (`/`), Backend (`/api/`), WebSockets (`/socket.io/`), IA (`/api/ia/`) y expone proxy TCP hacia PostgreSQL (`5432`).
2. **`frontend` (Microservicio Web):** Basado en `nginx:1.27-alpine`. Sirve vistas HTML5 y recursos estáticos de forma desacoplada y ultra rápida.
3. **`backend-core` (Microservicio Transaccional):** Basado en `node:20-alpine`. Gestiona lógica de negocio, autenticación JWT, postulaciones y WebSockets para chat. Corre con usuario no-root (`USER node`).
4. **`ia-service` (Microservicio de Inteligencia Artificial):** Basado en `node:20-alpine`. Expone endpoints REST (`/api/ia/match`) para calcular compatibilidad de CVs con ofertas usando Google Gemini.
5. **`redis` (Caché y Adaptador Pub/Sub):** Almacena sesiones, broker de Socket.io en clúster y memoria contextual de IA (alojado en VM1).
6. **`postgres-db` (Capa de Persistencia Master):** Base de datos relacional con volumen persistente desacoplado (`pg_data`) y réplica en VM5.
7. **`portainer` (Observabilidad y Monitoreo):** Dashboard web (puerto 9000 alojado en VM1 junto al Gateway) para auditar el estado y consumo de los contenedores en tiempo real.

### Topología de Despliegue en las 5 Máquinas Virtuales
* **VM1 (`10.0.0.1` - Gateway, Cache & Monitoreo):** Nginx Gateway (`:8080`), Redis (`:6379`) y Portainer CE (`:9000`).
* **VM2 (`10.0.0.11` - Nodo de Aplicación 1):** Frontend (`:80`), Backend Core (`:3000`) y Microservicio IA (`:5000`).
* **VM3 (`10.0.0.12` - Nodo de Aplicación 2):** Réplica de Frontend, Backend Core e IA para balanceo y alta disponibilidad.
* **VM4 (`10.0.0.21` - Persistencia Principal):** PostgreSQL 18 Master (escucha en `:5432`).
* **VM5 (`10.0.0.22` - Persistencia Réplica & Failover):** PostgreSQL 18 Standby (Streaming Replication en tiempo real desde VM4) + scripts de backup.

### Despliegue Local Rápido (Desarrollo)
1. Asegúrate de tener tu archivo `.env` configurado a partir de `.env.example`.
2. Levanta todo el ecosistema con un solo comando:
```bash
docker compose up --build -d
```
3. Accesos:
   - **Plataforma Web (Gateway):** `http://localhost:8888`
   - **Monitoreo (Portainer):** `http://localhost:9000`
   - **Base de Datos (Proxy TCP):** `localhost:5433`

### Despliegue en Producción Clúster: Docker Swarm (Opción 3)
1. **Abrir puertos de Swarm en las 5 VMs:**
```bash
sudo ufw allow 2377/tcp && sudo ufw allow 7946/tcp && sudo ufw allow 7946/udp && sudo ufw allow 4789/udp
```
2. **Inicializar y unir nodos al Clúster:**
   - En VM1: `docker swarm init --advertise-addr 10.0.0.1`
   - En VM2, VM3, VM4 y VM5: Ejecutar el comando `docker swarm join` generado por VM1.
3. **Etiquetar la Base de Datos:**
   - En VM1: `docker node update --label-add app=db <NOMBRE_VM4>`
4. **Desplegar el Stack Automatizado:**
   - En VM1: `bash scripts/deploy_swarm.sh`
   - Monitorear réplicas: `docker service ls` y `docker stack ps uta_stack`.

### Procedimiento de Respaldos y Restauración (4.7)
* **Generar Respaldo Automatizado:**
```bash
bash scripts/backup.sh
# Genera backup comprimido con gzip en /var/backups_db y rota respaldos conservando los últimos 7.
```
* **Restaurar Base de Datos:**
```bash
bash scripts/restore.sh /var/backups_db/backup_db_licitacion_YYYYMMDD_HHMMSS.sql.gz
```

---

## Presupuesto y Cotización del Proyecto (4.10)

Análisis económico estimado para el desarrollo, infraestructura, operación y licencias del Sistema de Licitaciones UTA:

| Ítem / Concepto | Descripción / Alcance | Costo Unitario | Cantidad / Frecuencia | Total (CLP) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Costos de Desarrollo** | | | | |
| Arquitectura y Containerización | Diseño Docker Compose, microservicios, seguridad no-root y Gateway | $1.200.000 | 1 proyecto | $1.200.000 |
| Desarrollo Backend & Frontend | APIs REST, Chat Socket.io, perfiles, postulaciones y dashboards | $2.400.000 | 1 proyecto | $2.400.000 |
| Integración IA (Gemini API) | Algoritmo de matching semántico y simulador de entrevistas | $800.000 | 1 proyecto | $800.000 |
| QA, Testing & Documentación | Pruebas de estrés, failover, scripts de backup y bitácoras | $600.000 | 1 proyecto | $600.000 |
| **2. Infraestructura (Cloud / VPS Anual)** | | | | |
| Servidor Gateway, Redis & Portainer (VM1) | 2 vCPU, 4GB RAM, 50GB SSD (Equivalente Cloud) | $25.000 / mes | 12 meses | $300.000 |
| Nodos de Aplicación (VM2 y VM3) | 2 vCPU, 4GB RAM c/u (Alta disponibilidad clúster) | $50.000 / mes | 12 meses | $600.000 |
| Base de Datos Master & Réplica (VM4 y VM5) | 4 vCPU, 8GB RAM, 100GB NVMe c/u (PostgreSQL HA) | $70.000 / mes | 12 meses | $840.000 |
| **3. Operación y Mantención Anual** | | | | |
| Soporte Técnico y Monitoreo | Mantenimiento preventivo, auditoría de logs y parches de seguridad | $150.000 / mes | 12 meses | $1.800.000 |
| Almacenamiento de Respaldos Off-site | Repositorio S3 compatible para backups encriptados diarios | $10.000 / mes | 12 meses | $120.000 |
| **4. Inteligencia Artificial (Tokens Gemini)** | | | | |
| Consumo API Google Gemini | Estimación 50.000 análisis curriculares y simulaciones al año | $0,0015 / consulta | 50.000 consultas | $75.000 |
| **TOTAL GENERAL ESTIMADO (Primer Año)** | | | | **$8.735.000 CLP** |