FROM node:8-alpine

ENV DEBIAN_FRONTEND noninteractive

WORKDIR /usr/app

COPY . .

RUN npm install \
    && npm run build \
    && npm prune --production \
    && npm cache clean --force 
    
WORKDIR /var/lib/sqlpad

COPY docker-entrypoint /
RUN chmod +x /docker-entrypoint
ENTRYPOINT ["/docker-entrypoint"]
