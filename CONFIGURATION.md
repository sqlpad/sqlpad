

## Config

**admin**  
Email address to whitelist/give admin permissions to  
Env var: `SQLPAD_ADMIN`  

**allowCsvDownload**  
Enable csv and xlsx downloads.  
Env var: `SQLPAD_ALLOW_CSV_DOWNLOAD`  
default: `true`

**baseUrl**  
Path to mount sqlpad app following domain. Example, if '/sqlpad' is provided queries page would be mydomain.com/sqlpad/queries  
Env var: `SQLPAD_BASE_URL`  

**certPassphrase**  
Passphrase for your SSL certification file  
Env var: `CERT_PASSPHRASE`  

**certPath**  
Absolute path to where SSL certificate is stored  
Env var: `CERT_PATH`  

**config**  
JSON/INI file to read for config  
Env var: `SQLPAD_CONFIG`  

**cookieSecret**  
Secret used to sign cookies  
Env var: `SQLPAD_COOKIE_SECRET`  
default: `secret-used-to-sign-cookies-please-set-and-make-strong`

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
default: `443`

**ip**  
IP address to bind to. By default SQLPad will listen from all available addresses (0.0.0.0).  
Env var: `SQLPAD_IP`  
default: `0.0.0.0`

**keyPath**  
Absolute path to where SSL certificate key is stored  
Env var: `KEY_PATH`  

**passphrase**  
A string of text used to encrypt sensitive values when stored on disk.  
Env var: `SQLPAD_PASSPHRASE`  
default: `At least the sensitive bits won't be plain text?`

**port**  
Port for SQLPad to listen on.  
Env var: `SQLPAD_PORT`  
default: `80`

**publicUrl**  
Public URL used for OAuth setup and email links. Protocol expected. Example: https://mysqlpad.com  
Env var: `PUBLIC_URL`  

**queryResultMaxRows**  
By default query results are limited to 50,000 records.  
Env var: `SQLPAD_QUERY_RESULT_MAX_ROWS`  
default: `50000`

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
default: `60`

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
default: `true`

**smtpUser**  
Username for SMTP. Required in order to send invitation emails.  
Env var: `SQLPAD_SMTP_USER`  

**systemdSocket**  
Acquire socket from systemd if available  
Env var: `SQLPAD_SYSTEMD_SOCKET`  

**tableChartLinksRequireAuth**  
When false, table and chart result links will be operational without login.  
Env var: `SQLPAD_TABLE_CHART_LINKS_REQUIRE_AUTH`  
default: `true`

**whitelistedDomains**  
Allows pre-approval of email domains. Delimit multiple domains by empty space.  
Env var: `WHITELISTED_DOMAINS`  


