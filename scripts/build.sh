#!/bin/bash

# Get directory script is in
SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $SCRIPTS_DIR/..
SQLPAD_DIR=`pwd`

# Install node modules per package-lock.json
npm ci
npm ci --prefix "$SQLPAD_DIR/client"
npm ci --prefix "$SQLPAD_DIR/server"

# Build front-end
npm run build --prefix "$SQLPAD_DIR/client"

# Copy front-end build to server directory
rm -rf server/public
mkdir server/public
cp -r ./client/build/* ./server/public
