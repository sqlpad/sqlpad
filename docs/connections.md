# Connections

A `Connection` in SQLPad is a configuration to a specific database instance. Business Intelligence and reporting software may call these "data sources". A connection may involve a connection string, user credentials, host, port, etc. The data required by a connection depends on the database driver it uses to connect to the target database.

When a user write's a query, they'll pick a connection to use to run it. This connection choice will also be saved with the query.

Admins can create connections in the UI, but connections can also be created in a JSON or INI config file, via a complicated environment variable convention, or via experimental seed data files.

## Multi-Statement Transaction Support

?> Available as of `4.2.0`

Multi-statement transaction support adds the ability for a user to use the same underlying connection across query executions. This allows things like opening a transaction, running queries, and rolling the transaction back or committing the transaction across query runs. It also opens up the ability to create and use temp tables that are generally scoped per connection session.

Multi-statement transaction support is opt-in based on connection configuration. If a connection uses a driver and multi-statement transaction support is not enabled, the connection falls back to the legacy SQLPad behavior of opening a new connection for each query execution, then immediately closing it following the query.

Work is under way to add multi-statement transaction support to drivers that benefit from the addition. At this time MySQL, SQLite, Postgres, and ODBC drivers support this approach.

## Defining Connections via Configuration

?> As of 3.2.0 connections may be defined via application configuration.

?> JSON & INI config files deprecated as of 5.1.0

### Via Environment Variable & .env File

When defining connections via environment variables, connection field values must be provided using an environment variable with the convention `SQLPAD_CONNECTIONS__<connectionId>__<fieldName>`. Note double underscores between `SQLPAD_CONNECTIONS`, `<connectionId>`, and `<fieldName>`.

All values (connectionId, fieldName, and value for the environment variable) are case sensitive.

The connection ID value used can be any alphanumeric value. This can be a randomly generated value like SQLPad's underlying embedded database uses, or it can be a more human-friendly name, or an id used from another source.

The fieldName referenced in the environment variable should correspond with a field key noted in the table below for the driver used.

Boolean values should be the value `true` or `false`.

Every connection defined should provide a `name` and `driver` value, with driver equaling the value specified in the `driver` rows below. `name` will be the label used in the UI to label the connection.

Example for a MySQL connection with id `prod123`.

```sh
SQLPAD_CONNECTIONS__prod123__name="Production 123"
SQLPAD_CONNECTIONS__prod123__driver=mysql
SQLPAD_CONNECTIONS__prod123__host=localhost
SQLPAD_CONNECTIONS__prod123__mysqlInsecureAuth=true
```

## Connection selection

?> Available as of `4.5.0`

A default connection selection can be set using environment variable `SQLPAD_DEFAULT_CONNECTION_ID`. It can also be specified as part of the query editor URL, i.e., `https://mysqlpad.example.com/queries/new?connectionName=connection1` or `https://mysqlpad.example.com/queries/new?connectionId=xxx-xxxxx-xxx-xxx`.

## CrateDB

| key        | description            | data type |
| ---------- | ---------------------- | :-------: |
| `name`     | Name of connection     |   text    |
| `driver`   | Must be `crate`        |   text    |
| `host`     | Host/Server/IP Address |   text    |
| `port`     | Port (optional)        |   text    |
| `username` | Database Username      |   text    |
| `password` | Database Password      |   text    |
| `ssl`      | Use SSL                |  boolean  |

## Apache Drill

| key                  | description                 | data type |
| -------------------- | --------------------------- | :-------: |
| `name`               | Name of connection          |   text    |
| `driver`             | Must be `drill`             |   text    |
| `host`               | Host/Server/IP Address      |   text    |
| `port`               | Port (optional)             |   text    |
| `username`           | Database Username           |   text    |
| `password`           | Database Password           |   text    |
| `drillDefaultSchema` | Default Schema              |   text    |
| `ssl`                | Use SSL to connect to Drill |  boolean  |

## Apache Pinot

| key             | description                                                | data type |
| --------------- | ---------------------------------------------------------- | :-------: |
| `name`          | Name of connection                                         |   text    |
| `driver`        | Must be `pinot`                                            |   text    |
| `controllerUrl` | URL containing protocol, host, and port of Pinot contoller |   text    |

## ClickHouse

| key        | description              | data type |
| ---------- | ------------------------ | :-------: |
| `name`     | Name of connection       |   text    |
| `driver`   | Must be `clickhouse`     |   text    |
| `host`     | Host/Server/IP Address   |   text    |
| `port`     | HTTP Port (optional)     |   text    |
| `username` | Username (optional)      |   text    |
| `password` | Password (optional)      |   text    |
| `database` | Database Name (optional) |   text    |

## SAP Hana (hdb)

| key            | description            | data type |
| -------------- | ---------------------- | :-------: |
| `name`         | Name of connection     |   text    |
| `driver`       | Must be `hdb`          |   text    |
| `host`         | Host/Server/IP Address |   text    |
| `hanaport`     | Port (e.g. 39015)      |   text    |
| `username`     | Database Username      |   text    |
| `password`     | Database Password      |   text    |
| `hanadatabase` | Tenant                 |   text    |
| `hanaSchema`   | Schema (optional)      |   text    |