<table>
  <thead>
    <tr>
      <th>
        key<br/>ENV_VAR
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>admin<br />SQLPAD_ADMIN</td>
      <td>Email address to whitelist/give admin permissions to</td>
    </tr><tr>
      <td>allowCsvDownload<br />SQLPAD_ALLOW_CSV_DOWNLOAD</td>
      <td>Enable csv and xlsx downloads.<br>default: <code>true</code></td>
    </tr><tr>
      <td>baseUrl<br />SQLPAD_BASE_URL</td>
      <td>Path to mount sqlpad app following domain. Example, if '/sqlpad' is provided queries page would be mydomain.com/sqlpad/queries</td>
    </tr><tr>
      <td>certPassphrase<br />CERT_PASSPHRASE</td>
      <td>Passphrase for your SSL certification file</td>
    </tr><tr>
      <td>certPath<br />CERT_PATH</td>
      <td>Absolute path to where SSL certificate is stored</td>
    </tr><tr>
      <td>config<br />SQLPAD_CONFIG</td>
      <td>JSON/INI file to read for config</td>
    </tr><tr>
      <td>cookieSecret<br />SQLPAD_COOKIE_SECRET</td>
      <td>Secret used to sign cookies<br>default: <code>secret-used-to-sign-cookies-please-set-and-make-strong</code></td>
    </tr><tr>
      <td>dbPath<br />SQLPAD_DB_PATH</td>
      <td>Directory to store SQLPad embedded database content. This includes queries, users, query result cache files, etc.</td>
    </tr><tr>
      <td>debug<br />SQLPAD_DEBUG</td>
      <td>Add a variety of logging to console while running SQLPad</td>
    </tr><tr>
      <td>disableUserpassAuth<br />DISABLE_USERPASS_AUTH</td>
      <td>Set to TRUE to disable built-in user authentication. Use to restrict auth to OAuth only.</td>
    </tr><tr>
      <td>editorWordWrap<br />SQLPAD_EDITOR_WORD_WRAP</td>
      <td>Enable word wrapping in SQL editor.</td>
    </tr><tr>
      <td>googleClientId<br />GOOGLE_CLIENT_ID</td>
      <td>Google Client ID used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'</td>
    </tr><tr>
      <td>googleClientSecret<br />GOOGLE_CLIENT_SECRET</td>
      <td>Google Client Secret used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'</td>
    </tr><tr>
      <td>httpsPort<br />SQLPAD_HTTPS_PORT</td>
      <td>Port for SQLPad to listen on.<br>default: <code>443</code></td>
    </tr><tr>
      <td>ip<br />SQLPAD_IP</td>
      <td>IP address to bind to. By default SQLPad will listen from all available addresses (0.0.0.0).<br>default: <code>0.0.0.0</code></td>
    </tr><tr>
      <td>keyPath<br />KEY_PATH</td>
      <td>Absolute path to where SSL certificate key is stored</td>
    </tr><tr>
      <td>passphrase<br />SQLPAD_PASSPHRASE</td>
      <td>A string of text used to encrypt sensitive values when stored on disk.<br>default: <code>At least the sensitive bits won't be plain text?</code></td>
    </tr><tr>
      <td>port<br />SQLPAD_PORT</td>
      <td>Port for SQLPad to listen on.<br>default: <code>80</code></td>
    </tr><tr>
      <td>publicUrl<br />PUBLIC_URL</td>
      <td>Public URL used for OAuth setup and email links. Protocol expected. Example: https://mysqlpad.com</td>
    </tr><tr>
      <td>queryResultMaxRows<br />SQLPAD_QUERY_RESULT_MAX_ROWS</td>
      <td>By default query results are limited to 50,000 records.<br>default: <code>50000</code></td>
    </tr><tr>
      <td>samlAuthContext<br />SAML_AUTH_CONTEXT</td>
      <td>SAML authentication context URL</td>
    </tr><tr>
      <td>samlCallbackUrl<br />SAML_CALLBACK_URL</td>
      <td>SAML callback URL</td>
    </tr><tr>
      <td>samlCert<br />SAML_CERT</td>
      <td>SAML certificate in Base64</td>
    </tr><tr>
      <td>samlEntryPoint<br />SAML_ENTRY_POINT</td>
      <td>SAML Entry point URL</td>
    </tr><tr>
      <td>samlIssuer<br />SAML_ISSUER</td>
      <td>SAML Issuer</td>
    </tr><tr>
      <td>sessionMinutes<br />SQLPAD_SESSION_MINUTES</td>
      <td>Minutes to keep a session active. Will extended by this amount each request.<br>default: <code>60</code></td>
    </tr><tr>
      <td>slackWebhook<br />SQLPAD_SLACK_WEBHOOK</td>
      <td>Supply incoming Slack webhook URL to post query when saved.</td>
    </tr><tr>
      <td>smtpFrom<br />SQLPAD_SMTP_FROM</td>
      <td>From email address for SMTP. Required in order to send invitation emails.</td>
    </tr><tr>
      <td>smtpHost<br />SQLPAD_SMTP_HOST</td>
      <td>Host address for SMTP. Required in order to send invitation emails.</td>
    </tr><tr>
      <td>smtpPassword<br />SQLPAD_SMTP_PASSWORD</td>
      <td>Password for SMTP.</td>
    </tr><tr>
      <td>smtpPort<br />SQLPAD_SMTP_PORT</td>
      <td>Port for SMTP. Required in order to send invitation emails.</td>
    </tr><tr>
      <td>smtpSecure<br />SQLPAD_SMTP_SECURE</td>
      <td>Toggle to use secure connection when using SMTP.<br>default: <code>true</code></td>
    </tr><tr>
      <td>smtpUser<br />SQLPAD_SMTP_USER</td>
      <td>Username for SMTP. Required in order to send invitation emails.</td>
    </tr><tr>
      <td>systemdSocket<br />SQLPAD_SYSTEMD_SOCKET</td>
      <td>Acquire socket from systemd if available</td>
    </tr><tr>
      <td>tableChartLinksRequireAuth<br />SQLPAD_TABLE_CHART_LINKS_REQUIRE_AUTH</td>
      <td>When false, table and chart result links will be operational without login.<br>default: <code>true</code></td>
    </tr><tr>
      <td>whitelistedDomains<br />WHITELISTED_DOMAINS</td>
      <td>Allows pre-approval of email domains. Delimit multiple domains by empty space.</td>
    </tr>
  </tbody>
</table>
