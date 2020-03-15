# Connections

A `Connection` in SQLPad is a configuration to a specific database instance. Business Intelligence and reporting software may call these "data sources". A connection may involve a connection string, user credentials, host, port, etc. The data required by a connection depends on the database driver it uses to connect to the target database.

When a user write's a query, they'll pick a connection to use to run it. This connection choice will also be saved with the query.

Admins can create connections in the UI, but connections can also be created in a JSON or INI config file, via a complicated environment variable convention, or via experimental seed data files.

## Defining Connections via Configuration

?> As of 3.2.0 connections may be defined via application configuration.

Every connection defined should provide a `name` and `driver` value, with driver equaling the value specified in the `driver` rows below. `name` will be the label used in the UI to label the connection.

Field names and values are case sensitive.

The connection ID value used can be any alphanumeric value, and is case-sensitive. This can be a randomly generated value like SQLPad's underlying embedded database uses, or it can be a more human-friendly name, or an id used from another source.

How connections are defined in configuration depends on the source of the configuration.

?> **TODO** connection user replacement values need to be documented

### Via Environment Variable

When using environment variables, connection field values must be provided using an environment variable with the convention `SQLPAD_CONNECTIONS__<connectionId>__<fieldName>`. Note double underscores between `SQLPAD_CONNECTIONS`, `<connectionId>`, and `<fieldName>`. Both connection ID and field name values are case sensitive. Boolean values should be the value `true` or `false`.

Example for a MySQL connection with id `prod123`.

```sh
SQLPAD_CONNECTIONS__prod123__name="Production 123"
SQLPAD_CONNECTIONS__prod123__driver=mysql
SQLPAD_CONNECTIONS__prod123__host=localhost
SQLPAD_CONNECTIONS__prod123__mysqlInsecureAuth=true
```

### Via INI File

When defining a connection in an INI file, use section header with the value `connections.<connectionId>`.

```ini
[connections.prod123]
name = Production 123
driver = mysql
host = localhost
mysqlInsecureAuth = true
```

### Via JSON File

When using JSON file, provide `<connectionId>` as a key under `connections`.

```json
{
  "connections": {
    "prod123": {
      "name": "Production 123",
      "driver": "mysql",
      "host": "localhost",
      "mysqlInsecureAuth": true
    }
  }
}
```

## CrateDB

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>crate</code></td><td>text</td></tr>
    <tr><td>host</td><td>Host/Server/IP Address</td><td>text</td></tr>
    <tr><td>port</td><td>Port (optional)</td><td>text</td></tr>
  </tbody>
</table>

## Apache Drill

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>drill</code></td><td>text</td></tr>
    <tr><td>host</td><td>Host/Server/IP Address</td><td>text</td></tr>
    <tr><td>port</td><td>Port (optional)</td><td>text</td></tr>
    <tr><td>username</td><td>Database Username</td><td>text</td></tr>
    <tr><td>password</td><td>Database Password</td><td>text</td></tr>
    <tr><td>drillDefaultSchema</td><td>Default Schema</td><td>text</td></tr>
    <tr><td>ssl</td><td>Use SSL to connect to Drill</td><td>boolean</td></tr>
  </tbody>
</table>

## SAP Hana (hdb)

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>hdb</code></td><td>text</td></tr>
    <tr><td>host</td><td>Host/Server/IP Address</td><td>text</td></tr>
    <tr><td>hanaport</td><td>Port (e.g. 39015)</td><td>text</td></tr>
    <tr><td>username</td><td>Database Username</td><td>text</td></tr>
    <tr><td>password</td><td>Database Password</td><td>text</td></tr>
    <tr><td>hanadatabase</td><td>Tenant</td><td>text</td></tr>
    <tr><td>hanaSchema</td><td>Schema (optional)</td><td>text</td></tr>
  </tbody>
</table>

## MySQL

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>mysql</code></td><td>text</td></tr>
    <tr><td>host</td><td>Host/Server/IP Address</td><td>text</td></tr>
    <tr><td>port</td><td>Port (optional)</td><td>text</td></tr>
    <tr><td>database</td><td>Database</td><td>text</td></tr>
    <tr><td>username</td><td>Database Username</td><td>text</td></tr>
    <tr><td>password</td><td>Database Password</td><td>text</td></tr>
    <tr><td>mysqlInsecureAuth</td><td>Use old/insecure pre 4.1 Auth System</td><td>boolean</td></tr>
  </tbody>
</table>

## PostgreSQL (postgres)

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>postgres</code></td><td>text</td></tr>
    <tr><td>host</td><td>Host/Server/IP Address</td><td>text</td></tr>
    <tr><td>port</td><td>Port (optional)</td><td>text</td></tr>
    <tr><td>database</td><td>Database</td><td>text</td></tr>
    <tr><td>username</td><td>Database Username</td><td>text</td></tr>
    <tr><td>password</td><td>Database Password</td><td>text</td></tr>
    <tr><td>postgresSsl</td><td>Use SSL</td><td>boolean</td></tr>
    <tr><td>postgresCert</td><td>Database Certificate Path</td><td>text</td></tr>
    <tr><td>postgresKey</td><td>Database Key Path</td><td>text</td></tr>
    <tr><td>postgresCA</td><td>Database CA Path</td><td>text</td></tr>
    <tr><td>useSocks</td><td>Connect through SOCKS proxy</td><td>boolean</td></tr>
    <tr><td>socksHost</td><td>Proxy hostname</td><td>text</td></tr>
    <tr><td>socksPort</td><td>Proxy port</td><td>text</td></tr>
    <tr><td>socksUsername</td><td>Username for socks proxy</td><td>text</td></tr>
    <tr><td>socksPassword</td><td>Password for socks proxy</td><td>text</td></tr>
  </tbody>
