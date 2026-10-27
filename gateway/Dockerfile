FROM nginx:1.27-alpine

LABEL maintainer="Víctor Cheuque García <admin@uta.cl>"
LABEL description="Gateway perimetral y Reverse Proxy para Sistema de Licitaciones UTA"

# Reemplazar la configuración por defecto de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto HTTP (80) y el puerto TCP de BD (5432)
EXPOSE 80 5432

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
