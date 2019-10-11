# SQLPad

[![Build Status](https://travis-ci.org/rickbergfalk/sqlpad.svg?branch=master)](https://travis-ci.org/rickbergfalk/sqlpad)

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate, Vertica, Presto, and SAP HANA. Other databases potentially supported via [unix odbc support](https://github.com/rickbergfalk/sqlpad/wiki/ODBC).

![SQLPad Query Editor](https://rickbergfalk.github.io/sqlpad/images/screenshots/v3-beta.png)

## Docker Image

The docker image runs on port 3000 and uses `/var/lib/sqlpad` for the embedded database directory.

`latest` tag is continously built from latest commit in repo. Use specific version tags to ensure stability.

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

**whitelistedDomains**  
Allows pre-approval of email domains. Delimit multiple domains by empty space.  
Env var: `WHITELISTED_DOMAINS`

## Development

[Developer guide](DEVELOPER-GUIDE.md)

## License

MIT
