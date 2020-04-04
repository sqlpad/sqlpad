FROM node:12.16.1-alpine AS build

RUN apk add --update --no-cache \
    python \
    make \
    g++

WORKDIR /sqlpad

# By copying just the package files and installing node layers, 
# we can take advantage of caching
# SQLPad is really 3 node projects though
# * root directory for linting
# * client/ for web front end
# * server/ for server (and what eventually holds built front end)
COPY ./package* ./
COPY ./client/package* ./client
COPY ./server/package* ./server

# Install dependencies
RUN npm ci
RUN npm ci --prefix client
RUN npm ci --prefix server

# Copy rest of the project into docker
COPY . .

# Build front-end and copy files into server public dir
RUN npm run build --prefix && \
    rm -rf server/public && \
    mkdir server/public && \
    cp -r client/build/* server/public

# Build test db used for dev, debugging and running tests
RUN node server/generate-test-db-fixture.js

# Run tests and linting to validate build
RUN npm run test --prefix server
RUN npm run lint

# Remove any dev dependencies from server
# We don't care about root or client directories 
# as they are not going to be copied to next stage
RUN npm prune --production

# Start another stage with a fresh node
# Copy the server directory that has all the necessary node modules + front end build

FROM node:12.16.1-alpine

WORKDIR /usr/app

COPY --from=build /sqlpad/server ./server
COPY --from=build /sqlpad/docker-entrypoint .
COPY --from=build /sqlpad/Dockerfile .

ENV NODE_ENV production
EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint"]

# Things to think about for future docker builds
# Should nginx be used to front sqlpad?
# Should ODBC drivers be installed? (add your own at this point if you are modifying)
# Should a healthcheck be added?

RUN ["chmod", "+x", "/docker-entrypoint"]

WORKDIR /var/lib/sqlpad
