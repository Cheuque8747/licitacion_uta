#!/bin/bash
# ==============================================================================
# Script de Despliegue Automatizado para Docker Swarm (Opción 3)
# Sistema de Licitaciones UTA
# ==============================================================================

set -e

REGISTRY_IP=${REGISTRY_IP:-"10.0.0.1"}
REGISTRY_PORT=${REGISTRY_PORT:-"5000"}
REGISTRY="${REGISTRY_IP}:${REGISTRY_PORT}"
STACK_NAME="uta_stack"

echo "=================================================="
echo "[INFO] INICIANDO DESPLIEGUE EN CLUSTER DOCKER SWARM"
echo "[FECHA] $(date)"
echo "[REGISTRO] Registro Local de Imagenes: ${REGISTRY}"
echo "=================================================="

# 1. Verificar si este nodo es Swarm Manager
if ! docker info | grep -q "Swarm: active"; then
    echo "[WARN] El nodo no tiene Swarm inicializado. Inicializando Swarm Manager..."
    docker swarm init --advertise-addr "${REGISTRY_IP}"
    echo "[OK] Swarm inicializado en ${REGISTRY_IP}."
    echo "[INFO] Para unir los workers (VM2, VM3, VM4, VM5), ejecuta en cada una:"
    docker swarm join-token worker | grep "docker swarm join"
fi

# 2. Verificar si el contenedor de Docker Registry local está corriendo
if ! docker ps | grep -q "registry"; then
    echo "[INFO] Levantando Registro Local de Imagenes en el puerto ${REGISTRY_PORT}..."
    docker service rm registry 2>/dev/null || true
    docker rm -f registry 2>/dev/null || true
    docker run -d --name registry --restart=always -p "${REGISTRY_PORT}:5000" registry:2.8.3
    sleep 2
fi

# 3. Compilar las imágenes locales
echo "[BUILD] Compilando imagenes de los microservicios..."
docker compose build gateway frontend backend-core ia-service

# 4. Etiquetar y subir imágenes al Registro Local
echo "[PUSH] Subiendo imagenes al registro local (${REGISTRY})..."
docker tag licitacion-uta-gateway:1.0.0 "${REGISTRY}/licitacion-uta-gateway:1.0.0"
docker tag licitacion-uta-frontend:1.0.0 "${REGISTRY}/licitacion-uta-frontend:1.0.0"
docker tag licitacion-uta-backend-core:1.0.0 "${REGISTRY}/licitacion-uta-backend-core:1.0.0"
docker tag licitacion-uta-ia-service:1.0.0 "${REGISTRY}/licitacion-uta-ia-service:1.0.0"

docker push "${REGISTRY}/licitacion-uta-gateway:1.0.0"
docker push "${REGISTRY}/licitacion-uta-frontend:1.0.0"
docker push "${REGISTRY}/licitacion-uta-backend-core:1.0.0"
docker push "${REGISTRY}/licitacion-uta-ia-service:1.0.0"

# 5. Desplegar el Stack en el Clúster
echo "[DEPLOY] Desplegando el stack '${STACK_NAME}' en el cluster Swarm..."
export REGISTRY="${REGISTRY}"
docker stack deploy -c docker-compose.swarm.yml "${STACK_NAME}"

echo "=================================================="
echo "[OK] Stack desplegado exitosamente!"
echo "[INFO] Monitoreo de replicas:"
echo "   docker service ls"
echo "   docker stack ps ${STACK_NAME}"
echo "=================================================="
