# Authentication

## Local Authentication

By default, SQLPad supports local authentication with email and password. Passwords are stored in SQLPad's embedded database using bcrypt hashing.

To create an initial user, set `SQLPAD_ADMIN` to the email address of the initial admin user. Once SQLPad is running, you may create an initial admin account by navigating to [http://localhost/signup](http://localhost/signup).

Instead of using the sign up form, a password may be set by setting `SQLPAD_ADMIN_PASSWORD` environment variable.

These environment variables may also be used in the future to reinstate admin access or set the admin password if the password is lost.

All other local auth users must be added by an admin within the users page. Other users may also be given admin rights, allowing them to add/edit database connections and add/modify/remove SQLPad users.

Local authentication can be disabled by setting `SQLPAD_USERPASS_AUTH_DISABLED=true`.

```bash
# Email address to give admin permissions to.
SQLPAD_ADMIN = ""

# Password to set for admin email address on application start. Requires SQLPAD_ADMIN setting to also be provided.
SQLPAD_ADMIN_PASSWORD = ""

# Set to `true` to disable built-in local email/password authentication.
# Useful when using other auths like OAuth or SAML.
SQLPAD_USERPASS_AUTH_DISABLED = "false"
```

## No Authentication

?> Available as of `4.2.0`

SQLPad can be configured to run without any authentication at all. This can be enabled by setting `SQLPAD_AUTH_DISABLED` to `true`.

If enabled, `SQLPAD_AUTH_DISABLED_DEFAULT_ROLE` is used to assign admin or editor role to users. Set to `editor` if you want to restrict SQLPad to connections defined via configuration.

```bash
# Set to `true` to disable authentication altogether.
SQLPAD_AUTH_DISABLED = "false"
# Specifies the role associated with users when SQLPAD_AUTH_DISABLED is set to true.
# Acceptable values: `admin`, `editor`.
SQLPAD_AUTH_DISABLED_DEFAULT_ROLE = "editor"
```

## Auth Proxy

?> Available as of `4.2.0`

!> When using this feature be sure to restrict access to SQLPad by listening to a restricted IP using `SQLPAD_IP` configuration or other method

An HTTP reverse proxy may be used to handle authentication as of SQLPad `4.2.0` or later.

In this setup a proxy handles authentication, passing headers to SQLPad that map to SQLPad user fields. Headers are mapped to user fields, using a space-delimited string using a `<fieldName>:<HEADER-NAME>` syntax.

At a minimum, a user's `email` must be provided in the header mapping (assuming a default role is provided by `SQLPAD_AUTH_PROXY_DEFAULT_ROLE`). Role may otherwise be provided via a header mapping.

SQLPad users do not need to be added ahead of time, and may be created on the fly using `SQLPAD_AUTH_PROXY_AUTO_SIGN_UP`. Whenever a new user is detected (unable to match to existing user on either id or email), a user record will be added to SQLPad's user table and a user signed in. By default users are not auto-created and must otherwise be added ahead of time.

In addition to specifying core SQLPad user fields, custom user data fields may be populated using the field mapping `data.<customFieldName>`. This allows storing custom values to a specific user that may be referenced dynamically in connection configuration using mustache template syntax `{{user.data.<customFieldName>}}`. For example, you may map a user's a database username to `data.dbuser:X-WEBAUTH-DBUSER`, then later reference that value dynamically in a connection configuration by setting username to `{{user.data.dbuser}}`.

User fields available to map are:

- `id` - used to identify users (optional - random value generated for SQLPad user.\_id if not provided)
- `email` - natural identifier for users (required)
- `role` - role for user (optional if `SQLPAD_AUTH_PROXY_DEFAULT_ROLE` defined, otherwise required mapping)
- `name` - name for user (optional)
- `data.<customFieldName>` - custom data field(s) for dynamic connection configuration (optional)

Auth proxy settings are as follows:

```bash
# Enable auth proxy authentication support
SQLPAD_AUTH_PROXY_ENABLED = false

# Auto create a user record if it does not exist when new user is detected via auth proxy
SQLPAD_AUTH_PROXY_AUTO_SIGN_UP = false

# Default role to assign user created when `authProxyAutoSignUp` is turned on.
# By default this is an empty-string and not used, expecting a role to be provided via header-mapping.
SQLPAD_AUTH_PROXY_DEFAULT_ROLE = editor

# Space-delimited HTTP header mappings to use to derive user information.
# Convention is <user-field-to-map-to>:<header-name-to-use-for-value>.
#
# A mapping to `email` is required at a minimum assuming `authProxyDefaultRole` is set.
# Otherwise `role`, `id`, `name` and `data.<customField>` fields may be set.
#
# When supplying both `id` and `email`, `id` will be used for user matching instead of `email`,
# updating SQLPad user `email` fields when they change (assuming `id` is not changing).
#
# Example value: "id:X-WEBAUTH-ID email:X-WEBAUTH-EMAIL name:X-WEBAUTH-NAME role:X-WEBAUTH-ROLE data.customField:X-WEBAUTH-CUSTOM-FIELD"
SQLPAD_AUTH_PROXY_HEADERS = ""
```

## Google OAuth

Google OAuth authentication can be enabled by setting the necessary environment variables and configuring your Google API config appropriately.

For OAuth to work be sure to enable the Google+ API for your Google API project. If this isn't enabled it might be why the user profile isn't being fetched.

Next you'll need to set your JavaScript origins and redirect URIs. If you're testing locally, that might look like the below. Remember to consider the base url/mounting path if SQLPad is not running at the root of the domain.

- `Authorized JavaScript origins`: `http://localhost:8080`
- `Authorized redirect URIs`: `http://localhost:8080/auth/google/callback`

Once the Google API config is set, configure the required settings in SQLPad.
For OAuth to be useful this usually involves the following:

```bash
# Google Client ID used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'
SQLPAD_GOOGLE_CLIENT_ID = ""

# Google Client Secret used for OAuth setup. Authorized redirect URI for sqlpad is '[baseurl]/auth/google/callback'
SQLPAD_GOOGLE_CLIENT_SECRET = ""

# Public URL required
PUBLIC_URL = "http://localhost"

# Optional. Disables local email/password login
SQLPAD_USERPASS_AUTH_DISABLED = true
```

## OpenID Connect

OpenID Connect authentication can be enabled by setting the following required environment variables:

```bash
# localhost used in dev
PUBLIC_URL = "http://localhost:3010"

# HTML code for the sign-in link used for starting Open ID authentication.
SQLPAD_OIDC_LINK_HTML = "Sign in with OpenID"

SQLPAD_OIDC_CLIENT_ID = "actual-client-id"
SQLPAD_OIDC_CLIENT_SECRET = "actual-client-secret"
# Issuer endpoint (will vary by provider)
# As of version 6.4.0 the issuer endpoint is the only URL needed
# as long as the OIDC provider supplies .well-known endpoints
SQLPAD_OIDC_ISSUER = "https://some.openidprovider.com/oauth2/default"

# If .well-known is not supported, the additional 3 endpoints must be supplied
# Supplying these endpoints is not recommended,
# as it uses an older openid implementation which may not be compatible with your auth provider.
SQLPAD_OIDC_AUTHORIZATION_URL = "https://some.openidprovider.com/oauth2/default/v1/authorize"
SQLPAD_OIDC_TOKEN_URL = "https://some.openidprovider.com/oauth2/default/v1/token"
SQLPAD_OIDC_USER_INFO_URL = "https://some.openidprovider.okta.com/oauth2/default/v1/userinfo"
```

The callback redirect URI used by SQLPad is `<baseurl>/auth/oidc/callback`.

For the above configuration, assuming `SQLPAD_BASE_URL = "/sqlpad"`, the callback URI configured with the provider should be `http://localhost:3010/sqlpad/auth/oidc/callback`.

The contents of the OpenID sign in button can be customized with the following

```bash
SQLPAD_OIDC_LINK_HTML = "text or inner html here"
```

Prior to authenticating via OpenID, users must still be added to SQLPad with their email address used to log in.

This can be bypassed by using allowed domains to auto-add users for emails belonging to certain domains.

```bash
# space delimited list of domains to allow
SQLPAD_ALLOWED_DOMAINS = "mycompany.com"
```

## SAML

SAML-based authentication can be enabled by setting the necessary environment variables:

```bash
# SAML authentication context URL.
# A sensible value is: `urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport`
SQLPAD_SAML_AUTH_CONTEXT = ""

# SAML callback URL.
# It will generally be constructed from the deployment's internet address and the fixed route.
# For example: `https://mysqlpad.com/login/callback`.
SQLPAD_SAML_CALLBACK_URL = ""

# SAML certificate in Base64
SQLPAD_SAML_CERT = ""

# Entry point url
SQLPAD_SAML_ENTRY_POINT = ""

SQLPAD_SAML_ISSUER = ""

# HTML code for the sign-in link used for starting SAML authentication.
SQLPAD_SAML_LINK_HTML = "Sign in with SSO"

# Auto create a user record if it does not exist when new user is detected via SAML.
SQLPAD_SAML_AUTO_SIGN_UP = "false"

# Default role to assign user created when SQLPAD_SAML_AUTO_SIGN_UP is turned on.
# Accepted values are `editor` and `admin`.
SQLPAD_SAML_DEFAULT_ROLE = "editor"

# Public URL required
PUBLIC_URL = "http://localhost"

# Optional. Disables local email/password login
SQLPAD_USERPASS_AUTH_DISABLED = true
```

SQLPad users do not need to be added ahead of time, and may be created on the fly using `SQLPAD_SAML_AUTO_SIGN_UP`. Whenever a new user is detected (unable to match to existing user email), a user record will be added to SQLPad's user table and a user signed in. By default users are not auto-created and must otherwise be added ahead of time.

## LDAP

?> Available as of 5.8.0

LDAP-based authentication can be enabled by setting the necessary environment variables:

```bash
# Set to "true" to enable LDAP authentication
SQLPAD_LDAP_AUTH_ENABLED = "false"

# LDAP URL that supports protocols: `ldap://` and `ldaps://`
# Examples: `ldap://localhost:389`, `ldaps://ad.corporate.com:636`
SQLPAD_LDAP_URL = ""

# Base LDAP DN to search for users in, eg: `dc=domain,dc=com`.
SQLPAD_LDAP_SEARCH_BASE = ""

# Username for LDAP lookup
# The bind user will be used to lookup information about other LDAP users.
SQLPAD_LDAP_BIND_DN = ""

# Password for LDAP user used for LDAP lookup
SQLPAD_LDAP_PASSWORD = ""

# LDAP search filter, e.g. `(uid={{username}})` in OpenLDAP or `(sAMAccountName={{username}})` in ActiveDirectory. Use literal {{username}} to have the given username used in the search.
SQLPAD_LDAP_SEARCH_FILTER = ""

# Disable local auth if preferred
SQLPAD_USERPASS_AUTH_DISABLED = false

# Auto sign up LDAP users
SQLPAD_LDAP_AUTO_SIGN_UP = true

# LDAP filter used to determine if a user should be assigned SQLPad admin role
SQLPAD_LDAP_ROLE_ADMIN_FILTER = ""

# LDAP filter used to determine if a user should be assigned SQLPad editor role
SQLPAD_LDAP_ROLE_EDITOR_FILTER = ""

# Default role for users that do not match LDAP role filters. May be either `admin`, `editor`, `denied`, or empty.
# If `denied` or empty, a user _must_ match an LDAP role filter to be admitted into SQLPad, unless they are previously created as a SQLPad user in advanced.
SQLPAD_LDAP_DEFAULT_ROLE = ""
```

### Role-based LDAP

To assign roles via LDAP-RBAC, you may specify additional LDAP user filters to ensure the user fits a particular role or group.

Roles assigned via LDAP will sync on every login if user was created by auto sign up. This can be changed per-user in user add/edit UI forms.

For example, if your LDAP implementation supports `memberOf`, you may decide to use group DN values. In this case two groups are needed, one for editors and one for admins.

```bash
SQLPAD_LDAP_SEARCH_FILTER = "(&(|(memberOf=cn=sqlpad-editors,dc=example,dc=com)(memberOf=cn=sqlpad-admins,dc=example,dc=com))(uid={{username}}))"
SQLPAD_LDAP_ROLE_ADMIN_FILTER = "(memberOf=cn=sqlpad-admins,dc=example,dc=com)"
SQLPAD_LDAP_ROLE_EDITOR_FILTER = "(memberOf=cn=sqlpad-editors,dc=example,dc=com)"
```

The role filters will be combined with the `uid`/`sAMAccountName` filter depending on the profile returned. For example, the `SQLPAD_LDAP_ROLE_ADMIN_FILTER` above would become `(&(memberOf=cn=sqlpad-admins,dc=example,dc=com)(uid=username))` for OpenLDAP or `(&(memberOf=cn=sqlpad-admins,dc=example,dc=com)(sAMAccountName=username))` for ActiveDirectory.

The above example could be simplified to the following, as users that do not match a role filter will not be allowed in unless `SQLPAD_LDAP_DEFAULT_ROLE` is also set:

```bash
# Initial search filter authenticates anyone found in LDAP
SQLPAD_LDAP_SEARCH_FILTER = "(uid={{username}})"

# User must then match one of these filters
SQLPAD_LDAP_ROLE_ADMIN_FILTER = "(memberOf=cn=sqlpad-admins,dc=example,dc=com)"
SQLPAD_LDAP_ROLE_EDITOR_FILTER = "(memberOf=cn=sqlpad-editors,dc=example,dc=com)"

# If a match is not found by role filter, default role will be used if set.
# If not set, or set to "denied", the user will not be allowed in unless previously added manually in SQLPad UI
SQLPAD_LDAP_DEFAULT_ROLE = "denied"
```

LDAP-based authentication can be enabled and used with local authencation together. When both LDAP and local authentication are enabled, LDAP users can sign in using their LDAP username (not an email address) and password, while local users may sign in using their email address and local password.

## Allowed Domains for User Administration

An entire domain can be allowed for username administration by setting environment variable `SQLPAD_ALLOWED_DOMAINS`. This may be particularly useful in combination with OAuth.

## Service Token

The REST API may be called using generated service tokens scoped by role and some optional amount of time.

To enable the creation of service tokens, a token secret must be supplied via `SQLPAD_SERVICE_TOKEN_SECRET`.

To generate a service token, log into SQLPad as an `admin` user and click `Service Tokens`. A service token can be scoped to a certain role (admin or editor) and limited to a window of time.

The generated Bearer token may be used by passing it via the Authorization header:

```bash
curl -X GET -H 'Accept: application/json' -H "Authorization: Bearer the.generated.token" http://localhost:3010/sqlpad/api/users
```

For more information on APIs available see [API Overview](/api-overview).
