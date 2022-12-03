# SQLPad

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, ClickHouse, Crate, Vertica, Trino, Presto, SAP HANA, Cassandra, Snowflake, Google BigQuery, SQLite, TiDB and many more via [ODBC](https://github.com/sqlpad/sqlpad/wiki/ODBC).

![SQLPad Query Editor](https://user-images.githubusercontent.com/303966/99915755-32f78e80-2ccb-11eb-9f74-b18846d6108d.png)

## Project Status

SQLPad is a legacy project in maintenance mode. If evaluating SQLPad, please consider a [potential alternative](https://getsqlpad.com/en/introduction/#alternatives) or forking the project and making it your own.

Maintenance releases for security and dependency updates will continue as possible.

## Docker Image

The docker image runs on port 3000 and uses `/var/lib/sqlpad` for the embedded database directory.

`latest` tag is continuously built from latest commit in repo. Only use that if you want to live on the edge, otherwise use specific version tags to ensure stability.

See [docker-examples](https://github.com/sqlpad/sqlpad/tree/master/docker-examples) directory for example docker-compose setup with SQL Server.

## Project Documentation

Documentation located at [https://getsqlpad.com](https://getsqlpad.com).

## Development

For instructions on installing/running SQLPad from git repo see [DEVELOPER-GUIDE.md](https://github.com/sqlpad/sqlpad/blob/master/DEVELOPER-GUIDE.md)

## License

MIT
