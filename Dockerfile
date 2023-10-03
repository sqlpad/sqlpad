# Need to remote into this image and debug some flow? 
# docker run -it --rm node:16-bullseye-slim /bin/ash
FROM node:16-bullseye-slim AS build
ARG ODBC_ENABLED=false
RUN apt-get update && apt-get install -y \
    python3 make g++ python3-dev  \
    && ( \
    if [ "$ODBC_ENABLED" = "true" ] ; \
    then \
    echo "Installing ODBC build dependencies." 1>&2 ;\
    apt-get install -y unixodbc-dev ;\
    npm install -g node-gyp ;\
    fi\
    ) \
    && rm -rf /var/lib/apt/lists/*
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
COPY ./yarn* ./
COPY ./client/yarn* ./client/
COPY ./server/yarn* ./server/

# Install dependencies
# Timeout increase necessary for mdi-react timeout
RUN yarn config set network-timeout 600000 -g
RUN yarn
WORKDIR /sqlpad/client
RUN yarn
WORKDIR /sqlpad/server
RUN yarn --production
WORKDIR /sqlpad

# Copy rest of the project into docker
COPY . .

# Build front-end and copy files into server public dir
RUN npm run build --prefix client && \
    rm -rf server/public && \
    mkdir server/public && \
    cp -r client/build/* server/public

# Start another stage with a fresh node
# Copy the server directory that has all the necessary node modules + front end build
FROM node:16-bullseye-slim as bundle
ARG ODBC_ENABLED=false

# Create a directory for the hooks and optionaly install ODBC
RUN mkdir -p /etc/docker-entrypoint.d \
    && apt-get update && apt-get install -y wget \
    && ( \
    if [ "$ODBC_ENABLED" = "true" ] ; \
    then \
    echo "Installing ODBC runtime dependencies." 1>&2 ;\
    apt-get install -y unixodbc libaio1 odbcinst libodbc1 ;\
    touch /etc/odbcinst.ini ;\
    fi\
    ) \
    && rm -rf /var/lib/apt/lists/* 

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
# Should nginx be used to front sqlpad? << No. you can always add an LB/nginx on top of this with compose or other tools when needed.

RUN ["chmod", "+x", "/docker-entrypoint"]
WORKDIR /var/lib/sqlpad

# If you want to use ODBC, use `docker build -t sqlpad/sqlpad-odbc --build-arg ODBC_ENABLED=true .`
# That will create an image with ODBC enabled.
#
# Then add specific ODBC drivers.
# Option 1: extend this Dockerfile in a fork.
# Option 2: create your own that starts `FROM sqlpad/sqlpad-odbc` and add drivers there.
#           Note: this is currently not available on dockerhub so you must use the build command to provision it locally.
