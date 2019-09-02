# mssql (Microsoft SQL Server)

This assumes you have docker installed with docker compose, and some light understanding of docker

When trying out the mssql test, be sure your docker environment meets minimum reqs: https://hub.docker.com/r/microsoft/mssql-server-linux/

```sh
cd mssql

# this puts docker compose things into background
docker-compose up -d

# If you'd like to create a database, connect to docker to create db
# otherwise you can use `master`
docker exec -it mssql_mssql_1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P SuperP4ssw0rd!

# In next prompt run following
# 1> CREATE DATABASE mssqltest;
# 2> GO
# ctrl-c to quit

# (optional) follow logs from docker
docker-compose logs -f
```

Go to localhost:3000 in browser. Sign up, sign in.

Create SQL Server connection with following:

```
host: mssql
database: master (or created db)
user: sa
password: SuperP4ssw0rd!
```
