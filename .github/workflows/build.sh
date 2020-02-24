#!/usr/bin/env sh
set -x

apt-get update
apt-get install -y --no-install-recommends g++ make python3 python3-setuptools unixodbc-dev

bash -x scripts/build.sh

tar -cavf sqlpad.tar.gz -C server/public .
