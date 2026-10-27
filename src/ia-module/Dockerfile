FROM node:20-alpine

LABEL maintainer="Víctor Cheuque García <admin@uta.cl>"
LABEL description="Microservicio de IA (Gemini) para Sistema de Licitaciones UTA"

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --only=production && npm cache clean --force

# Copiar el código fuente
COPY . .

# Asignar permisos al usuario no privilegiado 'node'
RUN chown -R node:node /app

# Cambiar a usuario no root (Requisito obligatorio de seguridad)
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