</table>

## PrestoDB

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>presto</code></td><td>text</td></tr>
    <tr><td>host</td><td>Host/Server/IP Address</td><td>text</td></tr>
    <tr><td>port</td><td>Port (optional)</td><td>text</td></tr>
    <tr><td>username</td><td>Database Username</td><td>text</td></tr>
    <tr><td>prestoCatalog</td><td>Catalog</td><td>text</td></tr>
    <tr><td>prestoSchema</td><td>Schema</td><td>text</td></tr>
  </tbody>
</table>

## SQL Server

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>sqlserver</code></td><td>text</td></tr>
    <tr><td>host</td><td>Host/Server/IP Address</td><td>text</td></tr>
    <tr><td>port</td><td>Port (optional)</td><td>text</td></tr>
    <tr><td>database</td><td>Database</td><td>text</td></tr>
    <tr><td>username</td><td>Database Username</td><td>text</td></tr>
    <tr><td>password</td><td>Database Password</td><td>text</td></tr>
    <tr><td>domain</td><td>Domain</td><td>text</td></tr>
    <tr><td>sqlserverEncrypt</td><td>Encrypt (necessary for Azure)</td><td>boolean</td></tr>
    <tr><td>sqlserverMultiSubnetFailover</td><td>MultiSubnetFailover</td><td>boolean</td></tr>
    <tr><td>readOnlyIntent</td><td>ReadOnly Application Intent</td><td>boolean</td></tr>
  </tbody>
</table>

## Vertica

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>vertica</code></td><td>text</td></tr>
    <tr><td>host</td><td>Host/Server/IP Address</td><td>text</td></tr>
    <tr><td>port</td><td>Port (optional)</td><td>text</td></tr>
    <tr><td>database</td><td>Database</td><td>text</td></tr>
    <tr><td>username</td><td>Database Username</td><td>text</td></tr>
    <tr><td>password</td><td>Database Password</td><td>text</td></tr>
  </tbody>
</table>

## Cassandra

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>cassandra</code></td><td>text</td></tr>
    <tr><td>contactPoints</td><td>Contact points (comma delimited)</td><td>text</td></tr>
    <tr><td>localDataCenter</td><td>Local data center</td><td>text</td></tr>
    <tr><td>keyspace</td><td>Keyspace</td><td>text</td></tr>
  </tbody>
</table>

## Snowflake

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>snowflake</code></td><td>text</td></tr>
    <tr><td>account</td><td>Account</td><td>text</td></tr>
    <tr><td>username</td><td>User name</td><td>text</td></tr>
    <tr><td>password</td><td>Password</td><td>text</td></tr>
    <tr><td>warehouse</td><td>Warehouse</td><td>text</td></tr>
    <tr><td>database</td><td>Database</td><td>text</td></tr>
    <tr><td>schema</td><td>Schema</td><td>text</td></tr>
    <tr><td>role</td><td>Role</td><td>text</td></tr>
    <tr><td>preQueryStatements</td><td>Pre-query statements</td><td>text</td></tr>
  </tbody>
</table>

## BigQuery

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>bigquery</code></td><td>text</td></tr>
    <tr><td>projectId</td><td>Project ID</td><td>text</td></tr>
    <tr><td>keyFile</td><td>JSON keyfile for service account</td><td>text</td></tr>
    <tr><td>datasetName</td><td>Dataset to use</td><td>text</td></tr>
    <tr><td>datasetLocation</td><td>Location for this dataset</td><td>text</td></tr>
  </tbody>
</table>

## SQLite

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>sqlite</code></td><td>text</td></tr>
    <tr><td>filename</td><td>Path to file</td><td>text</td></tr>
    <tr><td>readonly</td><td>Open file in read only mode</td><td>boolean</td></tr>
  </tbody>
</table>

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

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>data type</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>name</td><td>Name of connection</td><td>text</td></tr>
    <tr><td>driver</td><td>Must be <code>unixodbc</code></td><td>text</td></tr>
    <tr><td>connection_string</td><td>ODBC connection string</td><td>text</td></tr>
    <tr><td>schema_sql</td><td>Database SQL to lookup schema (optional, if omitted default to checking INFORMATION_SCHEMA)</td><td>text</td></tr>
    <tr><td>username</td><td>Username (optional). Will be added to connect_string as <code>Uid</code> key</td><td>text</td></tr>
    <tr><td>password</td><td>Password (optional). Will be added to connect_string as <code>Pwd</docd> key</td><td>text</td></tr>
  </tbody>
</table>
