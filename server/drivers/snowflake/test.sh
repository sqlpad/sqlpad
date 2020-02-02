#!/bin/bash
# Running the tests requires a real Snowflake account because Snowflake
# does not provide a publicly available docker image that we can use for running tests locally
#
# To run the tests, update the below environment variables pointing to a real Snowflake account
export SNOWFLAKE_ACCOUNT=rtXXXXX._region_
export SNOWFLAKE_USERNAME=_username_
export SNOWFLAKE_PASSWORD=_password_
export SNOWFLAKE_WAREHOUSE=_warehouse_
export SNOWFLAKE_DATABASE=_database_
export SNOWFLAKE_SCHEMA=SQLPAD
npx mocha ./test.js
