#!/bin/bash
# ==============================================================================
# Script de Restauracion (Restore) - Sistema de Licitaciones UTA
# Requisito 4.7: Procedimiento de restore de la base de datos PostgreSQL
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKUP_DIR="${BASE_DIR}/backups"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Cargar variables de entorno si existe .env
if [ -f "${BASE_DIR}/.env" ]; then
    # shellcheck disable=SC1091
    export $(grep -v '^#' "${BASE_DIR}/.env" | xargs)
fi

DB_USER="${DB_USER:-admin_proyecto}"
DB_NAME="${DB_NAME:-db_licitacion}"
CONTAINER_NAME="licitacion_postgres"

log_msg() {
    local MSG="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$MSG"
    echo "$MSG" >> "${LOG_FILE}"
}

# 1. Validar argumento de entrada
if [ $# -eq 0 ]; then
    echo "========================================================================"
    echo "Uso: $0 <ruta_al_archivo_de_respaldo>"
    echo "Ejemplo: $0 ${BACKUP_DIR}/db_licitacion_20261028_140000.sql.gz"
    echo "========================================================================"
    echo "Respaldos disponibles en '${BACKUP_DIR}':"
    ls -lh "${BACKUP_DIR}"/db_licitacion_*.sql.gz 2>/dev/null || echo "No se encontraron respaldos."
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: El archivo de respaldo '${BACKUP_FILE}' no existe."
    exit 1
fi

# 2. Verificar que el contenedor de PostgreSQL este corriendo
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "ERROR: El contenedor '${CONTAINER_NAME}' no esta en ejecucion. Inicielo con 'docker compose up -d postgres-db'."
    exit 1
fi

log_msg "INICIO: Iniciando restauracion de base de datos desde '${BACKUP_FILE}'..."

# 3. Terminar conexiones activas a la base de datos para evitar bloqueos
echo "Cerrando conexiones activas hacia '${DB_NAME}'..."
docker exec -t "${CONTAINER_NAME}" psql -U "${DB_USER}" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true

# 4. Ejecutar la restauracion segun el formato (comprimido .gz o plano .sql)
echo "Aplicando volcado SQL sobre el contenedor '${CONTAINER_NAME}'..."
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    gzip -dc "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" >/dev/null
else
    docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}" >/dev/null
fi

log_msg "EXITO: Base de datos '${DB_NAME}' restaurada satisfactoriamente desde '${BACKUP_FILE}'."

# 5. Verificacion basica de conteo de tablas
TABLE_COUNT=$(docker exec -t "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -t -A -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "========================================================================"
echo "Restauracion completada con exito."
echo "Tablas activas en '${DB_NAME}': ${TABLE_COUNT}"
echo "========================================================================"

