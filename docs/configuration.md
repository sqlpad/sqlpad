# Configuration

SQLPad may be configured via environment variables, config file, or command line flags.

Config file path may be specified passing command line option `--config` or environment variable `SQLPAD_CONFIG`.
For example:

```sh
node server.js --config ~/sqlpad.ini
```

For INI and JSON config file examples, see [config-example.ini](https://github.com/rickbergfalk/sqlpad/blob/master/config-example.ini) and [config-example.json](https://github.com/rickbergfalk/sqlpad/blob/master/config-example.json) in GitHub repository.

!> For examples below, **key** refers to key in INI/JSON file. **Env** for environment variable.

## admin

Email address to whitelist/give admin permissions to.

- Key: `admin`
- Env: `SQLPAD_ADMIN`

## adminPassword

Password to set for admin email address on application start. Requires `admin` setting to also be provided.

- Key: `adminPassword`
- Env: `SQLPAD_ADMIN_PASSWORD`

## allowCsvDownload

Enable csv, json and xlsx downloads.

- Key: `allowCsvDownload`
- Env: `SQLPAD_ALLOW_CSV_DOWNLOAD`
- Default: `true`

## baseUrl

Path to mount sqlpad app following domain. Example, if '/sqlpad' is provided queries page would be mydomain.com/sqlpad/queries

- Key: `baseUrl`
- Env: `SQLPAD_BASE_URL`

## certPassphrase

Passphrase for your SSL certification file

- Key: `certPassphrase`
- Env: `CERT_PASSPHRASE`

## certPath

Absolute path to where SSL certificate is stored

- Key: `certPath`
- Env: `CERT_PATH`

## cookieName

Name used for cookie. If running multiple SQLPads on same domain, set to different values.

- Key: `cookieName`
- Env: `SQLPAD_COOKIE_NAME`
- Default: `sqlpad.sid`

## cookieSecret

Secret used to sign cookies

- Key: `cookieSecret`
- Env: `SQLPAD_COOKIE_SECRET`
- Default: `secret-used-to-sign-cookies-please-set-and-make-strong`

## dbPath

Directory to store SQLPad embedded database content. This includes queries, users, query result cache files, etc.

- Key: `dbPath`
- Env: `SQLPAD_DB_PATH`

## dbInMemory

If enabled, runs embedded database `nedb` in memory. `dbPath` is still required to be provided for cache and session support. (`dbPath` will be made optional in future release)

- Key: `dbInMemory`
- Env: `SQLPAD_DB_IN_MEMORY`

## debug

Add a variety of logging to console while running SQLPad

- Key: `debug`
- Env: `SQLPAD_DEBUG`

## disableAuth

Set to TRUE to disable authentication altogether.

- Key: `disableAuth`
- Env: `DISABLE_AUTH`

## disableUserpassAuth

Set to TRUE to disable built-in user authentication. Probably desired when using other auths like OAuth or SAML.

- Key: `disableUserpassAuth`
- Env: `DISABLE_USERPASS_AUTH`

## editorWordWrap

Enable word wrapping in SQL editor.

- Key: `editorWordWrap`
- Env: `SQLPAD_EDITOR_WORD_WRAP`

## googleClientId

Google Client ID used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'

- Key: `googleClientId`
- Env: `GOOGLE_CLIENT_ID`

## googleClientSecret

Google Client Secret used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'

- Key: `googleClientSecret`
- Env: `GOOGLE_CLIENT_SECRET`

## httpsPort

Port for SQLPad to listen on.

- Key: `httpsPort`
- Env: `SQLPAD_HTTPS_PORT`
- Default: `443`

## ip

IP address to bind to. By default SQLPad will listen from all available addresses (0.0.0.0).

- Key: `ip`
- Env: `SQLPAD_IP`
- Default: `0.0.0.0`

## keyPath

Absolute path to where SSL certificate key is stored

- Key: `keyPath`
- Env: `KEY_PATH`

## passphrase

A string of text used to encrypt connection user and password values when stored on disk.

- Key: `passphrase`
- Env: `SQLPAD_PASSPHRASE`
- Default: `At least the sensitive bits won't be plain text?`

## port

Port for SQLPad to listen on.

- Key: `port`
- Env: `SQLPAD_PORT`
- Default: `80`

## publicUrl

Public URL used for OAuth setup and email links. Protocol expected. Example: https://mysqlpad.com

- Key: `publicUrl`
- Env: `PUBLIC_URL`

## queryResultMaxRows

By default query results are limited to 50,000 records.

- Key: `queryResultMaxRows`
- Env: `SQLPAD_QUERY_RESULT_MAX_ROWS`
- Default: `50000`

## samlAuthContext

SAML authentication context URL

- Key: `samlAuthContext`
- Env: `SAML_AUTH_CONTEXT`

## samlCallbackUrl

SAML callback URL

- Key: `samlCallbackUrl`
- Env: `SAML_CALLBACK_URL`

## samlCert

SAML certificate in Base64

- Key: `samlCert`
- Env: `SAML_CERT`

## samlEntryPoint

SAML Entry point URL

- Key: `samlEntryPoint`
- Env: `SAML_ENTRY_POINT`

## samlIssuer

SAML Issuer

- Key: `samlIssuer`
- Env: `SAML_ISSUER`

## serviceTokenSecret

Secret to sign the generated Service Tokens

- Key: `serviceTokenSecret`
- Env: `SERVICE_TOKEN_SECRET`

## sessionMinutes

Minutes to keep a session active. Will extended by this amount each request.

- Key: `sessionMinutes`
- Env: `SQLPAD_SESSION_MINUTES`
- Default: `60`

## slackWebhook

Supply incoming Slack webhook URL to post query when saved.

- Key: `slackWebhook`
- Env: `SQLPAD_SLACK_WEBHOOK`

## smtpFrom

From email address for SMTP. Required in order to send invitation emails.

- Key: `smtpFrom`
- Env: `SQLPAD_SMTP_FROM`

## smtpHost

Host address for SMTP. Required in order to send invitation emails.

- Key: `smtpHost`
- Env: `SQLPAD_SMTP_HOST`

## smtpPassword

Password for SMTP.

- Key: `smtpPassword`
- Env: `SQLPAD_SMTP_PASSWORD`

## smtpPort

Port for SMTP. Required in order to send invitation emails.

- Key: `smtpPort`
- Env: `SQLPAD_SMTP_PORT`

## smtpSecure

Toggle to use secure connection when using SMTP.

- Key: `smtpSecure`
- Env: `SQLPAD_SMTP_SECURE`
- Default: `true`

## smtpUser

Username for SMTP. Required in order to send invitation emails.

- Key: `smtpUser`
- Env: `SQLPAD_SMTP_USER`

## systemdSocket

Acquire socket from systemd if available

- Key: `systemdSocket`
- Env: `SQLPAD_SYSTEMD_SOCKET`

## tableChartLinksRequireAuth

When false, table and chart result links will be operational without login.

- Key: `tableChartLinksRequireAuth`
- Env: `SQLPAD_TABLE_CHART_LINKS_REQUIRE_AUTH`
- Default: `true`

## timeoutSeconds

HTTP server timeout as number of seconds. Extend as necessary for long running queries.

- Key: `timeoutSeconds`
- Env: `SQLPAD_TIMEOUT_SECONDS`
- Default: `300`

## whitelistedDomains

Allows pre-approval of email domains. Delimit multiple domains by empty space.

- Key: `whitelistedDomains`
- Env: `WHITELISTED_DOMAINS`

## allowConnectionAccessToEveryone

Allows access on every connection to every user.

- Key: `allowConnectionAccessToEveryone`
- Env: `SQLPAD_ALLOW_CONNECTION_ACCESS_TO_EVERYONE`
- Default: `true`

## queryHistoryRetentionTimeInDays

Query history entries created before the retention period will be deleted automatically.

- Key: `queryHistoryRetentionTimeInDays`
- Env: `SQLPAD_QUERY_HISTORY_RETENTION_PERIOD_IN_DAYS`
- Default: `30`

## queryHistoryResultMaxRows

By default query history results are limited to 1,000 records.

- Key: `queryHistoryResultMaxRows`
- Env: `SQLPAD_QUERY_HISTORY_RESULT_MAX_ROWS`
- Default: `1000`

## appLogLevel

Minimum level for app logs. Should be one of 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'.

- Key: `appLogLevel`
- Env: `SQLPAD_APP_LOG_LEVEL`
- Default: `info`

## webLogLevel

Minimum level for web logs. Should be one of 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'.

- Key: `webLogLevel`
- Env: `SQLPAD_WEB_LOG_LEVEL`
- Default: `info`

## seedDataPath

Path to root of seed data directories. See Seed Data documentation.

- Key: `seedDataPath`
- Env: `SQLPAD_SEED_DATA_PATH`
