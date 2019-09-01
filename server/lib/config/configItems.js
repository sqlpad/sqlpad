const configItems = [
  {
    key: 'config',
    envVar: 'SQLPAD_CONFIG',
    default: '',
    description: 'JSON/INI file to read for config'
  },
  {
    key: 'cookieSecret',
    envVar: 'SQLPAD_COOKIE_SECRET',
    default: 'secret-used-to-sign-cookies-please-set-and-make-strong',
    description: 'Secret used to sign cookies'
  },
  {
    key: 'sessionMinutes',
    envVar: 'SQLPAD_SESSION_MINUTES',
    default: 60,
    description:
      'Minutes to keep a session active. Will extended by this amount each request.'
  },
  {
    key: 'ip',
    envVar: 'SQLPAD_IP',
    default: '0.0.0.0',
    description:
      'IP address to bind to. By default SQLPad will listen from all available addresses (0.0.0.0).'
  },
  {
    key: 'port',
    envVar: 'SQLPAD_PORT',
    default: 80,
    description: 'Port for SQLPad to listen on.'
  },
  {
    key: 'systemdSocket',
    envVar: 'SQLPAD_SYSTEMD_SOCKET',
    default: false,
    description: 'Acquire socket from systemd if available'
  },
  {
    key: 'httpsPort',
    envVar: 'SQLPAD_HTTPS_PORT',
    default: 443,
    description: 'Port for SQLPad to listen on.'
  },
  {
    key: 'dbPath',
    envVar: 'SQLPAD_DB_PATH',
    default: '',
    description:
      'Directory to store SQLPad embedded database content. This includes queries, users, query result cache files, etc.'
  },
  {
    key: 'baseUrl',
    envVar: 'SQLPAD_BASE_URL',
    default: '',
    description:
      "Path to mount sqlpad app following domain. Example, if '/sqlpad' is provided queries page would be mydomain.com/sqlpad/queries"
  },
  {
    key: 'passphrase',
    envVar: 'SQLPAD_PASSPHRASE',
    default: "At least the sensitive bits won't be plain text?",
    description:
      'A string of text used to encrypt sensitive values when stored on disk.'
  },
  {
    key: 'certPassphrase',
    envVar: 'CERT_PASSPHRASE',
    default: '',
    description: 'Passphrase for your SSL certification file'
  },
  {
    key: 'keyPath',
    envVar: 'KEY_PATH',
    default: '',
    description: 'Absolute path to where SSL certificate key is stored'
  },
  {
    key: 'certPath',
    envVar: 'CERT_PATH',
    default: '',
    description: 'Absolute path to where SSL certificate is stored'
  },
  {
    key: 'admin',
    envVar: 'SQLPAD_ADMIN',
    default: '',
    description: 'Email address to whitelist/give admin permissions to'
  },
  {
    key: 'debug',
    envVar: 'SQLPAD_DEBUG',
    default: false,
    description: 'Add a variety of logging to console while running SQLPad'
  },
  {
    key: 'googleClientId',
    envVar: 'GOOGLE_CLIENT_ID',
    description:
      "Google Client ID used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'",
    default: ''
  },
  {
    key: 'googleClientSecret',
    envVar: 'GOOGLE_CLIENT_SECRET',
    description:
      "Google Client Secret used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'",
    default: ''
  },
  {
    key: 'publicUrl',
    envVar: 'PUBLIC_URL',
    description:
      'Public URL used for OAuth setup and email links. Protocol expected. Example: https://mysqlpad.com',
    default: ''
  },
  {
    key: 'disableUserpassAuth',
    envVar: 'DISABLE_USERPASS_AUTH',
    description:
      'Set to TRUE to disable built-in user authentication. Use to restrict auth to OAuth only.',
    default: false
  },
  {
    key: 'allowCsvDownload',
    envVar: 'SQLPAD_ALLOW_CSV_DOWNLOAD',
    description: 'Enable csv and xlsx downloads.',
    options: [true, false],
    default: true
  },
  {
    key: 'editorWordWrap',
    envVar: 'SQLPAD_EDITOR_WORD_WRAP',
    description: 'Enable word wrapping in SQL editor.',
    options: [true, false],
    default: false
  },
  {
    key: 'queryResultMaxRows',
    envVar: 'SQLPAD_QUERY_RESULT_MAX_ROWS',
    description: 'By default query results are limited to 50,000 records.',
    default: 50000
  },
  {
    key: 'slackWebhook',
    envVar: 'SQLPAD_SLACK_WEBHOOK',
    description: 'Supply incoming Slack webhook URL to post query when saved.',
    default: ''
  },
  {
    key: 'tableChartLinksRequireAuth',
    envVar: 'SQLPAD_TABLE_CHART_LINKS_REQUIRE_AUTH',
    description:
      'When false, table and chart result links will be operational without login.',
    options: [true, false],
    default: true
  },
  {
    key: 'smtpFrom',
    envVar: 'SQLPAD_SMTP_FROM',
    description:
      'From email address for SMTP. Required in order to send invitation emails.',
    default: ''
  },
  {
    key: 'smtpHost',
    envVar: 'SQLPAD_SMTP_HOST',
    description:
      'Host address for SMTP. Required in order to send invitation emails.',
    default: ''
  },
  {
    key: 'smtpPort',
    envVar: 'SQLPAD_SMTP_PORT',
    description: 'Port for SMTP. Required in order to send invitation emails.',
    default: ''
  },
  {
    key: 'smtpSecure',
    envVar: 'SQLPAD_SMTP_SECURE',
    options: [true, false],
    description: 'Toggle to use secure connection when using SMTP.',
    default: true
  },
  {
    key: 'smtpUser',
    envVar: 'SQLPAD_SMTP_USER',
    description:
      'Username for SMTP. Required in order to send invitation emails.',
    default: ''
  },
  {
    key: 'smtpPassword',
    envVar: 'SQLPAD_SMTP_PASSWORD',
    description: 'Password for SMTP.',
    default: ''
  },
  {
    key: 'whitelistedDomains',
    envVar: 'WHITELISTED_DOMAINS',
    description:
      'Allows pre-approval of email domains. Delimit multiple domains by empty space.',
    default: ''
  },
  {
    key: 'disableUpdateCheck',
    envVar: 'SQLPAD_DISABLE_UPDATE_CHECK',
    options: [true, false],
    description:
      'If disabled, SQLPad will no longer poll npmjs.com to see if an update is available.',
    default: false
  },
  {
    key: 'samlEntryPoint',
    envVar: 'SAML_ENTRY_POINT',
    description: 'SAML Entry point URL',
    default: ''
  },
  {
    key: 'samlIssuer',
    envVar: 'SAML_ISSUER',
    description: 'SAML Issuer',
    default: ''
  },
  {
    key: 'samlCallbackUrl',
    envVar: 'SAML_CALLBACK_URL',
    description: 'SAML callback URL',
    default: ''
  },
  {
    key: 'samlCert',
    envVar: 'SAML_CERT',
    description: 'SAML certificate in Base64',
    default: ''
  },
  {
    key: 'samlAuthContext',
    envVar: 'SAML_AUTH_CONTEXT',
    description: 'SAML authentication context URL',
    default: ''
  }
];

module.exports = configItems;
