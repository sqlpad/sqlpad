# SQLPad

[![Build Status](https://travis-ci.org/rickbergfalk/sqlpad.svg?branch=master)](https://travis-ci.org/rickbergfalk/sqlpad)

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate, Vertica, Presto, and SAP HANA. Other databases potentially supported via [unix odbc support](https://github.com/rickbergfalk/sqlpad/wiki/ODBC).

![SQLPad Query Editor](https://rickbergfalk.github.io/sqlpad/images/screenshots/v3-beta.png)

## Docker Image

The docker image runs on port 3000 and uses `/var/lib/sqlpad` for the embedded database directory.

`latest` tag is continously built from latest commit in repo. Use specific version tags to ensure stability.

See [docker-examples](https://github.com/rickbergfalk/sqlpad/tree/master/docker-examples) directory for example docker-compose setup with SQL Server.

## Development

For instructions on installing/running SQLPad from git repo
see [developer guide](https://github.com/rickbergfalk/sqlpad/blob/master/DEVELOPER-GUIDE.md)

## Configuration

SQLPad may be configured via environment variables, config file, or command line flags.

Config file path may be specified passing command line option `--config` or environment variable `SQLPAD_CONFIG`.
For example:

```sh
node server.js --config ~/sqlpad.ini
```

For INI and JSON config file examples, see `config-example.ini` and `config-example.json` in GitHub repository.

### Config variables

**admin**  
Email address to whitelist/give admin permissions to  
Env var: `SQLPAD_ADMIN`

**adminPassword**
Password to set for admin email address on application start. Requires `admin` setting to also be provided.
Env var: `SQLPAD_ADMIN_PASSWORD`

**allowCsvDownload**  
Enable csv and xlsx downloads.  
Env var: `SQLPAD_ALLOW_CSV_DOWNLOAD`  
Default: `true`

**baseUrl**  
Path to mount sqlpad app following domain. Example, if '/sqlpad' is provided queries page would be mydomain.com/sqlpad/queries  
Env var: `SQLPAD_BASE_URL`

**certPassphrase**  
Passphrase for your SSL certification file  
Env var: `CERT_PASSPHRASE`

**certPath**  
Absolute path to where SSL certificate is stored  
Env var: `CERT_PATH`

**cookieName**
Name used for cookie. If running multiple SQLPads on same domain, set to different values.
Env var: `SQLPAD_COOKIE_NAME`
Default: `sqlpad.sid`

**cookieSecret**  
Secret used to sign cookies  
Env var: `SQLPAD_COOKIE_SECRET`  
Default: `secret-used-to-sign-cookies-please-set-and-make-strong`

**dbPath**  
Directory to store SQLPad embedded database content. This includes queries, users, query result cache files, etc.  
Env var: `SQLPAD_DB_PATH`

**debug**  
Add a variety of logging to console while running SQLPad  
Env var: `SQLPAD_DEBUG`

**disableUserpassAuth**  
Set to TRUE to disable built-in user authentication. Use to restrict auth to OAuth only.  
Env var: `DISABLE_USERPASS_AUTH`

**editorWordWrap**  
Enable word wrapping in SQL editor.  
Env var: `SQLPAD_EDITOR_WORD_WRAP`

**googleClientId**  
Google Client ID used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'  
Env var: `GOOGLE_CLIENT_ID`

**googleClientSecret**  
Google Client Secret used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'  
Env var: `GOOGLE_CLIENT_SECRET`

**httpsPort**  
Port for SQLPad to listen on.  
Env var: `SQLPAD_HTTPS_PORT`  
Default: `443`

**ip**  
IP address to bind to. By default SQLPad will listen from all available addresses (0.0.0.0).  
Env var: `SQLPAD_IP`  
Default: `0.0.0.0`

**keyPath**  
Absolute path to where SSL certificate key is stored  
Env var: `KEY_PATH`

**passphrase**  
A string of text used to encrypt sensitive values when stored on disk.  
Env var: `SQLPAD_PASSPHRASE`  
Default: `At least the sensitive bits won't be plain text?`

**port**  
Port for SQLPad to listen on.  
Env var: `SQLPAD_PORT`  
Default: `80`

**publicUrl**  
Public URL used for OAuth setup and email links. Protocol expected. Example: https://mysqlpad.com  
Env var: `PUBLIC_URL`

**queryResultMaxRows**  
By default query results are limited to 50,000 records.  
Env var: `SQLPAD_QUERY_RESULT_MAX_ROWS`  
Default: `50000`

**samlAuthContext**  
SAML authentication context URL  
Env var: `SAML_AUTH_CONTEXT`

**samlCallbackUrl**  
SAML callback URL  
Env var: `SAML_CALLBACK_URL`

**samlCert**  
SAML certificate in Base64  
Env var: `SAML_CERT`

**samlEntryPoint**  
SAML Entry point URL  
Env var: `SAML_ENTRY_POINT`

**samlIssuer**  
SAML Issuer  
Env var: `SAML_ISSUER`

**sessionMinutes**  
Minutes to keep a session active. Will extended by this amount each request.  
Env var: `SQLPAD_SESSION_MINUTES`  
Default: `60`

**slackWebhook**  
Supply incoming Slack webhook URL to post query when saved.  
Env var: `SQLPAD_SLACK_WEBHOOK`

**smtpFrom**  
From email address for SMTP. Required in order to send invitation emails.  
Env var: `SQLPAD_SMTP_FROM`

**smtpHost**  
Host address for SMTP. Required in order to send invitation emails.  
Env var: `SQLPAD_SMTP_HOST`

**smtpPassword**  
Password for SMTP.  
Env var: `SQLPAD_SMTP_PASSWORD`

**smtpPort**  
Port for SMTP. Required in order to send invitation emails.  
Env var: `SQLPAD_SMTP_PORT`

**smtpSecure**  
Toggle to use secure connection when using SMTP.  
Env var: `SQLPAD_SMTP_SECURE`  
Default: `true`

**smtpUser**  
Username for SMTP. Required in order to send invitation emails.  
Env var: `SQLPAD_SMTP_USER`

**systemdSocket**  
Acquire socket from systemd if available  
Env var: `SQLPAD_SYSTEMD_SOCKET`

**tableChartLinksRequireAuth**  
When false, table and chart result links will be operational without login.  
Env var: `SQLPAD_TABLE_CHART_LINKS_REQUIRE_AUTH`  
Default: `true`

**timeoutSeconds**  
HTTP server timeout as number of seconds. Extend as necessary for long running queries.
Env var: `SQLPAD_TIMEOUT_SECONDS`  
Default: `300`

**whitelistedDomains**  
Allows pre-approval of email domains. Delimit multiple domains by empty space.  
Env var: `WHITELISTED_DOMAINS`

### Connection configuration

As of 3.2.0 connections may be defined via application configuration.

Every connection defined should provide a `name` and `driver` value, with driver equaling the value in header parentheses below. `name` will be the label used in the UI to label the connection.

Field names and values are case sensitive.

The connection ID value used can be any alphanumeric value, and is case-sensitive. This can be a randomly generated value like SQLPad's underlying embedded database uses, or it can be a more human-friendly name, or an id used from another source.

How connections are defined in configuration depends on the source of the configuration.

#### Environment variable

When using environment variables, connection field values must be provided using an environment variable with the convention `SQLPAD_CONNECTIONS__<connectionId>__<fieldName>`. Note double underscores between `SQLPAD_CONNECTIONS`, `<connectionId>`, and `<fieldName>`. Both connection ID and field name values are case sensitive. Boolean values should be the value `true` or `false`.

Example for a MySQL connection with id `prod123`.

```sh
SQLPAD_CONNECTIONS__prod123__name="Production 123"
SQLPAD_CONNECTIONS__prod123__driver=mysql
SQLPAD_CONNECTIONS__prod123__host=localhost
SQLPAD_CONNECTIONS__prod123__mysqlInsecureAuth=true
```

#### INI file

When defining a connection in an INI file, use section header with the value `connections.<connectionId>`.

```ini
[connections.prod123]
name = Production 123
driver = mysql
host = localhost
mysqlInsecureAuth = true
```

#### JSON file

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

#### CrateDB (crate)

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

#### Apache Drill (drill)

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

#### SAP Hana (hdb)

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

#### MySQL (mysql)

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

#### PostgreSQL (postgres)

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

#### PrestoDB (presto)

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

#### MS SQL Server (sqlserver)

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
  </tbody>
</table>

#### Vertica (vertica)

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

#### Cassandra (cassandra)

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

## License

MIT
