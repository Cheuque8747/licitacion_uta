FROM node:20-alpine

LABEL maintainer="Víctor Cheuque García <admin@uta.cl>"
LABEL description="Microservicio Backend Core para Sistema de Licitaciones UTA"

WORKDIR /app

# Copiar manifiesto de dependencias
COPY package*.json ./

# Instalar dependencias de producción limpiando caché
RUN npm install --only=production && npm cache clean --force

# Copiar el código fuente
COPY . .

# Asignar permisos al usuario no privilegiado 'node'
RUN chown -R node:node /app

# Cambiar a usuario no privilegiado (Requisito obligatorio de seguridad)
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
