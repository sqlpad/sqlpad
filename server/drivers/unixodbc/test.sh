#!/bin/bash

# sqlite3 specific
# NOTE defaults for Ubuntu
# /etc/odbcinst.ini. should contain defs for sqlite3 without the need to edit/create manually

# unset to ensure defaults used
unset ODBCINI
unset ODBCINSTINI
unset ODBCSYSINI



# skip ODBCINI, do not use a DSN
#export ODBCINI=/home/user/odbc.ini
#export ODBCINSTINI=/home/user/odbcinst.ini
#export ODBCSYSINI=/home/user/odbcinst.ini

# NOTE default driver name is different on different platforms
# e.g. Ubuntu /usr/share/sqliteodbc/unixodbc.ini has "SQLite3", Windows is "SQLite3 ODBC Driver"

# NOTE using a persistent database, using :memory: is not an option when connecting/disconnecting
# NOTE ODBC pooling may allow memory to be used
test_db_name=/tmp/tmp_sqlpad.db
rm ${test_db_name}
export ODBC_CONNECTION_STRING="Driver={SQLite3};Database=${test_db_name}"

npx mocha ./test.js

