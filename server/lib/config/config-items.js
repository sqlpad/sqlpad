const configItems = [
  {
    key: 'allowedDomains',
    envVar: 'SQLPAD_ALLOWED_DOMAINS',
    default: '',
  },
  {
    key: 'config',
    envVar: 'SQLPAD_CONFIG',
    default: '',
  },
  {
    key: 'migrate',
    envVar: 'SQLPAD_MIGRATE',
    default: '',
  },
  {
    key: 'cookieName',
    envVar: 'SQLPAD_COOKIE_NAME',
    default: 'sqlpad.sid',
  },
  {
    key: 'cookieSecret',
    envVar: 'SQLPAD_COOKIE_SECRET',
    default: 'secret-used-to-sign-cookies-please-set-and-make-strong',
  },
  {
    key: 'cookieSecure',
    envVar: 'SQLPAD_COOKIE_SECURE',
    default: false,
  },
  {
    key: 'sessionMinutes',
    envVar: 'SQLPAD_SESSION_MINUTES',
    default: 60,
  },
  {
    key: 'sessionCookieSameSite',
    envVar: 'SQLPAD_SESSION_COOKIE_SAME_SITE',
    default: 'strict',
  },
  {
    key: 'sessionStore',
    envVar: 'SQLPAD_SESSION_STORE',
    default: 'file', // database, redis, memory
  },
  {
    key: 'timeoutSeconds',
    envVar: 'SQLPAD_TIMEOUT_SECONDS',
    default: 300,
  },
  {
    key: 'bodyLimit',
    envVar: 'SQLPAD_BODY_LIMIT',
    default: '1mb',
  },
  {
    key: 'ip',
    envVar: 'SQLPAD_IP',
    default: '0.0.0.0',
  },
  {
    key: 'port',
    envVar: 'SQLPAD_PORT',
    default: 80,
  },
  {
    key: 'systemdSocket',
    envVar: 'SQLPAD_SYSTEMD_SOCKET',
    default: false,
  },
  {
    key: 'dbPath',
    envVar: 'SQLPAD_DB_PATH',
    default: '',
  },
  {
    key: 'dbAutomigrate',
    envVar: 'SQLPAD_DB_AUTOMIGRATE',
    default: true,
  },
  {
    key: 'baseUrl',
    envVar: 'SQLPAD_BASE_URL',
    default: '',
  },
  {
    key: 'passphrase',
    envVar: 'SQLPAD_PASSPHRASE',
    default: "At least the sensitive bits won't be plain text?",
  },
  {
    key: 'certPassphrase',
    envVar: 'SQLPAD_HTTPS_CERT_PASSPHRASE',
    default: '',
  },
  {
    key: 'keyPath',
    envVar: 'SQLPAD_HTTPS_KEY_PATH',
    default: '',
  },
  {
    key: 'certPath',
    envVar: 'SQLPAD_HTTPS_CERT_PATH',
    default: '',
  },
  {
    key: 'admin',
    envVar: 'SQLPAD_ADMIN',
    default: '',
  },
  {
    key: 'adminPassword',
    envVar: 'SQLPAD_ADMIN_PASSWORD',
    default: '',
  },
  {
    key: 'defaultConnectionId',
    envVar: 'SQLPAD_DEFAULT_CONNECTION_ID',
    default: '',
  },
  {
    key: 'googleClientId',
    envVar: 'SQLPAD_GOOGLE_CLIENT_ID',
    default: '',
  },
  {
    key: 'googleClientSecret',
    envVar: 'SQLPAD_GOOGLE_CLIENT_SECRET',
    default: '',
  },
  {
    key: 'googleDefaultRole',
    envVar: 'SQLPAD_GOOGLE_DEFAULT_ROLE',
    default: 'editor',
  },
  {
    key: 'publicUrl',
    envVar: 'PUBLIC_URL',
    default: '',
  },
  {
    key: 'userpassAuthDisabled',
    envVar: 'SQLPAD_USERPASS_AUTH_DISABLED',
    default: false,
  },
  {
    key: 'ldapAuthEnabled',
    envVar: 'SQLPAD_LDAP_AUTH_ENABLED',
    default: false,
  },
  {
    key: 'ldapUrl',
    envVar: 'SQLPAD_LDAP_URL',
    default: '',
  },
  {
    key: 'ldapSearchBase',
    envVar: 'SQLPAD_LDAP_SEARCH_BASE',
    default: '',
  },
  {
    key: 'ldapBindDN',
    envVar: 'SQLPAD_LDAP_BIND_DN',
    default: '',
  },
  {
    key: 'ldapPassword',
    envVar: 'SQLPAD_LDAP_PASSWORD',
    default: '',
  },
  {
    key: 'ldapSearchFilter',
    envVar: 'SQLPAD_LDAP_SEARCH_FILTER',
    default: '',
  },
  {
    key: 'ldapAutoSignUp',
    envVar: 'SQLPAD_LDAP_AUTO_SIGN_UP',
    default: '',
  },
  {
    key: 'ldapDefaultRole',
    envVar: 'SQLPAD_LDAP_DEFAULT_ROLE',
    default: '',
  },
  {
    key: 'ldapRoleAdminFilter',
    envVar: 'SQLPAD_LDAP_ROLE_ADMIN_FILTER',
    default: '',
  },
  {
    key: 'ldapRoleEditorFilter',
    envVar: 'SQLPAD_LDAP_ROLE_EDITOR_FILTER',
    default: '',
  },
  {
    key: 'serviceTokenSecret',
    envVar: 'SQLPAD_SERVICE_TOKEN_SECRET',
    default: '',
  },
  {
    key: `authDisabled`,
    envVar: 'SQLPAD_AUTH_DISABLED',
    default: false,
  },
  {
    key: 'authDisabledDefaultRole',
    envVar: 'SQLPAD_AUTH_DISABLED_DEFAULT_ROLE',
    default: 'editor',
  },
  {
    key: 'allowCsvDownload',
    envVar: 'SQLPAD_ALLOW_CSV_DOWNLOAD',
    default: true,
  },
  {
    key: 'editorWordWrap',
    envVar: 'SQLPAD_EDITOR_WORD_WRAP',
    default: false,
  },
  {
    key: 'queryResultMaxRows',
    envVar: 'SQLPAD_QUERY_RESULT_MAX_ROWS',
    default: 10000,
  },
  {
    key: 'queryResultStore',
    envVar: 'SQLPAD_QUERY_RESULT_STORE',
    default: 'file', // allowed values file, memory, database
  },
  {
    key: 'samlEntryPoint',
    envVar: 'SQLPAD_SAML_ENTRY_POINT',
    default: '',
  },
  {
    key: 'samlIssuer',
    envVar: 'SQLPAD_SAML_ISSUER',
    default: '',
  },
  {
    key: 'samlCallbackUrl',
    envVar: 'SQLPAD_SAML_CALLBACK_URL',
    default: '',
  },
  {
    key: 'samlCert',
    envVar: 'SQLPAD_SAML_CERT',
    default: '',
  },
  {
    key: 'samlAuthContext',
    envVar: 'SQLPAD_SAML_AUTH_CONTEXT',
    default: '',
  },
  {
    key: 'samlLinkHtml',
    envVar: 'SQLPAD_SAML_LINK_HTML',
    default: 'Sign in with SSO',
  },
  {
    key: 'samlAutoSignUp',
    envVar: 'SQLPAD_SAML_AUTO_SIGN_UP',
    default: false,
  },
  {
    key: 'samlDefaultRole',
    envVar: 'SQLPAD_SAML_DEFAULT_ROLE',
    default: 'editor',
  },
  {
    key: 'samlAdminGroup',
    envVar: 'SQLPAD_SAML_ADMIN_GROUP',
    default: '',
  },
  {
    key: 'samlEnforcedRole',
    envVar: 'SQLPAD_SAML_ENFORCED_ROLE',
    default: false,
  },
  {
    key: 'allowConnectionAccessToEveryone',
    envVar: 'SQLPAD_ALLOW_CONNECTION_ACCESS_TO_EVERYONE',
    default: true,
  },
  {
    key: 'queryHistoryRetentionTimeInDays',
    envVar: 'SQLPAD_QUERY_HISTORY_RETENTION_TIME_IN_DAYS',
    default: 30,
  },
  {
    key: 'queryHistoryResultMaxRows',
    envVar: 'SQLPAD_QUERY_HISTORY_RESULT_MAX_ROWS',
    default: 1000,
  },
  {
    key: 'appLogLevel',
    envVar: 'SQLPAD_APP_LOG_LEVEL',
    default: 'info',
  },
  {
    key: 'webLogLevel',
    envVar: 'SQLPAD_WEB_LOG_LEVEL',
    default: 'info',
  },
  {
    key: 'dbInMemory',
    envVar: 'SQLPAD_DB_IN_MEMORY',
    default: false,
  },
  {
    key: 'backendDatabaseUri',
    envVar: 'SQLPAD_BACKEND_DB_URI',
    default: '',
  },
  {
    key: 'redisUri',
    envVar: 'SQLPAD_REDIS_URI',
    default: '',
  },
  {
    key: 'seedDataPath',
    envVar: 'SQLPAD_SEED_DATA_PATH',
    default: '',
  },
  // https://expressjs.com/en/guide/behind-proxies.html
  {
    key: 'trustProxy',
    envVar: 'SQLPAD_TRUST_PROXY',
    default: false,
  },
  {
    key: 'authProxyEnabled',
    envVar: 'SQLPAD_AUTH_PROXY_ENABLED',
    default: false,
  },
  {
    key: 'authProxyAutoSignUp',
    envVar: 'SQLPAD_AUTH_PROXY_AUTO_SIGN_UP',
    default: false,
  },
  {
    key: 'authProxyDefaultRole',
    envVar: 'SQLPAD_AUTH_PROXY_DEFAULT_ROLE',
    default: '',
  },
  // Define headers to map to user attributes, space delimited
  // At a minimum, email or id must be mapped, as they will be used as a user identifier
  // Other attributes may be mapped as well, including data attributes via data.somePropertyName
  // Example `id:X-WEBAUTH-ID email:X-WEBAUTH-EMAIL name:X-WEBAUTH-NAME role:X-WEBAUTH-ROLE data.field:X-WEBAUTH-field`
  {
    key: 'authProxyHeaders',
    envVar: 'SQLPAD_AUTH_PROXY_HEADERS',
    default: '',
  },
  {
    key: 'oidcClientId',
    envVar: 'SQLPAD_OIDC_CLIENT_ID',
    default: '',
  },
  {
    key: 'oidcClientSecret',
    envVar: 'SQLPAD_OIDC_CLIENT_SECRET',
    default: '',
  },
  {
    key: 'oidcIssuer',
    envVar: 'SQLPAD_OIDC_ISSUER',
    default: '',
  },
  {
    key: 'oidcAuthorizationUrl',
    envVar: 'SQLPAD_OIDC_AUTHORIZATION_URL',
    default: '',
  },
  {
    key: 'oidcTokenUrl',
    envVar: 'SQLPAD_OIDC_TOKEN_URL',
    default: '',
  },
  {
    key: 'oidcUserInfoUrl',
    envVar: 'SQLPAD_OIDC_USER_INFO_URL',
    default: '',
  },
  {
    key: 'oidcLinkHtml',
    envVar: 'SQLPAD_OIDC_LINK_HTML',
    default: 'Sign in with OpenID',
  },
  {
    key: 'oidcScope',
    envVar: 'SQLPAD_OIDC_SCOPE',
    default: 'openid profile email roles',
  },
  {
    key: 'webhookEnabled',
    envVar: 'SQLPAD_WEBHOOK_ENABLED',
    default: false,
  },
  {
    key: 'webhookSecret',
    envVar: 'SQLPAD_WEBHOOK_SECRET',
    default: '',
  },
  {
    key: 'webhookUserCreatedUrl',
    envVar: 'SQLPAD_WEBHOOK_USER_CREATED_URL',
    default: '',
  },
  {
    key: 'webhookQueryCreatedUrl',
    envVar: 'SQLPAD_WEBHOOK_QUERY_CREATED_URL',
    default: '',
  },
  {
    key: 'webhookBatchCreatedUrl',
    envVar: 'SQLPAD_WEBHOOK_BATCH_CREATED_URL',
    default: '',
  },
  {
    key: 'webhookBatchFinishedUrl',
    envVar: 'SQLPAD_WEBHOOK_BATCH_FINISHED_URL',
    default: '',
  },
  {
    key: 'webhookStatementCreatedUrl',
    envVar: 'SQLPAD_WEBHOOK_STATEMENT_CREATED_URL',
    default: '',
  },
  {
    key: 'webhookStatementFinishedUrl',
    envVar: 'SQLPAD_WEBHOOK_STATEMENT_FINISHED_URL',
    default: '',
  },
  {
    key: 'webhookSignoutUrl',
    envVar: 'SQLPAD_WEBHOOK_SIGNOUT_URL',
    default: '',
  },  
  {
    key: 'deprecatedTestConfig',
    envVar: 'SQLPAD_DEPRECATED_TEST_CONFIG',
    default: '',
    deprecated: 'Deprecated config identified with this key and message',
  },
];

module.exports = configItems;
