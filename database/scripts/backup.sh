#!/bin/bash
# ==============================================================================
# Script de Respaldo Automatizado - Sistema de Licitaciones UTA
# Requisito 4.7: Sistema de respaldos (PostgreSQL 18 en Docker)
# Politica: Ejecucion cada 5 minutos, retencion maxima de 5 respaldos y 7 dias
# ==============================================================================

set -euo pipefail

# Determinar directorio base del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKUP_DIR="${BASE_DIR}/backups"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Asegurar existencia del directorio de respaldos
mkdir -p "${BACKUP_DIR}"

# Cargar variables de entorno si existe .env
if [ -f "${BASE_DIR}/.env" ]; then
    # shellcheck disable=SC1091
    export $(grep -v '^#' "${BASE_DIR}/.env" | xargs)
fi

DB_USER="${DB_USER:-admin_proyecto}"
DB_NAME="${DB_NAME:-db_licitacion}"
CONTAINER_NAME="licitacion_postgres"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILENAME="db_licitacion_${TIMESTAMP}.sql.gz"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

log_msg() {
    local MSG="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$MSG"
    echo "$MSG" >> "${LOG_FILE}"
}

log_msg "INICIO: Ejecutando respaldo programado de la base de datos '${DB_NAME}'..."

# 1. Verificar si Docker daemon esta corriendo y si el contenedor esta activo
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    log_msg "ERROR: El contenedor '${CONTAINER_NAME}' no se encuentra en ejecucion. Abortando respaldo."
    exit 1
fi

# 2. Ejecutar pg_dump dentro del contenedor y comprimir con gzip
if docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip -9 > "${BACKUP_FILEPATH}"; then
    
    # 3. Validar integridad: comprobar que el archivo no este vacio
    FILESIZE=$(stat -c%s "${BACKUP_FILEPATH}" 2>/dev/null || stat -f%z "${BACKUP_FILEPATH}" 2>/dev/null || wc -c < "${BACKUP_FILEPATH}")
    if [ "${FILESIZE}" -gt 500 ]; then
        HUMAN_SIZE=$(du -h "${BACKUP_FILEPATH}" | cut -f1)
        log_msg "EXITO: Respaldo completado en '${BACKUP_FILENAME}' (Tamano: ${HUMAN_SIZE})."
    else
        log_msg "ADVERTENCIA: El archivo generado es sospechosamente pequeno (${FILESIZE} bytes). Verificar estado de BD."
    fi
else
    log_msg "ERROR: Fallo durante la ejecucion de pg_dump en el contenedor '${CONTAINER_NAME}'."
    rm -f "${BACKUP_FILEPATH}"
    exit 1
fi

# 4. Politica de Rotacion 1: Eliminar respaldos con antiguedad mayor a 7 dias
DELETED_OLD=$(find "${BACKUP_DIR}" -type f -name "db_licitacion_*.sql.gz" -mtime +7 -delete -print 2>/dev/null | wc -l || true)
if [ "${DELETED_OLD}" -gt 0 ]; then
    log_msg "ROTACION: Se eliminaron ${DELETED_OLD} respaldo(s) con mas de 7 dias de antiguedad."
fi

# 5. Politica de Rotacion 2: Mantener estrictamente un maximo de 5 respaldos en la carpeta
# Ordenar por fecha descendente y borrar a partir del 6to archivo mas reciente
TOTAL_BACKUPS=$(ls -1t "${BACKUP_DIR}"/db_licitacion_*.sql.gz 2>/dev/null | wc -l || true)
if [ "${TOTAL_BACKUPS}" -gt 5 ]; then
    EXCESS=$((TOTAL_BACKUPS - 5))
    ls -1t "${BACKUP_DIR}"/db_licitacion_*.sql.gz 2>/dev/null | tail -n +"6" | xargs -r rm -f
    log_msg "ROTACION: Se eliminaron ${EXCESS} respaldo(s) excedentes. Se conservan los 5 mas recientes."
fi

log_msg "FIN: Proceso de respaldo finalizado con exito. Total respaldos activos: $(ls -1 "${BACKUP_DIR}"/db_licitacion_*.sql.gz 2>/dev/null | wc -l)."

