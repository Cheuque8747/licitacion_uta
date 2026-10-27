FROM nginx:1.27-alpine

LABEL maintainer="Víctor Cheuque García <admin@uta.cl>"
LABEL description="Microservicio de Frontend para Sistema de Licitaciones UTA"

# Configuración personalizada de Nginx para el frontend
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

# Copiar archivos públicos (JS, CSS, imágenes) al directorio raíz web
COPY public/ /usr/share/nginx/html/

# Copiar vistas HTML
COPY views/ /usr/share/nginx/html/views/

# Asegurar permisos correctos de lectura
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/login || exit 1

CMD ["nginx", "-g", "daemon off;"]
