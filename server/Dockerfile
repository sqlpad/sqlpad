FROM node:8-alpine

ENV DEBIAN_FRONTEND noninteractive
ENV NODE_ENV production

WORKDIR /usr/app

COPY . .

RUN npm ci \
    && npm cache clean --force 
    
WORKDIR /var/lib/sqlpad

COPY docker-entrypoint /
RUN chmod +x /docker-entrypoint
ENTRYPOINT ["/docker-entrypoint"]
