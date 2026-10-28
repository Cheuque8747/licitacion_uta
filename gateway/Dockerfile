FROM nginx:1.27-alpine

LABEL maintainer="Victor Cheuque Garcia <victor@uta.cl>"
LABEL description="Gateway perimetral y balanceador Nginx para Sistema de Licitaciones UTA"
LABEL version="2.0.0"

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
