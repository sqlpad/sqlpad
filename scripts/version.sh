#!/usr/bin/env sh

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "master" ]]; then
  echo 'Branch must be set to master';
  exit 1;
fi

SQLPAD_ROOT_DIR=$(pwd)
SQLPAD_CLIENT_DIR=$(pwd)/client
SQLPAD_SERVER_DIR=$(pwd)/server
SCRIPTS_DIR=$(pwd)/scripts

if [[ ! -d $SCRIPTS_DIR ]] || \
   [[ ! -d $SQLPAD_CLIENT_DIR ]] || \
   [[ ! -d $SQLPAD_SERVER_DIR ]]
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

git push origin master
git push --tags