## MySQL

| key                                | description                                 | data type |
| ---------------------------------- | ------------------------------------------- | :-------: |
| `name`                             | Name of connection                          |   text    |
| `driver`                           | Must be `mysql`                             |   text    |
| `multiStatementTransactionEnabled` | Reuse db connection across query executions |  boolean  |
| `host`                             | Host/Server/IP Address                      |   text    |
| `port`                             | Port (optional)                             |   text    |
| `database`                         | Database                                    |   text    |
| `username`                         | Database Username                           |   text    |
| `password`                         | Database Password                           |   text    |
| `mysqlSsl`                         | Use SSL                                     |  boolean  |
| `mysqlInsecureAuth`                | Use old/insecure pre 4.1 Auth System        |  boolean  |

## MySQL2

| key                           | description                                                                        | data type |
| ----------------------------- | ---------------------------------------------------------------------------------- | :-------: |
| `name`                        | Name of connection                                                                 |   text    |
| `driver`                      | Must be `mysql2`                                                                   |   text    |
| `host`                        | Host/Server/IP Address                                                             |   text    |
| `port`                        | Port (optional)                                                                    |   text    |
| `database`                    | Database                                                                           |   text    |
| `username`                    | Database Username                                                                  |   text    |
| `password`                    | Database Password                                                                  |   text    |
| `mysqlInsecureAuth`           | Use old/insecure pre 4.1 Auth System                                               |  boolean  |
| `minTlsVersion`               | Minimum TLS version to allow. One of: `TLSv1.3`, `TLSv1.2`, `TLSv1.1`, or `TLSv1`. |   text    |
| `maxTlsVersion`               | Maximum TLS version to allow. see above for options                                |   text    |
| `mysqlSkipValidateServerCert` | Do not validate servier certificate. (Don't use this for production)               |  boolean  |

## PostgreSQL (postgres)

| key                                | description                                           | data type |
| ---------------------------------- | ----------------------------------------------------- | :-------: |
| `name`                             | Name of connection                                    |   text    |
| `driver`                           | Must be `postgres`                                    |   text    |
| `multiStatementTransactionEnabled` | Reuse db connection across query executions           |  boolean  |
| `idleTimeoutSeconds`               | Seconds to allow connection to be idle before closing |  number   |
| `host`                             | Host/Server/IP Address                                |   text    |
| `port`                             | Port (optional)                                       |   text    |
| `database`                         | Database                                              |   text    |
| `username`                         | Database Username                                     |   text    |
| `password`                         | Database Password                                     |   text    |
| `postgresSsl`                      | Use SSL                                               |  boolean  |
| `postgresCert`                     | Database Certificate Path                             |   text    |
| `postgresKey`                      | Database Key Path                                     |   text    |
| `postgresCA`                       | Database CA Path                                      |   text    |
| `useSocks`                         | Connect through SOCKS proxy                           |  boolean  |
| `socksHost`                        | Proxy hostname                                        |   text    |
| `socksPort`                        | Proxy port                                            |   text    |
| `socksUsername`                    | Username for socks proxy                              |   text    |
| `socksPassword`                    | Password for socks proxy                              |   text    |

## PrestoDB

| key             | description            | data type |
| --------------- | ---------------------- | :-------: |
| `name`          | Name of connection     |   text    |
| `driver`        | Must be `presto`       |   text    |
| `host`          | Host/Server/IP Address |   text    |
| `port`          | Port (optional)        |   text    |
| `username`      | Database Username      |   text    |
| `prestoCatalog` | Catalog                |   text    |
| `prestoSchema`  | Schema                 |   text    |

## Redshift

Redshift uses the Postgres driver, using a different query for pulling schema.

| key                                | description                                           | data type |
| ---------------------------------- | ----------------------------------------------------- | :-------: |
| `name`                             | Name of connection                                    |   text    |
| `driver`                           | Must be `redshift`                                    |   text    |
| `multiStatementTransactionEnabled` | Reuse db connection across query executions           |  boolean  |
| `idleTimeoutSeconds`               | Seconds to allow connection to be idle before closing |  number   |
| `host`                             | Host/Server/IP Address                                |   text    |
| `port`                             | Port (optional)                                       |   text    |
| `database`                         | Database                                              |   text    |
| `username`                         | Database Username                                     |   text    |
| `password`                         | Database Password                                     |   text    |
| `ssl`                              | Use SSL                                               |  boolean  |
| `certPath`                         | Database Certificate Path                             |   text    |
| `keyPath`                          | Database Key Path                                     |   text    |
| `caPath`                           | Database CA Path                                      |   text    |

## SQL Server

| key                            | description                   | data type |
| ------------------------------ | ----------------------------- | :-------: |
| `name`                         | Name of connection            |   text    |
| `driver`                       | Must be `sqlserver`           |   text    |
| `host`                         | Host/Server/IP Address        |   text    |
| `port`                         | Port (optional)               |   text    |
| `database`                     | Database                      |   text    |
| `username`                     | Database Username             |   text    |
| `password`                     | Database Password             |   text    |
| `domain`                       | Domain                        |   text    |
| `sqlserverEncrypt`             | Encrypt (necessary for Azure) |  boolean  |
| `sqlserverMultiSubnetFailover` | MultiSubnetFailover           |  boolean  |
| `readOnlyIntent`               | ReadOnly Application Intent   |  boolean  |

## Vertica

| key        | description            | data type |
| ---------- | ---------------------- | :-------: |
| `name`     | Name of connection     |   text    |
| `driver`   | Must be `vertica`      |   text    |
| `host`     | Host/Server/IP Address |   text    |
| `port`     | Port (optional)        |   text    |
| `database` | Database               |   text    |
| `username` | Database Username      |   text    |
| `password` | Database Password      |   text    |

## Cassandra

| key               | description                      | data type |
| ----------------- | -------------------------------- | :-------: |
| `name`            | Name of connection               |   text    |
| `driver`          | Must be `cassandra`              |   text    |
| `contactPoints`   | Contact points (comma delimited) |   text    |
| `localDataCenter` | Local data center                |   text    |
| `keyspace`        | Keyspace                         |   text    |

## Snowflake

| key                  | description          | data type |
| -------------------- | -------------------- | :-------: |
| `name`               | Name of connection   |   text    |
| `driver`             | Must be `snowflake`  |   text    |
| `account`            | Account              |   text    |
| `username`           | User name            |   text    |
| `password`           | Password             |   text    |
| `warehouse`          | Warehouse            |   text    |
| `database`           | Database             |   text    |
| `schema`             | Schema               |   text    |
| `role`               | Role                 |   text    |
| `preQueryStatements` | Pre-query statements |   text    |

` `# BigQuery

| key               | description                      | data type |
| ----------------- | -------------------------------- | :-------: |
| `name`            | Name of connection               |   text    |
| `driver`          | Must be `bigquery`               |   text    |
| `projectId`       | Project ID                       |   text    |
| `keyFile`         | JSON keyfile for service account |   text    |
| `datasetName`     | Dataset to use                   |   text    |
| `datasetLocation` | Location for this dataset        |   text    |

## SQLite

| key                                | description                                           | data type |
| ---------------------------------- | ----------------------------------------------------- | :-------: |
| `name`                             | Name of connection                                    |   text    |
| `driver`                           | Must be `sqlite`                                      |   text    |
| `multiStatementTransactionEnabled` | Reuse db connection across query executions           |  boolean  |
| `idleTimeoutSeconds`               | Seconds to allow connection to be idle before closing |  number   |
| `filename`                         | Path to file                                          |   text    |
| `readonly`                         | Open file in read only mode                           |  boolean  |

## ODBC (unixodbc)

?> Despite the underlying `driver` being `unixodbc`, this appears to be functional on Windows.

The ODBC driver by default use the following SQL to try and obtain schema information for the database connected. This may not work for your target database however.

If information schema is not supported by your target database, you may override this query using the `schema_sql` key.

This query is used for the schema sidebar and autocomplete purposes, and is not required to be able to run queries against the target database.

```sql
SELECT
  c.table_schema AS table_schema,
  c.table_name AS table_name,
  c.column_name AS column_name,
  c.data_type AS data_type
FROM
  INFORMATION_SCHEMA.columns c
WHERE
  c.table_schema NOT IN ('INFORMATION_SCHEMA', 'information_schema')
ORDER BY
  c.table_schema,
  c.table_name,
  c.ordinal_position
```

| key                                | description                                                                                                                                                                                                                                                         | data type |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------: |
| `name`                             | Name of connection                                                                                                                                                                                                                                                  |   text    |
| `driver`                           | Must be `unixodbc`                                                                                                                                                                                                                                                  |   text    |
| `multiStatementTransactionEnabled` | Reuse db connection across query executions                                                                                                                                                                                                                         |  boolean  |
| `idleTimeoutSeconds`               | Seconds to allow connection to be idle before closing                                                                                                                                                                                                               |  number   |
| `connection_string`                | ODBC connection string                                                                                                                                                                                                                                              |   text    |
| `schema_sql`                       | Database SQL to lookup schema (optional, if omitted default to checking INFORMATION_SCHEMA)                                                                                                                                                                         |   text    |
| `username`                         | Username (optional). Will be added to connect_string as `Uid` key                                                                                                                                                                                                   |   text    |
| `password`                         | Password (optional). Will be added to connect_string as `Pwd` key                                                                                                                                                                                                   |   text    |
| `limit_strategies`                 | Comma separated list of limit strategies used to restrict queries. These strategies will be used to enforce and inject LIMIT and FETCH FIRST use in SELECT queries. Allowed strategies are `limit`, `fetch`, `first`, and `top`. <br/><br/> Example: `limit, fetch` |   text    |
