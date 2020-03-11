#!/usr/bin/env sh

# This script can be used for pushing patches not based on master branch
# In most cases use scripts/version.sh to do builds, not this one

SQLPAD_ROOT_DIR=$(pwd)
SQLPAD_CLIENT_DIR=$(pwd)/client
SQLPAD_SERVER_DIR=$(pwd)/server
SCRIPTS_DIR=$(pwd)/scripts

if [ ! -d $SCRIPTS_DIR ] || \
   [ ! -d $SQLPAD_CLIENT_DIR ] || \
   [ ! -d $SQLPAD_SERVER_DIR ]
then
    echo This script must be executed from the sqlpad project directory
    exit 1
fi

VERSION=$1

cd $SQLPAD_CLIENT_DIR
npm --no-git-tag-version version $VERSION

cd $SQLPAD_SERVER_DIR
npm --no-git-tag-version version $VERSION

cd $SQLPAD_ROOT_DIR
npm --no-git-tag-version version $VERSION

git commit -a -m "v$VERSION"

git tag -a "v$VERSION" -m "v$VERSION"

git push origin HEAD
git push origin "v$VERSION"
