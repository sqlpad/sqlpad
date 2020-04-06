# Seed Data

!> **EXPERIMENTAL This feature may continue to change before being finalized. Use at your own risk**

?> Available as of `4.2.0`

Data may be seeded to a SQLPad instance via JSON files on the file system. At this time only query and connection data may be seeded.

Seed data is loaded into SQLPad at server start, with the data being created or updated based on matching an attribute. Previously loaded seed data will be updated each server start, so plan accordingly.

If data is seeded and then removed from the seed data directory, it will not be removed from a SQLPad instance.

This mechanism is intended to be used for "system" data that is not intended to be modified by end users. For example, a "system" user can be created along with a set of canned queries, set to be shared with everyone.

To seed data, specify the directory to load data via config setting `seedDataPath`. This directory should contain directories for each item type to be loaded, each containing `.json` files for each item to be loaded.

Example structure:

```
/path/to/seed-data
  /connections
    connection-1.json
  /queries
    some-query.json
    another-query.json
```

## Seed Connections

Connections may be seeded to SQLPad as an alternative to defining connections via configuration. For fields supported refer to documentation on connection configuration via config file or environment variable. Seed connections differ in that the connection ID is provided by the `id` field.

Example seed connection JSON file:

```json
{
  "id": "seed-connection-1",
  "name": "postgres seed connection",
  "driver": "postgres",
  "host": "pghost",
  "database": "pgdatabase",
  "username": "pgusername",
  "password": "pguserpassword"
}
```

## Seed Queries

Queries are created or replaced matching on query id. At this time the query ACL implementation controls whether queries may be updated within SQLPad. It is entirely possible for these to be loaded, altered in the UI, then have those changes lost on next server start.

At this point SQLPad does not enforce referential integrity, so queries may be created with a `createdBy` containing an email address for a user that does not exist.

Example seed query JSON file (comments only added for doc purposes):

```js
{
  "id": "seed-query-1",
  "name": "Seed query 1",
  "connectionId": "seed-connection-1",
  "queryText": "SELECT * FROM seed_table",
  "createdBy": "admin@sqlpad.com",
  "acl": [
    // an ACL entry with write=false allows that user to read
    // (and execute if they have connection permission)
    // write=true allows user to save query
    {
      "userId": "some-userId-in-sqlpad",
      "write": false
    },
    // ACL entry can also be specified with a users email address.
    // The user does not need to exist in SQLPad at this point
    {
      "userEmail": "someone@sqlpad.com",
      "write": true
    },
    // Alternatively a special __EVERYONE__ group may be used to share the query with all SQLPad users
    {
      "groupId": "__EVERYONE__",
      "write": true
    }
  ]
}
```
