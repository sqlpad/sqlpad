FROM node:6.14-alpine

ENV DEBIAN_FRONTEND noninteractive

# use yarn to upgrade to npm5 because npm can't do it itself?
# https://stackoverflow.com/questions/44269086/how-to-upgrade-npm-to-npm5-on-the-latest-node-docker-image
RUN yarn global add npm@5

WORKDIR /usr/app

COPY . .

RUN npm install \
    && npm run build \
    && rm -rf node_modules \
    && npm install --only=production \
    && npm cache clean --force

WORKDIR /var/lib/sqlpad

COPY docker-entrypoint /
RUN chmod +x /docker-entrypoint
ENTRYPOINT ["/docker-entrypoint"]
