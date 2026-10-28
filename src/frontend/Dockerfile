FROM nginx:1.27-alpine

LABEL maintainer="Victor Cheuque Garcia <victor@uta.cl>"
LABEL description="Frontend Web Nginx para Sistema de Licitaciones UTA"
LABEL version="2.0.0"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public /usr/share/nginx/html/public
COPY views /usr/share/nginx/html/views

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
