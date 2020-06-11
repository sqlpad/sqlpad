# Authentication

## Local Authentication

By default, SQLPad supports local authentication with email and password. Passwords are stored in SQLPad's embedded database using bcrypt hashing.

Once SQLPad is running, you may create an initial admin account by navigating to [http://localhost/signup](http://localhost/signup).

Once an initial admin account has been created, all future users must be whitelisted by an admin within the users page. Other users may also be given admin rights, allowing them to add/edit database connections and whitelist/modify/remove SQLPad users.

If for whatever reason you lose admin rights, and the last-admin-standing won't give you admin rights back, you can reinstate them to yourself by running

`sqlpad --admin yourEmailAddress@domain.com`

Local authentication can be disabled by setting `disableUserpassAuth` to `true`.

## No Authentication

?> Available as of `4.2.0`

SQLPad can be configured to run without any authentication at all. This can be enabled by setting `disableAuth` to `true`. 

If enabled, `disableAuthDefaultRole` is used to assign admin or editor role to users. You'd want to configure connections via configuration file or environment variables if `disableAuthDefaultRole` is `editor`.

## Auth Proxy

?> Available as of `4.2.0`

!> When using this feature be sure to restrict access to SQLPad by listening to a restricted IP using `ip`/`SQLPAD_IP` configuration or other method

An HTTP reverse proxy may be used to handle authentication as of SQLPad `4.2.0` or later.

In this setup a proxy handles authentication, passing headers to SQLPad that map to SQLPad user fields. Headers are mapped to user fields, using a space-delimited string using a `<fieldName>:<HEADER-NAME>` syntax.

At a minimum, a user's `email` must be provided in the header mapping (assuming a default role is provided by `authProxyDefaultRole`). Role may otherwise be provided via a header mapping.

SQLPad users do not need to be added ahead of time, and may be created on the fly using `authProxyAutoSignUp`. Whenever a new user is detected (unable to match to existing user on either id or email), a user record will be added to SQLPad's user table and a user signed in. By default users are not auto-created and must otherwise be added ahead of time.

In addition to specifying core SQLPad user fields, custom user data fields may be populated using the field mapping `data.<customFieldName>`. This allows storing custom values to a specific user that may be referenced dynamically in connection configuration using mustache template syntax `{{user.data.<customFieldName>}}`. For example, you may map a user's a database username to `data.dbuser:X-WEBAUTH-DBUSER`, then later reference that value dynamically in a connection configuration by setting username to `{{user.data.dbuser}}`.

User fields available to map are:

- `id` - used to identify users (optional - random value generated for SQLPad user.\_id if not provided)
- `email` - natural identifier for users (required)
- `role` - role for user (optional if `authProxyDefaultRole` defined, otherwise required mapping)
- `name` - name for user (optional)
- `data.<customFieldName>` - custom data field(s) for dynamic connection configuration (optional)

Auth proxy settings in INI format are as follows:

```ini
; Enable auth proxy authentication
authProxyEnabled = true
; Auto create user record if it does not exist
authProxyAutoSignUp = true
; default role to use if not provided by header
authProxyDefaultRole = editor
; header mappings space-delimited.
; convention is <user-field-to-map-to>:<header-name-to-use-for-value>
authProxyHeaders = "id:X-WEBAUTH-ID email:X-WEBAUTH-EMAIL name:X-WEBAUTH-NAME role:X-WEBAUTH-ROLE data.customField:X-WEBAUTH-CUSTOM-FIELD"
```

## Google OAuth

Google OAuth authentication can be enabled by setting the necessary environment variables and configuring your Google API config appropriately.

For OAuth to work be sure to enable the Google+ API for your Google API project. If this isn't enabled it might be why the user profile isn't being fetched.

Next you'll need to set your JavaScript origins and redirect URIs. If you're testing locally, that might look like the below. Remember to consider the base url/mounting path if SQLPad is not running at the root of the domain.

- `Authorized JavaScript origins`: `http://localhost:8080`
- `Authorized redirect URIs`: `http://localhost:8080/auth/google/callback`

Once the Google API config is set, configure the required settings in SQLPad.
For OAuth to be useful this usually involves the following:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `PUBLIC_URL`=`http://localhost`
- `DISABLE_USERPASS_AUTH`=`true` (optional - disables plain local user logins)

## SAML

SAML-based  authentication can be enabled by setting the necessary environment variables:

- `SAML_LINK_HTML`
- `SAML_AUTH_CONTEXT`
- `SAML_CALLBACK_URL`
- `SAML_CERT`
- `SAML_ENTRY_POINT`
- `SAML_ISSUER`
- `SQLPAD_SAML_AUTO_SIGN_UP`
- `SQLPAD_SAML_DEFAULT_ROLE`
- `PUBLIC_URL`
- `DISABLE_USERPASS_AUTH`=`true` (optional - disables plain local user logins)

SQLPad users do not need to be added ahead of time, and may be created on the fly using `samlAutoSignUp`. Whenever a new user is detected (unable to match to existing user email), a user record will be added to SQLPad's user table and a user signed in. By default users are not auto-created and must otherwise be added ahead of time.

## Whitelist Domains for User Administration

An entire domain can be whitelisted for username administration by setting enviornment variable `WHITELISTED_DOMAINS`. This may be particularly useful in combination with OAuth.
