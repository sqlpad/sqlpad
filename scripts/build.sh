#!/usr/bin/env sh
SQLPAD_CLIENT_DIR=$(pwd)/client
SQLPAD_SERVER_DIR=$(pwd)/server
SCRIPTS_DIR=$(pwd)/scripts

if [ ! -d $SCRIPTS_DIR ] ||
    [ ! -d $SQLPAD_CLIENT_DIR ] ||
    [ ! -d $SQLPAD_SERVER_DIR ]; then
    echo This script must be executed from the sqlpad project directory
    exit 1
fi

# Install node modules per package-lock.json
npm ci
npm ci --prefix $SQLPAD_CLIENT_DIR
npm ci --prefix $SQLPAD_SERVER_DIR

# Build front-end
npm run build --prefix $SQLPAD_CLIENT_DIR

# Copy front-end build to server directory
rm -rf ${SQLPAD_SERVER_DIR}/public
mkdir ${SQLPAD_SERVER_DIR}/public
cp -r ${SQLPAD_CLIENT_DIR}/build/* ${SQLPAD_SERVER_DIR}/public

# Build test deb for test cases and to use during dev
node ${SQLPAD_SERVER_DIR}/generate-test-db-fixture.js