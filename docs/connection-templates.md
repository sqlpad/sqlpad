# Connection Templates

!> **EXPERIMENTAL This feature may break certain SQLPad functionality and may change if too problematic. Use at your own risk**

?> Available as of `4.2.0`

A connection is a collection of settings that inform SQLPad how to connect to a database. In most cases this involves a hostname, a db user and password, a connection string, etc. (Other BI tools may call these _Data Source_)

A connection is static, and would always connect to the same database, using the same configuration, for all users.

Connection templates changes this assumption, and allow user values to be substituted for connection values at run time. For example, imagine you could associate a database username and password with a SQLPad user, and when that user runs a query using that connection,

This can be very powerful, but can also create a lot of unexpected results and potentially break SQLPad if used beyond it's initially intended use.

**Recommended use:** Supplying database user/password, or some other authentication token to enforce db permissions/row-level security

**Not recommended use:** Supplying database hostname, which changes the target database for every user and goes against what SQLPad's idea of a connection is.

## Using Connection Templates

In order to use connection templates, first determine which data you plan on passing into the connection template. We'll use the database user as an example.

The SQLPad `user` object now has a generic `data` JSON object property, that can hold a variety of keys that you define. We'll plan on our SQLPad user record looking like the following:

```json
{
  "email": "user@sqlpad.com",
  "role": "admin",
  "data": {
    "dbUser": "SOMEDBUSER001"
  }
}
```

Today the only options available to populate the `user.data` property is to use [Auth Proxy authentication](https://rickbergfalk.github.io/sqlpad/#/authentication?id=auth-proxy) and map the data to that field, or use the REST API and a Service Token to do so. (The API will be undergoing some changes for v5, and will be documented after those changes are made.)

Once the `dbUser` data is persisted to the user, it may be referenced in a connection using a mustache or handlebars like templating syntax using double curly braces `{{user.data.dbUser}}`. All properties under `user` may be used (email, name, etc).

These template values can be used in any connection field that accepts text input (except for name).

For example, a connection JSON object for this would look like:

```json
{
  "name": "A dynamic postgres connection",
  "driver": "postgres",
  "host": "some-postgres-db-hostname",
  "database": "some-postgres-db",
  "username": "{{user.data.dbUser}}"
}
```
