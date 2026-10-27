#!/bin/bash
# ==============================================================================
# Script de Respaldo Automatizado de Base de Datos - Sistema Licitaciones UTA
# Requisito 4.7: Mecanismo de backup con compresión y rotación
# ==============================================================================

set -e

# Configuración de variables (con valores por defecto si no están en entorno)
DB_HOST=${DB_HOST:-"postgres-db"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USER:-"admin_proyecto"}
DB_NAME=${DB_NAME:-"db_licitacion"}
BACKUP_DIR=${BACKUP_DIR:-"/var/backups_db"}
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="backup_${DB_NAME}_${DATE}.sql.gz"

echo "=================================================="
echo "[INFO] Iniciando Respaldo de Base de Datos: ${DB_NAME}"
echo "[FECHA] $(date)"
echo "[DESTINO] ${BACKUP_DIR}/${FILENAME}"
echo "=================================================="

# Crear directorio de respaldos si no existe
mkdir -p "${BACKUP_DIR}"

# Ejecutar pg_dump y comprimir al vuelo con gzip
export PGPASSWORD=${DB_PASSWORD:-"12345"}

if command -v pg_dump > /dev/null 2>&1; then
    pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_DIR}/${FILENAME}"
else
    # Si se ejecuta desde el host físico con Docker Compose
    docker compose exec -T postgres-db pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_DIR}/${FILENAME}"
fi

# Verificar que el archivo se haya creado correctamente y no esté vacío
if [ -s "${BACKUP_DIR}/${FILENAME}" ]; then
    SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
    echo "[OK] Respaldo generado con exito!"
    echo "[INFO] Tamano del archivo: ${SIZE}"
else
    echo "[ERROR] El archivo de respaldo esta vacio o no se genero."
    exit 1
fi

# Rotación de respaldos: Conservar solo los últimos 7 respaldos para ahorrar espacio
echo "[LIMPIEZA] Limpiando respaldos antiguos (conservando los ultimos 7)..."
cd "${BACKUP_DIR}" && ls -tp backup_${DB_NAME}_*.sql.gz 2>/dev/null | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {} 2>/dev/null || true

echo "[OK] Proceso de backup finalizado exitosamente."
echo "=================================================="
