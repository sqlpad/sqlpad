# Queries API

## Overview

The `queries` API is used for saving and updating saved queries. Queries contain a block of SQL text (may be multiple statements), a name, a connection used to run the query against, and an optional chart configuration JSON object.

The `queries` API follows the general patterns described in [API Overview](http://sqlpad.github.io/sqlpad/#/api-overview) with an addition in that the queries list API allows for server-side filtering and pagination.

## Single Query GET, POST, and PUT

### Create / Update Payload

When creating/updating a query, a partial query object should be sent. For updates, only the fields changing need to be sent.

`tags` should be sent as an array of strings. `chart` should be sent as the object it is intended to be.

`acl` should be an array of objects containing either `groupId` or `userId`, and the `write` boolean. `queryId`, `id`, `createdAt` and `updatedAt` will be populated by the API server.

Similarly, `createdBy`, `updatedBy`, related user objects, `canDelete`, `canRead`, and `canWrite`, `createdAt`, and `updatedAt` should not be provided, as they are maintained by the API server as well.

```js
{
  // id can be any string. Defaults to UUID
  name: 'Human friendly name',
  connectionId: 'id-of-connection',
  // Query text containing 1 or more SQL statements
  queryText: 'SELECT * FROM table_1; SELECT * FROM table_2;',
  tags: [
    'tag-one',
    'tag-two',
    'tag-three'
  ],
  // Configuration & mapping used for chart
  // This is dynamic in nature and will likely change
  chart: {
    chartType: 'kind-of-chart',
    fields: {
      "barlabel": "result-column-name",
      "barvalue" : "other-result-column-name",
      "otherfield": "other-value"
    }
  },
  // acl is a list of access control objects for query
  // Used to control who the query is shared with,
  // and whether they can save updates to the query
  // Either groupId or userId can be set for each object, not both
  acl: [
    {
      queryId: "some-id",
      groupId: "__EVERYONE__",
      userId: null,
      write: true,
    }
  ],

  canDelete: true,
  canRead: true,
  canWrite: true,
}
```

### Full Query Response

Creating, updating, and fetching a single query returns the full query object

```js
{
  // id can be any string. Defaults to UUID
  id: 'some-id',
  name: 'Human friendly name',
  connectionId: 'id-of-connection',
  // Query text containing 1 or more SQL statements
  queryText: 'SELECT * FROM table_1; SELECT * FROM table_2;',
  tags: [
    'tag-one',
    'tag-two',
    'tag-three'
  ],
  // Configuration & mapping used for chart
  // This is dynamic in nature and will likely change
  chart: {
    chartType: 'kind-of-chart',
    fields: {
      "barlabel": "result-column-name",
      "barvalue" : "other-result-column-name",
      "otherfield": "other-value"
    }
  },
  // acl is a list of access control objects for query
  // Used to control who the query is shared with,
  // and whether they can save updates to the query
  // Either groupId or userId can be set for each object, not both
  acl: [
    {
      id: 13,
      queryId: "some-id",
      groupId: "__EVERYONE__",
      userId: null,
      write: true,
      createdAt: "2020-07-04T00:52:36.369Z",
      updatedAt: "2020-07-04T00:52:36.369Z",
    }
  ],
  createdBy: 'user-id-of-author',
  // Additional user information for `createdBy` id
  createdByUser: {
    id: 'user-id-of-author',
    name: 'name-of-author',
    email: 'email-of-author'
  },
  updatedBy: 'user-id-of-author',
  // Additional user information for `updatedBy` id
  updatedByUser: {
    id: 'user-id-of-author',
    name: 'name-of-author',
    email: 'email-of-author'
  },
  createdAt: '2020-07-04T00:49:57.595Z',
  updatedAt: '2020-07-04T00:49:57.595Z',
  // Permissions added by API for currently logged-in user
  canDelete: true,
  canRead: true,
  canWrite: true,
}
```

## Server Filtering and Pagination

Queries may grow to a large number of entries. Use pagination and filtering to efficiently fetch intended queries.

### Example

`GET /api/queries?connectionId=connection-id&search=searchvalue&tags[]=on&tags[]=test&sortBy=-updatedAt&limit=20&offset=20`

### Parameters

- `connectionId`: Get queries for specific connection
- `search`: Value to search for in `name` or `queryText`
- `tags[]`: Array of tags. Queries returned will have all tags in querystring
- `sortBy`: Direction and field to sort on. Options are `-updatedAt`, `+updatedAt`, `-name`, `+name`
- `ownedByUser`: If `true` only queries owned by user are returned. If `false` queries shared with user are returned. If not provided all queries visible to user are returned.
- `createdBy`: Get queries created by specific user

### Response

The queries list API returns an array of query summary objects. This object has fewer fields than the single-GET/PUT/POST response.

```js
[
  {
    id: 'RuV3A7uPBGDATBnx',
    name: 'sqlpad - schema version',
    queryText: 'select * from schema_version',
    tags: ['tag-one', 'tag-two'],
    acl: [],
    canDelete: true,
    canRead: true,
    canWrite: true,
    chart: {},
    connection: {
      id: 'orWfhrRpkc1ybd0t',
      name: 'sqlpad-sqlite3',
      driver: 'sqlite',
    },
    createdBy: 'kpxXdFgJ2SE2QYnD',
    createdByUser: {
      id: 'kpxXdFgJ2SE2QYnD',
      name: null,
      email: 'admin@sqlpad.com',
    },
  },
];
```
