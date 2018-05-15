#!/bin/bash
#docker-compose down
#docker-compose up -d
#sleep 15

# Ingres specific
# set variables for ODBC config
export ODBCSYSINI=$II_SYSTEM/ingres/files
export ODBCINI=$II_SYSTEM/ingres/files/odbc.ini

# Most Linux distros build UnixODBC with non-default build options
export II_ODBC_WCHAR_SIZE=2

# Without above get:
# { Error: [unixODBC][
#  errors: [ { message: '[unixODBC][', state: '0' } ],
#  error: '[node-odbc] SQL_ERROR',
#  message: '[unixODBC][',
#  state: '0' }

# set connection information
# ODBC_CONNECTION_STRING=Driver={Ingres};Server=VNODE;Database=sqlpad

# hack FIXME
echo 'drop table test\p\g' | sql VNODE::sqlpad


#npx mocha ./test.js
npx mocha ./"test_ingres.js"

#docker-compose down
