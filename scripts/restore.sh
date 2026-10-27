#!/bin/bash
# ==============================================================================
# Script de Restauración de Base de Datos - Sistema Licitaciones UTA
# Requisito 4.7: Procedimiento de restore documentado y probado
# ==============================================================================

set -e

DB_HOST=${DB_HOST:-"postgres-db"}
DB_PORT=${DB_PORT:-"5432"}
DB_USER=${DB_USER:-"admin_proyecto"}
DB_NAME=${DB_NAME:-"db_licitacion"}

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "[ERROR] Debe especificar el archivo de respaldo a restaurar."
    echo "Uso: $0 <ruta_al_archivo_backup.sql.gz>"
    echo "Ejemplo: $0 /var/backups_db/backup_db_licitacion_20261027_120000.sql.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "[ERROR] El archivo '$BACKUP_FILE' no existe."
    exit 1
fi

echo "=================================================="
echo "[INFO] INICIANDO RESTAURACION DE BASE DE DATOS"
echo "[FECHA] $(date)"
echo "[ORIGEN] ${BACKUP_FILE}"
echo "[DESTINO] ${DB_NAME}"
echo "=================================================="

export PGPASSWORD=${DB_PASSWORD:-"12345"}

# Descomprimir y aplicar directamente en PostgreSQL
echo "[INFO] Restaurando tablas y datos..."
if command -v psql > /dev/null 2>&1; then
    gunzip -c "${BACKUP_FILE}" | psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"
else
    # Si se ejecuta desde el host físico con Docker Compose
    gunzip -c "${BACKUP_FILE}" | docker compose exec -T postgres-db psql -U "${DB_USER}" -d "${DB_NAME}"
fi

echo "[INFO] Verificando integridad de tablas restauradas..."
if command -v psql > /dev/null 2>&1; then
    TABLE_COUNT=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
else
    TABLE_COUNT=$(docker compose exec -T postgres-db psql -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
fi

echo "[OK] Restauracion completada con exito!"
echo "[INFO] Tablas activas en el esquema public: ${TABLE_COUNT// /}"
echo "=================================================="
