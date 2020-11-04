#!/usr/bin/env sh

BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ $BRANCH != "master" ]; then
  echo 'Branch must be set to master';
  exit 1;
fi

# Determine if branch is up-to-date
# If not exit the script
UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")

if [ $LOCAL = $REMOTE ]; then
    echo "Branch up-to-date"
else
    echo "Branch out of date"
    exit 1;
fi

# Get relevant directories and ensure script is executed from root of directory
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
npm --no-git-tag-version version $VERSION || exit 1

cd $SQLPAD_SERVER_DIR
npm --no-git-tag-version version $VERSION || exit 1

cd $SQLPAD_ROOT_DIR
npm --no-git-tag-version version $VERSION || exit 1

git commit -a -m "v$VERSION" || exit 1

git tag -a "v$VERSION" -m "v$VERSION" || exit 1

git push origin master
git push origin "v$VERSION"
