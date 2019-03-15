// NOTE: uiDepencency=true items will be sent to client for front end config use
// Nothing else sent unless using configuration page/api
// This is to reduce leaking unnecessary information

// NOTE: sensitve=true items will be masked with *** in configuration page

const configItems = [
  {
    interface: 'env',
    key: 'ip',
    cliFlag: 'ip',
    envVar: 'SQLPAD_IP',
    default: '0.0.0.0',
    description:
      'IP address to bind to. By default SQLPad will listen from all available addresses (0.0.0.0).'
  },
  {
    interface: 'env',
    key: 'port',
    cliFlag: 'port',
    envVar: 'SQLPAD_PORT',
    default: 80,
    description: 'Port for SQLPad to listen on.'
  },
  {
    interface: 'env',
    key: 'systemdSocket',
    cliFlag: 'systemd-socket',
    envVar: 'SQLPAD_SYSTEMD_SOCKET',
    default: false,
    description: 'Acquire socket from systemd if available'
  },
  {
    interface: 'env',
    key: 'httpsPort',
    cliFlag: 'https-port',
    envVar: 'SQLPAD_HTTPS_PORT',
    default: 443,
    description: 'Port for SQLPad to listen on.'
  },
  {
    interface: 'env',
    key: 'dbPath',
    cliFlag: ['db', 'dbPath', 'dir'],
    envVar: 'SQLPAD_DB_PATH',
    default: '$HOME/sqlpad/db',
    description:
      'Directory to store SQLPad embedded database content. This includes queries, users, query result cache files, etc.'
  },
  {
    interface: 'env',
    key: 'baseUrl',
    cliFlag: 'base-url',
    envVar: 'SQLPAD_BASE_URL',
    default: '',
    uiDependency: true,
    description:
      "Path to mount sqlpad app following domain. \nFor example, if '/sqlpad' is provided, queries page \nwould be located at mydomain.com/sqlpad/queries instead of mydomain.com/queries. \nUseful when subdomain is not an option."
  },
  {
    interface: 'env',
    key: 'passphrase',
    cliFlag: 'passphrase',
    envVar: 'SQLPAD_PASSPHRASE',
    sensitive: true,
    default: "At least the sensitive bits won't be plain text?",
    description:
      'A string of text used to encrypt sensitive values when stored on disk.'
  },
  {
    interface: 'env',
    key: 'certPassphrase',
    cliFlag: 'cert-passphrase',
    envVar: 'CERT_PASSPHRASE',
    sensitive: true,
    default: 'No cert',
    description: 'Passphrase for your SSL certification file'
  },
  {
    interface: 'env',
    key: 'keyPath',
    cliFlag: ['key', 'key-path', 'key-dir'],
    envVar: 'KEY_PATH',
    default: '',
    description: 'Absolute path to where SSL certificate key is stored'
  },
  {
    interface: 'env',
    key: 'certPath',
    cliFlag: ['cert', 'cert-path', 'cert-dir'],
    envVar: 'CERT_PATH',
    default: '',
    description: 'Absolute path to where SSL certificate is stored'
  },
  {
    interface: 'env',
    key: 'admin',
    cliFlag: 'admin',
    envVar: 'SQLPAD_ADMIN',
    default: '',
    description:
      'Email address to whitelist/give admin permissions to via command line or environment variable. Useful to preset Admin account or to reinstate admin access without access to the UI.'
  },
  {
    interface: 'env',
    key: 'debug',
    cliFlag: 'debug',
    envVar: 'SQLPAD_DEBUG',
    default: false,
    description: 'Add a variety of logging to console while running SQLPad'
  },
  {
    interface: 'env',
    key: 'googleClientId',
    envVar: 'GOOGLE_CLIENT_ID',
    sensitive: true,
    description:
      "Google Client ID used for OAuth setup. Note: authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'",
    default: ''
  },
  {
    interface: 'env',
    key: 'googleClientSecret',
    envVar: 'GOOGLE_CLIENT_SECRET',
    sensitive: true,
    description:
      "Google Client Secret used for OAuth setup. Note: authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'",
    default: ''
  },
  {
    interface: 'env',
    key: 'publicUrl',
    envVar: 'PUBLIC_URL',
    cliFlag: 'public-url',
    description:
      'Public URL used for OAuth setup and links in email communications. Protocol is expected to be provided. Example: https://mysqlpad.com',
    default: '',
    uiDependency: true
  },
  {
    interface: 'env',
    key: 'disableUserpassAuth',
    envVar: 'DISABLE_USERPASS_AUTH',
    description:
      'Set to TRUE to disable built-in user authentication. Useful to restrict authentication to OAuth only.',
    default: false
  },
  {
    interface: 'ui',
    key: 'allowCsvDownload',
    label: 'Allow CSV/XLSX Download',
    description: 'Set to false to disable csv or xlsx downloads.',
    options: [true, false],
    uiDependency: true,
    default: true
  },
  {
    interface: 'ui',
    key: 'editorWordWrap',
    label: 'Editor Word Wrap',
    description: 'Set to true to enable word wrapping in SQL editor.',
    options: [true, false],
    uiDependency: true,
    default: false
  },
  {
    interface: 'ui',
    key: 'queryResultMaxRows',
    label: 'Query Result Max Rows',
    description: 'By default query results are limited to 50,000 records.',
    default: 50000,
    uiDependency: true
  },
  {
    interface: 'ui',
    key: 'slackWebhook',
    label: 'Slack Webhook URL',
    description: 'Supply incoming Slack webhook URL to post query when saved.',
    default: ''
  },
  {
    interface: 'ui',
    key: 'showSchemaCopyButton',
    label: 'Show Schema Copy Button',
    description:
      "Enable a button to copy an object's full schema path in schema explorer. Useful for databases that require fully qualified names.",
    options: [true, false],
    default: false,
    uiDependency: true
  },
  {
    interface: 'ui',
    key: 'tableChartLinksRequireAuth',
    label: 'Require Login for Table/Chart Links',
    description:
      'If set to false, table and chart result links will be operational without having to log in. (These links only execute saved SQL queries, and do not open an endpoint to execute raw SQL.)',
    options: [true, false],
    default: true
  },
  {
    interface: 'ui',
    key: 'smtpFrom',
    envVar: 'SQLPAD_SMTP_FROM',
    cliFlag: 'smtp-from',
    label: 'SMTP From',
    description:
      'From email address for SMTP. Required in order to send invitation emails.',
    default: ''
  },
  {
    interface: 'ui',
    key: 'smtpHost',
    envVar: 'SQLPAD_SMTP_HOST',
    cliFlag: 'smtp-host',
    label: 'SMTP Host',
    description:
      'Host address for SMTP. Required in order to send invitation emails.',
    default: ''
  },
  {
    interface: 'ui',
    key: 'smtpPort',
    envVar: 'SQLPAD_SMTP_PORT',
    cliFlag: 'smtp-port',
    label: 'SMTP Port',
    description: 'Port for SMTP. Required in order to send invitation emails.',
    default: ''
  },
  {
    interface: 'ui',
    key: 'smtpSecure',
    envVar: 'SQLPAD_SMTP_SECURE',
    cliFlag: 'smtp-secure',
    label: 'SMTP Use SSL',
    options: [true, false],
    description: 'Toggle to use secure connection when using SMTP.',
    default: true
  },
  {
    interface: 'ui',
    key: 'smtpUser',
    envVar: 'SQLPAD_SMTP_USER',
    cliFlag: 'smtp-user',
    label: 'SMTP User',
    description:
      'Username for SMTP. Required in order to send invitation emails.',
    default: ''
  },
  {
    interface: 'ui',
    key: 'smtpPassword',
    envVar: 'SQLPAD_SMTP_PASSWORD',
    cliFlag: 'smtp-password',
    label: 'SMTP Password',
    description: 'Password for SMTP.',
    default: '',
    sensitive: true
  },
  {
    interface: 'ui',
    key: 'whitelistedDomains',
    label: 'Whitelisted Domains',
    envVar: 'WHITELISTED_DOMAINS',
    cliFlag: 'whitelisted-domains',
    description:
      "Allows whitelisting of email domains so individual email addresses do not need to be whitelisted. Domains must be delimited by whitespace. For example, 'baz.com foo.bar.com' will whitelist sara@baz.com and john@foo.bar.com",
    default: ''
  },
  {
    interface: 'ui',
    key: 'disableUpdateCheck',
    envVar: 'SQLPAD_DISABLE_UPDATE_CHECK',
    cliFlag: 'disable-update-check',
    label: 'Disable update check',
    options: [true, false],
    description:
      'If disabled, SQLPad will no longer poll npmjs.com to see if an update is available.',
    default: false
  }
];

module.exports = configItems;
