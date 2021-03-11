# SQLPad

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, ClickHouse, Crate, Vertica, Trino, Presto, SAP HANA, Cassandra, Snowflake, Google BigQuery, SQLite, and many more via [ODBC](https://github.com/sqlpad/sqlpad/wiki/ODBC).

![SQLPad Query Editor](https://user-images.githubusercontent.com/303966/99915755-32f78e80-2ccb-11eb-9f74-b18846d6108d.png)

## Docker Image

The docker image runs on port 3000 and uses `/var/lib/sqlpad` for the embedded database directory.

`latest` tag is continuously built from latest commit in repo. Only use that if you want to live on the edge, otherwise use specific version tags to ensure stability.

See [docker-examples](https://github.com/sqlpad/sqlpad/tree/master/docker-examples) directory for example docker-compose setup with SQL Server.

## Development

For instructions on installing/running SQLPad from git repo see [DEVELOPER-GUIDE.md](https://github.com/sqlpad/sqlpad/blob/master/DEVELOPER-GUIDE.md)

## Project Documentation

Documentation located at [https://sqlpad.github.io/sqlpad](https://sqlpad.github.io/sqlpad).

Documentation source located in [docs directory](https://github.com/sqlpad/sqlpad/tree/master/docs), built/rendered by docsify.

## Project Status

Despite recent development this last year and move to GitHub org, SQLPad is mostly "finished" in that it won't radically be changing from what it is today.

Maintenance releases and bugfixes guaranteed through 2021.

## Contributing

[Collaborators always welcome!](https://github.com/sqlpad/sqlpad/blob/master/CONTRIBUTING.md)

## License

MIT
