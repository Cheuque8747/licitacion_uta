FROM node:20-alpine

LABEL maintainer="Victor Cheuque Garcia <victor@uta.cl>"
LABEL description="Microservicio de Evaluacion Semantica Laboral con Google Gemini"
LABEL version="2.0.0"

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node . .

USER node

EXPOSE 5001

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5001/health || exit 1

CMD ["node", "server.js"]
