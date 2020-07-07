# Configuration

SQLPad may be configured via environment variables or an .env config file.

Config file path may be specified passing command line option `--config` or environment variable `SQLPAD_CONFIG`.
For example:

```sh
node server.js --config path/to/.env
# or
env SQLPAD_CONFIG=path/to/.env node server.js
```

A [config file example](https://github.com/rickbergfalk/sqlpad/blob/master/config-example.env) can be found in the GitHub repository.

As of v5.1.0, INI and JSON configuration files are deprecated.

## admin

Email address to give admin permissions to.

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

!> Deprecated. To be removed in v6. [Use reverse proxy](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/delegatetoproxy.md)

Passphrase for your SSL certification file

- Key: `certPassphrase`
- Env: `CERT_PASSPHRASE`

## certPath

!> Deprecated. To be removed in v6. [Use reverse proxy](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/delegatetoproxy.md)

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

## migrate

Run migrations on SQLPad process start, then exits. Use to control when migrations are run, particularly of use when running multiple instances of SQLPad.

This option is most likely useful as a cli flag, but it can be specified via file as well.

Example:

```sh
node server.js --config path/to/file.ext --migrate
```

- Key: `migrate`
- Env: `SQLPAD_MIGRATE`

## dbAutomigrate

Enable/disable automigration on SQLPad process start. Disable by setting to `false`

- Key: `dbAutomigrate`
- Env: `SQLPAD_DB_AUTOMIGRATE`
- Default: `true`

## dbPath

Directory to store SQLPad embedded database content. This includes queries, users, query result cache files, etc.

- Key: `dbPath`
- Env: `SQLPAD_DB_PATH`

## dbInMemory

If enabled, runs embedded database `nedb` in memory. In this case, the database contents will be lost when the application stops. `dbPath` is still required to be provided for cache and session support. (`dbPath` will be made optional in future release)

- Key: `dbInMemory`
- Env: `SQLPAD_DB_IN_MEMORY`

## backendDatabaseUri

(Experimental) You can specify an external database to be used instead of the local sqlite database, by specifing a [Sequelize](https://sequelize.org/v5/) connection string. Supported databases are: mysql, mariadb, sqlite3, mssql. Some options can be provided in the connection string. Example: `mariadb://username:password@host:port/databasename?ssl=true`

- Key: `backendDatabaseUri`
- Env: `SQLPAD_BACKEND_DB_URI`

## defaultConnectionId

Default connection to select on SQLPad load if connection not previousy selected. Once selected, connection selections are cached locally in the browser.

- key: `defaultConnectionId`
- Env: `SQLPAD_DEFAULT_CONNECTION_ID`

## disableAuth

Set to TRUE to disable authentication altogether.

- Key: `disableAuth`
- Env: `DISABLE_AUTH`

## disableAuthDefaultRole

Specifies the role associated with users when disableAuth is set to true.
Acceptable values: `admin`, `editor`.

- Key: `disableAuthDefaultRole`
- Env: `SQLPAD_DISABLE_AUTH_DEFAULT_ROLE`

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
- Env: `SQLPAD_GOOGLE_CLIENT_ID`

## googleClientSecret

Google Client Secret used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'

- Key: `googleClientSecret`
- Env: `SQLPAD_GOOGLE_CLIENT_SECRET`

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

!> Deprecated. To be removed in v6. [Use reverse proxy](https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/production/delegatetoproxy.md)

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

SAML authentication context URL. A sensible value is: `urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport`.

- Key: `samlAuthContext`
- Env: `SQLPAD_SAML_AUTH_CONTEXT`

## samlCallbackUrl

SAML callback URL. It will generally be constructed from the deployment's internet address and the fixed route, for example: https://mysqlpad.com/login/callback

- Key: `samlCallbackUrl`
- Env: `SQLPAD_SAML_CALLBACK_URL`

## samlCert

SAML certificate in Base64

- Key: `samlCert`
- Env: `SQLPAD_SAML_CERT`

## samlEntryPoint

SAML Entry point URL

- Key: `samlEntryPoint`
- Env: `SQLPAD_SAML_ENTRY_POINT`

## samlIssuer

SAML Issuer

- Key: `samlIssuer`
- Env: `SQLPAD_SAML_ISSUER`

## samlLinkHtml

HTML code for the sign-in link used for starting SAML authentication. The default is `Sign in with SSO`

- Key: `samlLinkHtml`
- Env: `SQLPAD_SAML_LINK_HTML`

## samlAutoSignUp

Auto create a user record if it does not exist when new user is detected via SAML

- Key: `samlAutoSignUp`
- Env: `SQLPAD_SAML_AUTO_SIGN_UP`
- Default: `false`

## samlDefaultRole

Default role to assign user created when `samlAutoSignUp` is turned on. Accepted values are `editor` and `admin`. Default value is `editor`.

- Key: `samlDefaultRole`
- Env: `SQLPAD_SAML_DEFAULT_ROLE`

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

## timeoutSeconds

HTTP server timeout as number of seconds. Extend as necessary for long running queries.

- Key: `timeoutSeconds`
- Env: `SQLPAD_TIMEOUT_SECONDS`
- Default: `300`

## allowedDomains

Allows pre-approval of email domains. Delimit multiple domains by empty space.

- Key: `allowedDomains`
- Env: `SQLPAD_ALLOWED_DOMAINS`

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

## authProxyEnabled

Enable auth proxy authentication support

- Key: `authProxyEnabled`
- Env: `SQLPAD_AUTH_PROXY_ENABLED`
- Default: `false`

## authProxyAutoSignUp

Auto create a user record if it does not exist when new user is detected via auth proxy

- Key: `authProxyAutoSignUp`
- Env: `SQLPAD_AUTH_PROXY_AUTO_SIGN_UP`
- Default: `false`

## authProxyDefaultRole

Default role to assign user created when `authProxyAutoSignUp` is turned on. By default this is an empty-string and not used, expecting a role to be provided via header-mapping.

- Key: `authProxyDefaultRole`
- Env: `SQLPAD_AUTH_PROXY_DEFAULT_ROLE`

## authProxyHeaders

Space-delimited field:header mappings to use to derive user information from HTTP headers. A mapping to `email` is required at a minimum assuming `authProxyDefaultRole` is set. Otherwise `role`, `id`, `name` and `data.<customField>` fields may be set.

When supplying both `id` and `email`, `id` will be used for user matching instead of `email`, updating SQLPad user `email` fields when they change (assuming `id` is not changing).

- Key: `authProxyHeaders`
- Env: `SQLPAD_AUTH_PROXY_HEADERS`

## enableLdapAuth

Set to `true` to enable LDAP authentication

- Key: `enableLdapAuth`
- Env: `ENABLE_LDAP_AUTH`

## ldapUrl

LDAP server URL. Examples: `ldap://localhost:389`, `ldaps://ad.corporate.com:636`

- Key: `ldapUrl`
- Env: `LDAP_URL`

## ldapBaseDN

Base LDAP DN to search for users in

- Key: `ldapBaseDN`
- Env: `LDAP_BASE_DN`

## ldapUsername

Username for LDAP lookup

- Key: `ldapUsername`
- Env: `LDAP_USERNAME`

## ldapPassword

Password for LDAP user used for LDAP lookup

- Key: `ldapPassword`
- Env: `LDAP_PASSWORD`

## OpenID Connect

<table>
  <thead>
    <tr>
      <th>key</th>
      <th>description</th>
      <th>default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>SQLPAD_OIDC_CLIENT_ID</code></td>
      <td>Client ID</td>
      <td></td>
    </tr>
    <tr>
      <td><code>SQLPAD_OIDC_CLIENT_SECRET</code></td>
      <td>Client secret</td>
      <td></td>
    </tr>
    <tr>
      <td><code>SQLPAD_OIDC_ISSUER</code></td>
      <td>Issuer</td>
      <td></td>
    </tr>
    <tr>
      <td><code>SQLPAD_OIDC_AUTHORIZATION_URL</code></td>
      <td>Authorization URL</td>
      <td></td>
    </tr>
    <tr>
      <td><code>SQLPAD_OIDC_TOKEN_URL</code></td>
      <td>Token URL</td>
      <td></td>
    </tr>
    <tr>
      <td><code>SQLPAD_OIDC_USER_INFO_URL</code></td>
      <td>User info URL</td>
      <td></td>
    </tr>
    <tr>
      <td><code>SQLPAD_OIDC_LINK_HTML</code></td>
      <td>Inner HTML for OpenID sign in button customization</td>
      <td>Sign in with OpenID</td>
    </tr>
  </tbody>
</table>
