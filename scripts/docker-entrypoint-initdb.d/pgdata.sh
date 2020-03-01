#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE test (id int, name text);
    INSERT INTO test (id, name) VALUES (1, 'one'), (2, 'two');
EOSQL