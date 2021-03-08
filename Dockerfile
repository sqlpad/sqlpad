# Need to remote into this image and debug some flow? 
# docker run -it --rm node:12.21-alpine3.12 /bin/ash
FROM node:12.21-alpine3.12 AS build

RUN apk add --update --no-cache \
    python3 \
    make \
    g++

RUN npm config set python /usr/bin/python3

WORKDIR /sqlpad

# By copying just the package files and installing node layers, 
# we can take advantage of caching
# SQLPad is really 3 node projects though
# * root directory for linting
# * client/ for web front end
# * server/ for server (and what eventually holds built front end)
COPY ./package* ./
COPY ./client/package* ./client/
COPY ./server/package* ./server/

# Install dependencies
RUN npm ci
RUN npm ci --prefix client
RUN npm ci --prefix server

# Copy rest of the project into docker
COPY . .

# Build front-end and copy files into server public dir
RUN npm run build --prefix client && \
    rm -rf server/public && \
    mkdir server/public && \
    cp -r client/build/* server/public

# Build test db used for dev, debugging and running tests
RUN node server/generate-test-db-fixture.js

# Run tests and linting to validate build
ENV SKIP_INTEGRATION true
RUN npm run test --prefix server
RUN npm run lint

# Remove any dev dependencies from server
# We don't care about root or client directories 
# as they are not going to be copied to next stage
WORKDIR /sqlpad/server
RUN npm prune --production

# Start another stage with a fresh node
# Copy the server directory that has all the necessary node modules + front end build
FROM node:12.20-alpine3.12

WORKDIR /usr/app

COPY --from=build /sqlpad/docker-entrypoint /
COPY --from=build /sqlpad/server .

ENV NODE_ENV production
ENV SQLPAD_DB_PATH /var/lib/sqlpad
ENV SQLPAD_PORT 3000
EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint"]

# Things to think about for future docker builds
# Perhaps add a healthcheck?
# Should nginx be used to front sqlpad?
#
# Should ODBC drivers be installed? (once ODBC is compiling that is)
# 
# If you are wanting to use ODBC in docker build, 
# fork this, make sure it compiles unixodbc driver in first stage, 
# and add specific ODBC drivers here in this stage

RUN ["chmod", "+x", "/docker-entrypoint"]

WORKDIR /var/lib/sqlpad
