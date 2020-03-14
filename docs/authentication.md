# Authentication

## Local Authentication

By default, SQLPad supports local authentication with email and password. Passwords are stored in SQLPad's embedded database using bcrypt hashing.

Once SQLPad is running, you may create an initial admin account by navigating to [http://localhost/signup](http://localhost/signup).

Once an initial admin account has been created, all future users must be whitelisted by an admin within the users page. Other users may also be given admin rights, allowing them to add/edit database connections and whitelist/modify/remove SQLPad users.

If for whatever reason you lose admin rights, and the last-admin-standing won't give you admin rights back, you can reinstate them to yourself by running

`sqlpad --admin yourEmailAddress@domain.com`

Local authentication can be disabled by setting `disableUserpassAuth` to `true`.

## No Authentication

SQLPad can be configured to run without any configuration at all. This can be enabled by setting `disableAuth` to `true`.

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

## Whitelist Domains for User Administration

An entire domain can be whitelisted for username administration by setting enviornment variable `WHITELISTED_DOMAINS`. This may be particularly useful in combination with OAuth.
