# Sistema de Licitaciones UTA - Unidad 2

Repositorio del Sistema de Licitaciones UTA, correspondiente a la Licitacion Mercado Publico 726931-1-LE26. Plataforma de intermediacion laboral que conecta ofertas y vacantes con estudiantes y titulados de la Universidad de Tarapaca, integrando evaluacion de compatibilidad semantica mediante Google Gemini y comunicacion en tiempo real por WebSockets.

---

## Arquitectura de Microservicios (Opcion 1 - Docker Compose)

El sistema esta modularizado en 7 contenedores organizados mediante Docker Compose:

1. **gateway** (`nginx:alpine`): Proxy inverso perimetral que centraliza el trafico y enruta peticiones hacia `/`, `/api/`, `/api/ia/` y `/socket.io/`.
2. **frontend** (`nginx:alpine`): Servidor estatico para la interfaz web, hojas de estilo CSS, scripts y vistas HTML.
3. **backend-core** (`node:20-alpine`): API REST transaccional (autenticacion JWT, gestion de postulaciones, ATS y chat Socket.IO).
4. **ia-service** (`node:20-alpine`): Microservicio REST enfocado en analisis de compatibilidad de perfil usando Google Gemini.
5. **redis** (`redis:7-alpine`): Broker en memoria y adaptador Pub/Sub para Socket.IO.
6. **postgres-db** (`postgres:18-alpine`): Motor de base de datos relacional con volumen persistente (`pg_data`) y auto-inicializacion (`01_script_creacion.sql` y `02_datos_iniciales.sql`).
7. **portainer** (`portainer/portainer-ce`): Panel grafico de observabilidad y monitoreo en el puerto 9000.

---

## Estructura del Repositorio

```text
licitacion_uta/
├── docker-compose.yml
├── .env.example
├── README.md
├── gateway/
│   ├── Dockerfile
│   └── nginx.conf
├── database/
│   ├── 01_script_creacion.sql
│   └── 02_datos_iniciales.sql
├── src/
│   ├── frontend/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   ├── public/
│   │   └── views/
│   ├── backend-core/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── routes/
│   └── ia-module/
│       ├── Dockerfile
│       ├── package.json
│       ├── server.js
│       └── recomendador.js
```

---

## Configuracion del Entorno (.env)

Copia la plantilla `.env.example` hacia `.env` y configura tus valores:

```bash
cp .env.example .env
```

Variables principales:
- `COMPOSE_PROFILES`: `all` para local; `gateway,redis,monitoring` para VM1; `app` para VM2/VM3; `db` para VM4.
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Credenciales de PostgreSQL.
- `DOCKER_DB_HOST`: Nombre DNS en Docker (`postgres-db`) o IP privada en VMs (`10.0.0.11` / `10.0.0.4`).
- `DOCKER_REDIS_HOST`: Nombre DNS (`redis`) o IP privada (`10.0.0.1`).
- `GATEWAY_PORT`: Puerto expuesto en el host (por defecto 8888 o 80).
- `GEMINI_API_KEY`: Clave de API de Google Gemini (obligatoria para el microservicio de IA).
- `JWT_SECRET`: Llave secreta para emision y validacion de tokens.

---

## Ejecucion Local (Todos los servicios)

Para construir y levantar los 7 contenedores en tu estacion de trabajo:

```bash
docker compose up -d --build
```

Verificar estado de los contenedores:

```bash
docker compose ps
```

Visualizar logs en tiempo real:

```bash
docker compose logs -f
```

Detener los servicios:

```bash
docker compose down
```

---

## Despliegue en Maquinas Virtuales mediante Perfiles

Cada maquina virtual levanta unicamente los servicios correspondientes utilizando la bandera `--profile`:

### VM1: Servidor Perimetral (Gateway, Redis y Monitoreo Portainer)
```bash
docker compose --profile gateway --profile redis --profile monitoring up -d
```

### VM2 y VM3: Servidores de Aplicacion (Frontend, Backend Core e IA Service)
```bash
docker compose --profile app up -d
```

### VM4: Servidor de Persistencia (Base de Datos PostgreSQL 18)
```bash
docker compose --profile db up -d
```

### VM5: Servidor de Contingencia y Replica
Mantiene la replica pasiva de base de datos para alta disponibilidad y conmutacion.

---

## Credenciales Iniciales de Prueba

El contenedor de base de datos se auto-inicializa con los siguientes usuarios predeterminados:

- **Administrador**: `admin@uta.cl` / Contrasena: `admin123`
- **Reclutador**: `csilva@codelco.cl` / Contrasena: `123456`
- **Postulante**: `pedro@alumnos.uta.cl` / Contrasena: `123456`

---

## Sistema de Respaldos y Restauracion (Requisito 4.7)

El proyecto cuenta con un sistema de respaldo y recuperacion ante desastres para PostgreSQL 18 ejecutandose en Docker, con politicas de retencion automatica y tareas programadas en Linux Cron.

### 1. Scripts Disponibles

- `database/scripts/backup.sh`: Ejecuta `pg_dump` dentro de `licitacion_postgres`, comprime la salida con `gzip -9`, valida la integridad del archivo, elimina respaldos de mas de 7 dias y mantiene un maximo estricto de los 5 respaldos mas recientes.
- `database/scripts/restore.sh`: Termina conexiones activas y restaura un volcado `.sql.gz` o `.sql` de forma atomica sobre el contenedor de base de datos.

### 2. Automatizacion con Linux Cron (Cada 5 minutos)

Para programar el respaldo automatico cada 5 minutos en la **VM4 (o host de persistencia)**:

1. Asignar permisos de ejecucion a los scripts:
   ```bash
   chmod +x database/scripts/*.sh
   ```

2. Abrir el editor de tareas programadas de Linux:
   ```bash
   crontab -e
   ```

3. Agregar la siguiente linea al final del archivo:
   ```bash
   */5 * * * * /home/victor/licitacion_uta/database/scripts/backup.sh >> /home/victor/licitacion_uta/backups/backup.log 2>&1
   ```

### 3. Procedimiento de Prueba y Evidencia (Disaster Recovery)

Para demostrar al evaluador el correcto funcionamiento del ciclo de vida de los datos:

1. **Generar respaldo manual o esperar 5 minutos**:
   ```bash
   ./database/scripts/backup.sh
   ```
   *Verificar que se genera el archivo en `backups/` y el registro en `backups/backup.log`:*
   ```bash
   ls -lh backups/
   tail -n 10 backups/backup.log
   ```

2. **Simular desastre (Borrado de prueba)**:
   ```bash
   docker exec -it licitacion_postgres psql -U admin_proyecto -d db_licitacion -c "DELETE FROM ofertas_laborales WHERE id = 1;"
   ```

3. **Ejecutar la restauracion**:
   ```bash
   ./database/scripts/restore.sh $(ls -1t backups/db_licitacion_*.sql.gz | head -n 1)
   ```

4. **Verificar recuperacion exitosa**:
   ```bash
   docker exec -it licitacion_postgres psql -U admin_proyecto -d db_licitacion -c "SELECT id, titulo FROM ofertas_laborales WHERE id = 1;"
   ```
