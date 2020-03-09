#!/bin/bash

rm ./sqlpad_test_sqlite.db

npx mocha ./test.js

