# SQLPad

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, ClickHouse, Crate, Vertica, Trino, Presto, SAP HANA, Cassandra, Google BigQuery, SQLite, TiDB and many more via [ODBC](https://github.com/sqlpad/sqlpad/wiki/ODBC).

![SQLPad Query Editor](https://user-images.githubusercontent.com/303966/99915755-32f78e80-2ccb-11eb-9f74-b18846d6108d.png)


**As of version 7, semver is no longer followed**. Going forward patch updates may require major Node.js version updates, or contain removal of functionality.

## Docker Image

The docker image runs on port 3000 and uses `/var/lib/sqlpad` for the embedded database directory.

See [docker-examples](https://github.com/sqlpad/sqlpad/tree/master/docker-examples) for docker-compose examples.

## Project Documentation

The most recently used documentation site's astro code is located under `/docs` directory. 

## Development

For instructions on installing/running SQLPad from git repo see [DEVELOPER-GUIDE.md](https://github.com/sqlpad/sqlpad/blob/master/DEVELOPER-GUIDE.md)

## License

MIT
