#!/bin/bash

test_db_name=/tmp/tmp_sqlpad.db
rm ./sqlpad_test_sqlite.db

npx mocha ./test.js

