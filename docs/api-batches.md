# Batches & Statements API

?> Batches and related APIs available as of v5.0.0

## Overview

A new restful approach to running queries is being added to SQLPad as of version 5 release.

Prior to v5, queries were run in SQLPad with an HTTP `POST`, with the query results being returned in the response.

While nice and simple, it has some downsides:

- long queries require long HTTP timeout configurations (not ideal, requires additional configuration to load balancers, proxy, etc.)
- An execution with multiple statements/queries would require all queries to finish before results are sent back. Results would have to be in single response (might be too big)

As of v5 new restful APIs have replaced the existing query-result API.

The `/batches` API creates a query `batch`, which details a string of SQL text that may include one or more SQL statements. These statements are parsed, and corresponding `statement` objects are created.

These newly created objects are returned as soon as they are created, each containing a status as to whether they are started, finished, or resulted in an error.

Immediately following creation, the batch is executed, each statement sequentially, under the same connection if the database driver supports it. On error, further statements in the batch are stopped, and the statement and batch in question is marked as status `error`.

On success, the batch and statement are marked with status `finished`. Query results are written to the file system as a JSON file under the `results` directory inside the directory specified by the `dbPath` configuration variable.

These results on the file system are kept according to the `queryHistoryRetentionTimeInDays` setting, which defaults to 30 days.

## Creating a Batch

Execute SQL by creating a batch (and statements) from SQL text.

**Request:**

`POST /api/batches`

Body:

```js
{
  // Required fields:
  // --------------------------------------------------------------------------
  // Connection to use to execute the query
  connectionId: 'id-of-connection-to-use',
  // Text of query batch, containing one or more queries, delimited by ;
  batchText: 'SELECT * FROM table_a; SELECT * FROM table_b;',

  // Optional fields:
  // --------------------------------------------------------------------------
  // If a connection client is open for current editing session,
  // specifying connectionClientId will run the batch under
  // that underlying database connection. when not supplied, query batches
  // are run under a new underlying db connection, which is closed on completion)
  connectionClientId: 'id-of-connection-client',
  // Name of query/batch at time of batch execution
  name: 'a query batch',
  // id of query to associate with this query
  // (future use to see past query results/versions)
  queryId: 'query-id',
  // Partial selected text from query editor.
  // If supplied, the selectedText is run INSTEAD of batchText
  // When selectedText is specified, batchText will be used in future
  // to reset editors full state, including statements not run
  selectedText: 'SELECT * FROM table_b',
  // A chart object, to be used in future to chart results
  // based on chart config at time of execution
  chart: {}
}
```

**Response:**

Status: 200

Body:

```json
{
  "id": "711f65c9-b6bc-4cd4-80bf-26398172bf7c",
  "queryId": "ced7db11-5cca-4165-bb18-3e0ada95b6b9",
  "name": null,
  "connectionId": "fb18ee26-5103-4ada-8bc7-fe5f731e2d44",
  "connectionClientId": null,
  "status": "started",
  "startTime": "2020-05-29T23:20:40.581Z",
  "stopTime": null,
  "durationMs": null,
  "batchText": "SELECT * FROM table_a; SELECT * FROM table_b;",
  "selectedText": "SELECT * FROM table_b;",
  "chart": null,
  "userId": "0c67f160-9093-4dd3-8c80-167afcff139a",
  "createdAt": "2020-05-29T23:20:40.581Z",
  "updatedAt": "2020-05-29T23:20:40.581Z",
  "statements": [
    {
      "id": "4d5e2205-22af-457e-ab73-8e960fd68293",
      "batchId": "711f65c9-b6bc-4cd4-80bf-26398172bf7c",
      "sequence": 1,
      "statementText": "SELECT * FROM table_b",
      "status": "queued",
      "startTime": null,
      "stopTime": null,
      "durationMs": null,
      "columns": null,
      "rowCount": null,
      "resultsPath": null,
      "incomplete": null,
      "error": null,
      "createdAt": "2020-05-29T23:20:40.582Z",
      "updatedAt": "2020-05-29T23:20:40.582Z"
    }
  ]
}
```

## Get Single Batch

Gets a single batch and related statement info. Does not include actual query results.

**Request:**

`GET /api/batches/<batchId>`

**Response**

Response body (200):

