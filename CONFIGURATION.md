
<table>
  <thead>
    <tr>
      <th>
        key
      </th>
      <th>
        Env var
      </th>
      <th>
        description
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>admin</td>
      <td>SQLPAD_ADMIN</td>
      <td>Email address to whitelist/give admin permissions to</td>
    </tr><tr>
      <td>allowCsvDownload</td>
      <td>SQLPAD_ALLOW_CSV_DOWNLOAD</td>
      <td>Enable csv and xlsx downloads.<br>default: <code>true</code></td>
    </tr><tr>
      <td>baseUrl</td>
      <td>SQLPAD_BASE_URL</td>
      <td>Path to mount sqlpad app following domain. Example, if '/sqlpad' is provided queries page would be mydomain.com/sqlpad/queries</td>
    </tr><tr>
      <td>certPassphrase</td>
      <td>CERT_PASSPHRASE</td>
      <td>Passphrase for your SSL certification file</td>
    </tr><tr>
      <td>certPath</td>
      <td>CERT_PATH</td>
      <td>Absolute path to where SSL certificate is stored</td>
    </tr><tr>
      <td>config</td>
      <td>SQLPAD_CONFIG</td>
      <td>JSON/INI file to read for config</td>
    </tr><tr>
      <td>cookieSecret</td>
      <td>SQLPAD_COOKIE_SECRET</td>
      <td>Secret used to sign cookies<br>default: <code>secret-used-to-sign-cookies-please-set-and-make-strong</code></td>
    </tr><tr>
      <td>dbPath</td>
      <td>SQLPAD_DB_PATH</td>
      <td>Directory to store SQLPad embedded database content. This includes queries, users, query result cache files, etc.</td>
    </tr><tr>
      <td>debug</td>
      <td>SQLPAD_DEBUG</td>
      <td>Add a variety of logging to console while running SQLPad</td>
    </tr><tr>
      <td>disableUserpassAuth</td>
      <td>DISABLE_USERPASS_AUTH</td>
      <td>Set to TRUE to disable built-in user authentication. Use to restrict auth to OAuth only.</td>
    </tr><tr>
      <td>editorWordWrap</td>
      <td>SQLPAD_EDITOR_WORD_WRAP</td>
      <td>Enable word wrapping in SQL editor.</td>
    </tr><tr>
      <td>googleClientId</td>
      <td>GOOGLE_CLIENT_ID</td>
      <td>Google Client ID used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'</td>
    </tr><tr>
      <td>googleClientSecret</td>
      <td>GOOGLE_CLIENT_SECRET</td>
      <td>Google Client Secret used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'</td>
    </tr><tr>
      <td>httpsPort</td>
      <td>SQLPAD_HTTPS_PORT</td>
      <td>Port for SQLPad to listen on.<br>default: <code>443</code></td>
    </tr><tr>
      <td>ip</td>
      <td>SQLPAD_IP</td>
      <td>IP address to bind to. By default SQLPad will listen from all available addresses (0.0.0.0).<br>default: <code>0.0.0.0</code></td>
    </tr><tr>
      <td>keyPath</td>
      <td>KEY_PATH</td>
      <td>Absolute path to where SSL certificate key is stored</td>
    </tr><tr>
      <td>passphrase</td>
      <td>SQLPAD_PASSPHRASE</td>
      <td>A string of text used to encrypt sensitive values when stored on disk.<br>default: <code>At least the sensitive bits won't be plain text?</code></td>
    </tr><tr>
      <td>port</td>
      <td>SQLPAD_PORT</td>
      <td>Port for SQLPad to listen on.<br>default: <code>80</code></td>
    </tr><tr>
      <td>publicUrl</td>
      <td>PUBLIC_URL</td>
      <td>Public URL used for OAuth setup and email links. Protocol expected. Example: https://mysqlpad.com</td>
    </tr><tr>
      <td>queryResultMaxRows</td>
      <td>SQLPAD_QUERY_RESULT_MAX_ROWS</td>
      <td>By default query results are limited to 50,000 records.<br>default: <code>50000</code></td>
    </tr><tr>
      <td>samlAuthContext</td>
      <td>SAML_AUTH_CONTEXT</td>
      <td>SAML authentication context URL</td>
    </tr><tr>
      <td>samlCallbackUrl</td>
      <td>SAML_CALLBACK_URL</td>
      <td>SAML callback URL</td>
    </tr><tr>
      <td>samlCert</td>
      <td>SAML_CERT</td>
      <td>SAML certificate in Base64</td>
    </tr><tr>
      <td>samlEntryPoint</td>
      <td>SAML_ENTRY_POINT</td>
      <td>SAML Entry point URL</td>
    </tr><tr>
      <td>samlIssuer</td>
      <td>SAML_ISSUER</td>
      <td>SAML Issuer</td>
    </tr><tr>
      <td>sessionMinutes</td>
      <td>SQLPAD_SESSION_MINUTES</td>
      <td>Minutes to keep a session active. Will extended by this amount each request.<br>default: <code>60</code></td>
    </tr><tr>
      <td>slackWebhook</td>
      <td>SQLPAD_SLACK_WEBHOOK</td>
      <td>Supply incoming Slack webhook URL to post query when saved.</td>
    </tr><tr>
      <td>smtpFrom</td>
      <td>SQLPAD_SMTP_FROM</td>
      <td>From email address for SMTP. Required in order to send invitation emails.</td>
    </tr><tr>
      <td>smtpHost</td>
      <td>SQLPAD_SMTP_HOST</td>
      <td>Host address for SMTP. Required in order to send invitation emails.</td>
    </tr><tr>
      <td>smtpPassword</td>
      <td>SQLPAD_SMTP_PASSWORD</td>
      <td>Password for SMTP.</td>
    </tr><tr>
      <td>smtpPort</td>
      <td>SQLPAD_SMTP_PORT</td>
      <td>Port for SMTP. Required in order to send invitation emails.</td>
    </tr><tr>
      <td>smtpSecure</td>
      <td>SQLPAD_SMTP_SECURE</td>
      <td>Toggle to use secure connection when using SMTP.<br>default: <code>true</code></td>
    </tr><tr>
      <td>smtpUser</td>
      <td>SQLPAD_SMTP_USER</td>
      <td>Username for SMTP. Required in order to send invitation emails.</td>
    </tr><tr>
      <td>systemdSocket</td>
      <td>SQLPAD_SYSTEMD_SOCKET</td>
      <td>Acquire socket from systemd if available</td>
    </tr><tr>
      <td>tableChartLinksRequireAuth</td>
      <td>SQLPAD_TABLE_CHART_LINKS_REQUIRE_AUTH</td>
      <td>When false, table and chart result links will be operational without login.<br>default: <code>true</code></td>
    </tr><tr>
      <td>whitelistedDomains</td>
      <td>WHITELISTED_DOMAINS</td>
      <td>Allows pre-approval of email domains. Delimit multiple domains by empty space.</td>
    </tr>
  </tbody>
</table>
