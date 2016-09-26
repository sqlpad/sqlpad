FROM node:4.5.0

ENV DEBIAN_FRONTEND noninteractive

ADD sqlpad_version /
RUN npm install sqlpad@$(cat /sqlpad_version) -g

WORKDIR /var/lib/sqlpad
COPY docker-entrypoint /
RUN chmod +x /docker-entrypoint
ENTRYPOINT ["/docker-entrypoint"]
