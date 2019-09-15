# SQLPad

[![Build Status](https://travis-ci.org/rickbergfalk/sqlpad.svg?branch=master)](https://travis-ci.org/rickbergfalk/sqlpad)

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate, Vertica, Presto, and SAP HANA. Other databases potentially supported via [unix odbc support](https://github.com/rickbergfalk/sqlpad/wiki/ODBC).

![SQLPad Query Editor](https://rickbergfalk.github.io/sqlpad/images/screenshots/v3-beta.png)

## Docker Image

The docker image runs on port 3000 and uses `/var/lib/sqlpad` for the embedded database directory.

For configuration exposed via environment variables reference [CONFIGURATION.md](https://github.com/rickbergfalk/sqlpad/blob/master/CONFIGURATION.md).

See [docker-examples](https://github.com/rickbergfalk/sqlpad/tree/master/docker-examples) directory for example docker-compose setup with SQL Server.

## Building

- Install node 10 or later
- Clone/download this repo
- Install dependencies and build the UI

  ```sh
  scripts/build.sh
  ```

  The gist of this script is:

  ```sh
  # install root level dependencies using package-lock.json as reference
  npm ci
  # install front-end dependencies using package-lock.json
  cd client
  npm ci
  # build front-end
  npm run build
  # install back-end dependencies
  cd ../server
  npm ci
  cd ..
  # copy client build to server directory
  mkdir server/public
  cp -r client/build/* server/public
  ```

At this point you can run the SQLPad server with the front-end built for production use:

```sh
cd server
node server.js --dbPath ../db --port 3010
```

If prefered, SQLPad can be installed as a global module using the local files in this repo. This allows running SQLPad via the cli in any directory, just as if you had installed it with `npm install sqlpad -g`. Note that you must build and copy the client prior to this step.

```sh
cd server
node install -g

# Now from somewhere else you can run sqlpad like
cd ~
sqlpad --dbPath ../db --port 3010
```

A docker image may be built using the Dockerfile located in `server` directory. See `docker-publish.sh` for example docker build command.

## Configuration

SQLPad may be configured via environment variables, config file, or command line flags.

Config file path may be specified passing command line option `--config` or environment variable `SQLPAD_CONFIG`.
For example:

```sh
node server.js --config ~/.sqlpadrc
```

For INI and JSON config file examples, see `config-example.ini` and `config-example.json` in GitHub repository.

### Version 3 changes

Previously SQLPad supported a default dbPath of `$HOME/sqlpad/db` and a default config file path of `$HOME/.sqlpadrc`.

These defaults have been removed in version 3.

### Config variables

```sh
# Passphrase for your SSL certification file
CERT_PASSPHRASE=""

# Absolute path to where SSL certificate is stored
CERT_PATH=""

# Set to TRUE to disable built-in user authentication. Use to restrict auth to OAuth only.
DISABLE_USERPASS_AUTH="false"

# Google Client ID used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'
GOOGLE_CLIENT_ID=""

# Google Client Secret used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'
GOOGLE_CLIENT_SECRET=""

# Absolute path to where SSL certificate key is stored
KEY_PATH=""

# Public URL used for OAuth setup and email links. Protocol expected. Example: https://mysqlpad.com
PUBLIC_URL=""

# SAML authentication context URL
SAML_AUTH_CONTEXT=""

# SAML callback URL
SAML_CALLBACK_URL=""

# SAML certificate in Base64
SAML_CERT=""

# SAML Entry point URL
SAML_ENTRY_POINT=""

# SAML Issuer
SAML_ISSUER=""

# Email address to whitelist/give admin permissions to
SQLPAD_ADMIN=""

# Enable csv and xlsx downloads.
SQLPAD_ALLOW_CSV_DOWNLOAD="true"

# Path to mount sqlpad app following domain. Example, if '/sqlpad' is provided queries page would be mydomain.com/sqlpad/queries
SQLPAD_BASE_URL=""

# JSON/INI file to read for config
SQLPAD_CONFIG=""

# Secret used to sign cookies
SQLPAD_COOKIE_SECRET="secret-used-to-sign-cookies-please-set-and-make-strong"

# Directory to store SQLPad embedded database content. This includes queries, users, query result cache files, etc.
SQLPAD_DB_PATH=""

# Add a variety of logging to console while running SQLPad
SQLPAD_DEBUG="false"

# Enable word wrapping in SQL editor.
SQLPAD_EDITOR_WORD_WRAP="false"

# Port for SQLPad to listen on.
SQLPAD_HTTPS_PORT="443"

# IP address to bind to. By default SQLPad will listen from all available addresses (0.0.0.0).
SQLPAD_IP="0.0.0.0"

# A string of text used to encrypt sensitive values when stored on disk.
SQLPAD_PASSPHRASE="At least the sensitive bits won't be plain text?"

# Port for SQLPad to listen on.
SQLPAD_PORT="80"

# By default query results are limited to 50,000 records.
SQLPAD_QUERY_RESULT_MAX_ROWS="50000"

# Minutes to keep a session active. Will extended by this amount each request.
SQLPAD_SESSION_MINUTES="60"

# Supply incoming Slack webhook URL to post query when saved.
SQLPAD_SLACK_WEBHOOK=""

# From email address for SMTP. Required in order to send invitation emails.
SQLPAD_SMTP_FROM=""

# Host address for SMTP. Required in order to send invitation emails.
SQLPAD_SMTP_HOST=""

# Password for SMTP.
SQLPAD_SMTP_PASSWORD=""

# Port for SMTP. Required in order to send invitation emails.
SQLPAD_SMTP_PORT=""

# Toggle to use secure connection when using SMTP.
SQLPAD_SMTP_SECURE="true"

# Username for SMTP. Required in order to send invitation emails.
SQLPAD_SMTP_USER=""

# Acquire socket from systemd if available
SQLPAD_SYSTEMD_SOCKET="false"

# When false, table and chart result links will be operational without login.
SQLPAD_TABLE_CHART_LINKS_REQUIRE_AUTH="true"

# Allows pre-approval of email domains. Delimit multiple domains by empty space.
WHITELISTED_DOMAINS=""
```

## Development

[Developer guide](DEVELOPER-GUIDE.md)

## License

MIT
