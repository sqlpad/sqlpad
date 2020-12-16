# Configuration

!> 6.0.0 removes JSON/INI config file support. See [CHANGELOG](https://github.com/sqlpad/sqlpad/blob/master/CHANGELOG.md) for more info.

?> .env config file support added in 5.1.0

SQLPad may be configured via environment variables or an .env config file.

Config file path may be specified passing command line option `--config` or environment variable `SQLPAD_CONFIG`.
For example:

```bash
node server.js --config path/to/.env
# or
env SQLPAD_CONFIG=path/to/.env node server.js
```

A [config file example](https://github.com/sqlpad/sqlpad/blob/master/config-example.env) can be found in the GitHub repository.

## Application Configuration (General)

```bash
# IP address to bind to. By default SQLPad will listen from all available addresses (0.0.0.0).
SQLPAD_IP = "0.0.0.0"

# Port to listen on. Used for both HTTP and HTTPS.
# Defaults to 80 in code, 3000 in Docker Hub Image
SQLPAD_PORT = 3000

# Public URL used for various authentication setups. Protocol is expected.
# This value will be sent with webhook payloads as well.
# Example: https://mysqlpad.com
PUBLIC_URL = ""

# Path to mount SQLPad app following domain.
# Example:
# If SQLPAD_BASE_URL = "/sqlpad" and PUBLIC_URL = "https://mysqlpad.com",
# the queries page would be `https://mysqlpad.com/sqlpad/queries`
SQLPAD_BASE_URL = ""

# Passphrase to encrypt sensitive connection information (like user & password) when stored in backing database.
SQLPAD_PASSPHRASE = "At least the sensitive bits won't be plain text?"

# HTTP server timeout as number of seconds.
SQLPAD_TIMEOUT_SECONDS = 300

# HTTP server maximum payload size.
# Defaults to `1mb`
# Uses bytes.js syntax (https://github.com/visionmedia/bytes.js#bytesparsestringnumber-value-numbernull)
# If no unit is given it is assumed the value is in bytes
# Useful valid units are `kb`, `mb` in base 2 (1mb = 1024kb)
SQLPAD_BODY_LIMIT = "1mb"

# Minutes to keep a session active. Session will be extended by this amount each request.
SQLPAD_SESSION_MINUTES = 60

# Store to use for user session
# Valid values are `file` (default), `database`, `redis`, `memory`
# `file` uses files in the sessions directory under SQLPAD_DB_PATH
# `memory` may be used for single sqlpad instances, and works well for no-auth setups
# `redis` offers best performance and is most commonly used. SQLPAD_REDIS_URI must also be set.
# `database` will use whatever backend database is used (or SQLite if SQLPAD_DB_PATH is set)
SQLPAD_SESSION_STORE = "file"

# Similar to session storage, query result storage may also be configured.
# Valid values are `file` (default), `database`, `redis`, `memory`
# If set to `memory`, store is limited to 1000 entries with a max age of 1 hour
# Other storage mechanisms fall back to SQLPAD_QUERY_HISTORY_RETENTION_PERIOD_IN_DAYS
# If `redis` is used, SQLPAD_REDIS_URI must also be set.
SQLPAD_QUERY_RESULT_STORE = "file"

# Name used for cookie. If running multiple SQLPads on same domain, set to different values.
SQLPAD_COOKIE_NAME = "sqlpad.sid"

# Secret used to sign cookies
SQLPAD_COOKIE_SECRET = "secret-used-to-sign-cookies-please-set-and-make-strong"

# Acquire socket from systemd if available
SQLPAD_SYSTEMD_SOCKET = ""

# Allows pre-approval of email domains for variety of authentication mechanisms.
# Delimit multiple domains by empty space.
SQLPAD_ALLOWED_DOMAINS = ""

# Path to root of seed data directories. See Seed Data documentation.
SQLPAD_SEED_DATA_PATH = ""
```

## Application Behavior

```bash
# Enable word wrapping in SQL editor
SQLPAD_EDITOR_WORD_WRAP = "false"

# By default query results are limited to 10,000 records
SQLPAD_QUERY_RESULT_MAX_ROWS = 10000

# Enable csv, json and xlsx downloads
SQLPAD_ALLOW_CSV_DOWNLOAD = "true"

# Allows access on every connection to every user.
SQLPAD_ALLOW_CONNECTION_ACCESS_TO_EVERYONE = "true"

# Query history entries created before the retention period will be deleted automatically.
SQLPAD_QUERY_HISTORY_RETENTION_PERIOD_IN_DAYS = 30

# By default query history results are limited to 1,000 records.
SQLPAD_QUERY_HISTORY_RESULT_MAX_ROWS = 1000

# Default connection to select on SQLPad load if connection not previously selected.
# Once selected, connection selections are cached locally in the browser.
SQLPAD_DEFAULT_CONNECTION_ID = ""
```

## Redis

Redis may be used for session storage as of `5.3.0`, and query result storage as of `5.4.0`.

```bash
# URI for redis instance to use when SQLPAD_SESSION_STORE or SQLPAD_QUERY_RESULT_STORE are set to `redis`
# Format should be [redis[s]:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]]
# More info at http://www.iana.org/assignments/uri-schemes/prov/redis
SQLPAD_REDIS_URI = ""
```

## Backend Database Management

SQLPad may be configured to use SQLite, PostgreSQL, MySQL, MariaDB, or SQL Server as a backing database.

To use SQLite, all that must be set is `SQLPAD_DB_PATH`, and a `sqlite` file will be created on application start. In the official docker image, this path is set to `/var/lib/sqlpad`.

To use a different backend database, set `SQLPAD_BACKEND_DB_URI` to the desired target database.

```bash
# Directory to store SQLPad disk-backed resources.
# Depending on configuration this could include SQLite file, query result cache files, and session storage.
# In the official docker image, this path is set to `/var/lib/sqlpad`.
SQLPAD_DB_PATH = ""

# You can specify an external database to be used instead of the local sqlite database,
# by specifying a [Sequelize](https://sequelize.org/v5/) connection string.
# Supported databases are: mysql, mariadb, sqlite3, mssql.
# Some options can be provided in the connection string.
# Example: `mariadb://username:password@host:port/databasename?ssl=true`
SQLPAD_BACKEND_DB_URI = ""

# If enabled, runs SQLite in memory
# In this case, the database contents will be lost when the application stops.
# SQLPAD_DB_PATH is still required if SQLPAD_SESSION_STORE or SQLPAD_QUERY_RESULT_STORE are set to file.
SQLPAD_DB_IN_MEMORY = "false"
```

## Database Migrations

By default, migrations are run on service start up. This behavior can be disabled, and migrations can instead be run on demand. This is particularly of use when running multiple instances of SQLPad.

When run on demand, the SQLPad process will exit after migrations complete.

This option is most likely useful as a cli flag, but it can be specified via environment variable as well.

Example:

```bash
node server.js --config path/to/file.ext --migrate
# or via environment variable
env SQLPAD_MIGRATE = "true" node server.js --config path/to/file.env
```

```bash
# If set to true, SQLPad process will exit after database migration is performed
SQLPAD_MIGRATE = "false"

# Enable/disable automigration on SQLPad process start. Disable by setting to `false`
SQLPAD_DB_AUTOMIGRATE = "true"
```

## Service Tokens

Secret to sign the generated Service Tokens.

To generate a service token, log into SQLPad as an `admin` user and click `Service Tokens`. A service token can be scoped to a certain role (admin or editor) and limited to a window of time.

The generated Bearer token may be used by passing it via the Authorization header:

```bash
curl -X GET -H 'Accept: application/json' -H "Authorization: Bearer the.generated.token" http://localhost:3010/api/users
```

For more information on APIs available see [API Overview](/api-overview).

```bash
# Secret to sign the generated Service Tokens
SQLPAD_SERVICE_TOKEN_SECRET = ""
```

## Logging

Minimum level for logs. Should be one of `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent`. App logs contain log messages taken by application (running queries, creating users, general errors, etc.) while web logs are used for logging web requests made and related information, like time taken to serve them.

```bash
SQLPAD_APP_LOG_LEVEL = 'info'
SQLPAD_WEB_LOG_LEVEL = 'info
```

See [logging](/logging) for log examples.

## HTTPS

HTTPS may be configured to be used by SQLPad directly. However if performance becomes an issue, consider [using a reverse proxy](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/delegatetoproxy.md).

```bash
# Absolute path to where SSL certificate is stored
SQLPAD_HTTPS_CERT_PATH = ""
# Absolute path to where SSL certificate key is stored
SQLPAD_HTTPS_KEY_PATH = ""
# Passphrase for your SSL certification file
SQLPAD_HTTPS_CERT_PASSPHRASE = ""
```

## Authentication

See [Authentication page](/authentication) for information on configuring authentication mechanisms.
