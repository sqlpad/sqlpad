# SQLPad

[![Build Status](https://travis-ci.org/rickbergfalk/sqlpad.svg?branch=master)](https://travis-ci.org/rickbergfalk/sqlpad)

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate, Vertica, Presto, SAP HANA, Cassandra, Snowflake, Google BigQuery, SQLite, and many more via [ODBC](https://github.com/rickbergfalk/sqlpad/wiki/ODBC).

![SQLPad Query Editor](https://rickbergfalk.github.io/sqlpad/images/screenshots/v3-beta.png)

## Docker Image

The docker image runs on port 3000 and uses `/var/lib/sqlpad` for the embedded database directory.

`latest` tag is continously built from latest commit in repo. Only use that if you want to live on the edge, otherwise use specific version tags to ensure stability.

See [docker-examples](https://github.com/rickbergfalk/sqlpad/tree/master/docker-examples) directory for example docker-compose setup with SQL Server.

## Development

For instructions on installing/running SQLPad from git repo see [developer guide](https://github.com/rickbergfalk/sqlpad/blob/master/DEVELOPER-GUIDE.md)

## Configuration

- [project page - configuration](https://rickbergfalk.github.io/sqlpad/#/configuration)
- [docs/configuration.md](https://github.com/rickbergfalk/sqlpad/blob/master/docs/configuration.md)

### Connection configuration

- [project page - connections](https://rickbergfalk.github.io/sqlpad/#/connections)
- [docs/connections.md](https://github.com/rickbergfalk/sqlpad/blob/master/docs/connections.md)

## Seed Data (experimental)

- [project page - seed data](https://rickbergfalk.github.io/sqlpad/#/seed-data)
- [docs/seed-data.md](https://github.com/rickbergfalk/sqlpad/blob/master/docs/seed-data.md)

## Logging

- [project page - logging](https://rickbergfalk.github.io/sqlpad/#/logging)
- [docs/logging.md](https://github.com/rickbergfalk/sqlpad/blob/master/docs/logging.md)

## License

MIT
