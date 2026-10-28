FROM node:20-alpine

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm install --omit=dev

COPY --chown=node:node . .

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
