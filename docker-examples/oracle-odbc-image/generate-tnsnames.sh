#!/bin/sh
# This script downloads a tnsnames.ora through env var TNS_URL
# and iterates env vars to add to tnsnames.ora
# You can add hosts by providing the following ENV vars.
# (replace [X] with a number see below)
# TNS_[X]_NAME, TNS_[X]_PORT, TNS_[X]_HOST, [TNS_[X]_SID | TNS_[X]_SERVICE_NAME]

# --Example--:
# TNS_0_NAME=testconnection
# TNS_0_SID=mySID
# TNS_0_HOST=some.host.example
# 
# TNS_1_NAME=testconnection2
# TNS_1_SID=mySID2
# TNS_1_HOST=some.host2.example

# If a more complicated tnsnames.ora is required use the download only or overwrite this script in your own image

if [ -z "$TNS_URL" ]; then
  touch $TNS_ADMIN/tnsnames.ora
else
  wget -O $TNS_ADMIN/tnsnames.ora "$TNS_URL"
fi

TNS_IDX=0

while true; do 
  NAME=$(eval echo "\$TNS_${TNS_IDX}_NAME")
  PORT=$(eval echo "\$TNS_${TNS_IDX}_PORT")
  HOST=$(eval echo "\$TNS_${TNS_IDX}_HOST")
  SID=$(eval echo "\$TNS_${TNS_IDX}_SID")
  SERVICE_NAME=$(eval echo "\$TNS_${TNS_IDX}_SERVICE_NAME")
  if [ -z "$NAME" ]; then break ; fi
  if [ -z "$HOST" ]; then echo "Missing env var TNS_${TNS_IDX}_HOST" 1>&2 ; exit 1; fi
  if [ -z "$SID" ] && [ -z "$SERVICE_NAME" ]; then echo "Missing env var TNS_${TNS_IDX}_SID or TNS_${TNS_IDX}_SERVICE_NAME " 1>&2 ; exit 1; fi

  CONNECT_DATA=""
  if [ -z "$SID" ]; 
  then
    CONNECT_DATA="SERVICE_NAME = ${SERVICE_NAME}"
  else
    CONNECT_DATA="SID = ${SID}"
  fi
  
  echo "Adding '$NAME' to tnsnames.ora" 1>&2
  
  cat <<EOF >/tmp/tnsnames.tmp.entry
$NAME =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = ${HOST})(PORT = ${PORT:-1521}))
    (CONNECT_DATA =
      (${CONNECT_DATA})
    )
  )
EOF
  cat $TNS_ADMIN/tnsnames.ora /tmp/tnsnames.tmp.entry > /tmp/tnsnames.new
  cp /tmp/tnsnames.new $TNS_ADMIN/tnsnames.ora
  TNS_IDX=$((TNS_IDX + 1))
done

rm /tmp/tnsnames.tmp.entry 2>/dev/null || true
rm /tmp/tnsnames.new 2>/dev/null || true