```json
{
  "id": "731cf09a-f289-4b27-9b28-561f748f98ac",
  "queryId": "0d722909-a1e8-4c0e-a7a3-48d8feebf12c",
  "name": null,
  "connectionId": "f4c3ac32-079b-4dcb-bdad-0681d7a314b8",
  "connectionClientId": null,
  "status": "finished",
  "startTime": "2020-05-29T23:25:58.368Z",
  "stopTime": "2020-05-29T23:25:58.525Z",
  "durationMs": 34,
  "batchText": "SELECT * FROM table_b",
  "selectedText": "SELECT * FROM table_b",
  "chart": null,
  "userId": "80787f95-1f42-4f69-a03a-fa153a42a26e",
  "createdAt": "2020-05-29T23:25:58.368Z",
  "updatedAt": "2020-05-29T23:25:58.525Z",
  "statements": [
    {
      "id": "6526360d-6efa-4b36-8d41-b3b009d6d3cf",
      "batchId": "731cf09a-f289-4b27-9b28-561f748f98ac",
      "sequence": 1,
      "statementText": "SELECT 1 AS id, 'blue' AS color",
      "status": "finished",
      "startTime": "2020-05-29T23:25:58.491Z",
      "stopTime": "2020-05-29T23:25:58.507Z",
      "durationMs": 16,
      "columns": [
        {
          "datatype": "number",
          "max": 1,
          "min": 1,
          "maxValueLength": 0,
          "name": "id"
        },
        {
          "datatype": "string",
          "max": null,
          "min": null,
          "maxValueLength": 4,
          "name": "color"
        }
      ],
      "rowCount": 2,
      "resultsPath": "results\\652\\6526360d-6efa-4b36-8d41-b3b009d6d3cf.json",
      "incomplete": false,
      "error": null,
      "createdAt": "2020-05-29T23:25:58.370Z",
      "updatedAt": "2020-05-29T23:25:58.515Z"
    }
  ]
}
```

## Get Statements for a Batch

Instead of getting the entire `batch` object with related `statements`, you may fetch just the `statements` for a given batch.

**Request**

`GET /api/batches/<batchId>/statements`

**Response**

Response body (200):

```json
[
  {
    "id": "6526360d-6efa-4b36-8d41-b3b009d6d3cf",
    "batchId": "731cf09a-f289-4b27-9b28-561f748f98ac",
    "sequence": 1,
    "statementText": "SELECT 1 AS id, 'blue' AS color",
    "status": "finished",
    "startTime": "2020-05-29T23:25:58.491Z",
    "stopTime": "2020-05-29T23:25:58.507Z",
    "durationMs": 16,
    "columns": [
      {
        "datatype": "number",
        "max": 1,
        "min": 1,
        "maxValueLength": 0,
        "name": "id"
      },
      {
        "datatype": "string",
        "max": null,
        "min": null,
        "maxValueLength": 4,
        "name": "color"
      }
    ],
    "rowCount": 2,
    "resultsPath": "results\\652\\6526360d-6efa-4b36-8d41-b3b009d6d3cf.json",
    "incomplete": false,
    "error": null,
    "createdAt": "2020-05-29T23:25:58.370Z",
    "updatedAt": "2020-05-29T23:25:58.515Z"
  }
]
```

## Get Single Statement

To get the details of a single statement:

**Request**

`GET /api/statements/<statementId>`

**Response**

Response body (200):

```json
{
  "id": "6526360d-6efa-4b36-8d41-b3b009d6d3cf",
  "batchId": "731cf09a-f289-4b27-9b28-561f748f98ac",
  "sequence": 1,
  "statementText": "SELECT 1 AS id, 'blue' AS color",
  "status": "finished",
  "startTime": "2020-05-29T23:25:58.491Z",
  "stopTime": "2020-05-29T23:25:58.507Z",
  "durationMs": 16,
  "columns": [
    {
      "datatype": "number",
      "max": 1,
      "min": 1,
      "maxValueLength": 0,
      "name": "id"
    },
    {
      "datatype": "string",
      "max": null,
      "min": null,
      "maxValueLength": 4,
      "name": "color"
    }
  ],
  "rowCount": 2,
  "resultsPath": "results\\652\\6526360d-6efa-4b36-8d41-b3b009d6d3cf.json",
  "incomplete": false,
  "error": null,
  "createdAt": "2020-05-29T23:25:58.370Z",
  "updatedAt": "2020-05-29T23:25:58.515Z"
}
```

## Get Statement Results

Statement results are returned as an array of row arrays.

**Request**

`GET /api/statements/<statementId>/results`

**Response**

Response body (200):

```json
[
  [1, "blue"],
  [2, "red"]
]
```
