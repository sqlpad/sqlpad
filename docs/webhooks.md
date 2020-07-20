# Webhooks

?> Available `5.2.0`

A variety of webhooks are available to extend the functionality of SQLPad.

To enable a specific webhook, set `SQLPAD_WEBHOOK_ENABLED` to `true`, and provide a URL for the event you would like to subscribe to. HTTP and HTTPS URLs are supported. This URL will be sent an HTTP POST with a payload of relevant information when the event occurs.

To ensure a webhook call is valid, `SQLPAD_WEBHOOK_SECRET` may be configured, and validated on every webhook call.

The webhook POST will contain the following headers:

- `Content-Type`: `application/json`
- `SQLPad-Secret`: `SQLPAD_WEBHOOK_SECRET value`

The request body sent to the URL varies by event. Every body will have an `action` field with the name of the action, as well as `sqlpadUrl`, which will contain the URL to the SQLPad instance that sent the action (if `PUBLIC_URL` is configured).

## User Created

The user created webhook is sent whenever a user is added via the users API/UI or auto user creation (if enabled and supported via authentication configured). This hook can be used to automate user invites, sending a message to users inviting them to sign up (if using local user/password authentication) or sign in (if using a single sign on).

**Env**: `SQLPAD_WEBHOOK_USER_CREATED_URL`

**Payload Body**:

```json
{
  "action": "user_created",
  "sqlpadUrl": "http://mysqlpad.com:9000/sqlpad",
  "user": {
    "id": "a57acb9e-859e-44b7-83a8-42c5cbb809ce",
    "name": "user1",
    "email": "user1@test.com",
    "role": "editor",
    "createdAt": "2020-07-19T18:54:18.858Z"
  }
}
```

## Query Created

Fires whenever a query is created (initial query save). This is not fired on query execution (see batch created).

**Env**: `SQLPAD_WEBHOOK_QUERY_CREATED_URL`

**Payload Body**:

```json
{
  "action": "query_created",
  "sqlpadUrl": "http://mysqlpad.com:9000/sqlpad",
  "query": {
    "id": "d0eb347e-864a-4058-bcb2-5456adf5474f",
    "name": "test query",
    "queryText": "SELECT * FROM some_table",
    "tags": ["one", "two"],
    "chart": null,
    "createdByUser": {
      "id": "92185834-42d3-4b63-b0d4-6d81e5e83dfd",
      "name": null,
      "email": "admin@test.com"
    },
    "createdAt": "2020-07-19T18:57:14.522Z"
  }
}
```

## Batch Created

Fires whenever a batch is created. A batch is one or more queries, and is the API used to execute queries in the UI.

**Env**: `SQLPAD_WEBHOOK_BATCH_CREATED_URL`

**Payload Body**:

```json
{
  "action": "batch_created",
  "sqlpadUrl": "",
  "batch": {
    "id": "c169c7fc-0b9b-482a-8fe6-c9b3486d2f88",
    "queryId": "2f3e9bb6-cadf-4d52-a0c0-43089353193f",
    "name": null,
    "connectionId": "6ffeeb1d-1142-4004-b9f8-91cef0d15850",
    "connectionClientId": null,
    "status": "started",
    "startTime": "2020-07-19T19:01:09.980Z",
    "stopTime": null,
    "durationMs": null,
    "batchText": "SELECT 1 AS id, 'blue' AS color",
    "selectedText": "SELECT 1 AS id, 'blue' AS color",
    "chart": null,
    "userId": "50076232-f06f-4a80-8a4d-fc6b8b265830",
    "createdAt": "2020-07-19T19:01:09.980Z",
    "updatedAt": "2020-07-19T19:01:09.980Z",
    "statements": [
      {
        "id": "9fc69c47-8fda-4d7d-90a7-8236733e4dbe",
        "batchId": "c169c7fc-0b9b-482a-8fe6-c9b3486d2f88",
        "sequence": 1,
        "statementText": "SELECT 1 AS id, 'blue' AS color",
        "status": "queued",
        "startTime": null,
        "stopTime": null,
        "durationMs": null,
        "columns": null,
        "rowCount": null,
        "resultsPath": null,
        "incomplete": null,
        "error": null,
        "createdAt": "2020-07-19T19:01:09.981Z",
        "updatedAt": "2020-07-19T19:01:09.981Z"
      }
    ]
  },
  "user": {
    "id": "50076232-f06f-4a80-8a4d-fc6b8b265830",
    "name": null,
    "email": "admin@test.com",
    "role": "admin",
    "createdAt": "2020-07-19T19:01:09.594Z"
  },
  "connection": {
    "id": "6ffeeb1d-1142-4004-b9f8-91cef0d15850",
    "name": "test connection",
    "driver": "sqlite"
  }
}
```

## Batch Finished

Fires whenever a batch finished running. Payload contains summary information for success, or first error on failure. To receive results, use statement finished hook.

**Env**: `SQLPAD_WEBHOOK_BATCH_FINISHED_URL`

**Payload Body**:

```js
{
  "action": "batch_finished",
  "sqlpadUrl": "",
  "batch": {
    "id": "40cf0e10-2bd1-4a02-92f8-340a99775671",
    "queryId": "026ca49e-491e-4520-9ead-76bcdb287d28",
    "name": null,
    "connectionId": "668489b8-6049-43a8-a7af-0f34abf1984c",
    "connectionClientId": null,
    "status": "finished",
    "startTime": "2020-07-19T19:01:57.696Z",
    "stopTime": "2020-07-19T19:01:57.830Z",
    "durationMs": 15,
    "batchText": "SELECT 1 AS id, 'blue' AS color",
    "selectedText": "SELECT 1 AS id, 'blue' AS color",
    "chart": null,
    "userId": "d49295f7-29b8-4ba5-be10-218638d02af7",
    "createdAt": "2020-07-19T19:01:57.696Z",
    "updatedAt": "2020-07-19T19:01:57.830Z",
    "statements": [
      {
        "id": "396e8043-c766-4fec-b441-82dbcdf16473",
        "batchId": "40cf0e10-2bd1-4a02-92f8-340a99775671",
        "sequence": 1,
        "statementText": "SELECT 1 AS id, 'blue' AS color",
        "status": "finished",
        "startTime": "2020-07-19T19:01:57.815Z",
        "stopTime": "2020-07-19T19:01:57.821Z",
        "durationMs": 6,
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
        "rowCount": 1,
        "resultsPath": "results\\396\\396e8043-c766-4fec-b441-82dbcdf16473.json",
        "incomplete": false,
        "error": null,
        "createdAt": "2020-07-19T19:01:57.697Z",
        "updatedAt": "2020-07-19T19:01:57.828Z"
      }
    ]
  },
  "user": {
    "id": "d49295f7-29b8-4ba5-be10-218638d02af7",
    "name": null,
    "email": "admin@test.com",
    "role": "admin",
    "createdAt": "2020-07-19T19:01:57.325Z"
  },
  "connection": {
    "id": "668489b8-6049-43a8-a7af-0f34abf1984c",
    "name": "test connection",
    "driver": "sqlite"
  }
}
```

## Statement Created

Fires whenever a statement is created. A statement is an individual SQL statement within a batch.

**Env**: `SQLPAD_WEBHOOK_STATEMENT_CREATED_URL`

**Payload Body**:

```json
{
  "action": "statement_created",
  "sqlpadUrl": "",
  "statement": {
    "id": "cce16e35-5b8f-442f-b7e8-e7fded25d02d",
    "batchId": "e11c9dde-53f8-4528-9b36-a889b90a70b7",
    "sequence": 1,
    "statementText": "SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color",
    "status": "queued",
    "startTime": null,
    "stopTime": null,
    "durationMs": null,
    "columns": null,
    "rowCount": null,
    "resultsPath": null,
    "incomplete": null,
    "error": null,
    "createdAt": "2020-07-19T22:31:09.050Z",
    "updatedAt": "2020-07-19T22:31:09.050Z"
  },
  "batch": {
    "id": "e11c9dde-53f8-4528-9b36-a889b90a70b7",
    "queryId": "81e68fcc-0876-449e-b2e6-03d4c087a054",
    "name": null,
    "connectionId": "e2b6a29d-4843-4062-8b12-ec1911979af5",
    "connectionClientId": null,
    "status": "started",
    "startTime": "2020-07-19T22:31:09.049Z",
    "stopTime": null,
    "durationMs": null,
    "batchText": "SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color",
    "selectedText": "SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color",
    "chart": null,
    "userId": "b478820a-1e0b-408f-8075-0f74baa74192",
    "createdAt": "2020-07-19T22:31:09.049Z",
    "updatedAt": "2020-07-19T22:31:09.049Z"
  },
  "user": {
    "id": "b478820a-1e0b-408f-8075-0f74baa74192",
    "name": null,
    "email": "admin@test.com",
    "role": "admin",
    "createdAt": "2020-07-19T22:31:08.704Z"
  },
  "connection": {
    "id": "e2b6a29d-4843-4062-8b12-ec1911979af5",
    "name": "test connection",
    "driver": "sqlite"
  }
}
```

## Statement Finished

Fires whenever a statement finishes running. A statement finished payload contains results for success, an error for failure

**Env**: `SQLPAD_WEBHOOK_STATEMENT_FINISHED_URL`

**Payload Body (success)**:

```json
{
  "action": "statement_finished",
  "sqlpadUrl": "",
  "statement": {
    "id": "ab466a92-0282-489b-9222-ff70ba9c846f",
    "batchId": "f35b21e7-1f96-49d0-a4ef-3a3e8e5f3266",
    "sequence": 1,
    "statementText": "SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color",
    "status": "finished",
    "startTime": "2020-07-19T22:26:06.826Z",
    "stopTime": "2020-07-19T22:26:06.831Z",
    "durationMs": 5,
    "columns": [
      {
        "datatype": "number",
        "max": 2,
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
    "resultsPath": "results\\ab4\\ab466a92-0282-489b-9222-ff70ba9c846f.json",
    "incomplete": false,
    "error": null,
    "createdAt": "2020-07-19T22:26:06.738Z",
    "updatedAt": "2020-07-19T22:26:06.835Z"
  },
  "batch": {
    "id": "f35b21e7-1f96-49d0-a4ef-3a3e8e5f3266",
    "queryId": "b53c73a9-79f9-4239-a6be-22fe1937b909",
    "name": null,
    "connectionId": "c9830ffb-a9f3-4e18-a040-5d4ae9011537",
    "connectionClientId": null,
    "status": "started",
    "startTime": "2020-07-19T22:26:06.736Z",
    "stopTime": null,
    "durationMs": null,
    "batchText": "SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color",
    "selectedText": "SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color",
    "chart": null,
    "userId": "2ff31b6d-4519-4e3f-912d-e6c54ad1d8c1",
    "createdAt": "2020-07-19T22:26:06.737Z",
    "updatedAt": "2020-07-19T22:26:06.737Z"
  },
  "user": {
    "id": "2ff31b6d-4519-4e3f-912d-e6c54ad1d8c1",
    "name": null,
    "email": "admin@test.com",
    "role": "admin",
    "createdAt": "2020-07-19T22:26:06.433Z"
  },
  "connection": {
    "id": "c9830ffb-a9f3-4e18-a040-5d4ae9011537",
    "name": "test connection",
    "driver": "sqlite"
  },
  "results": [
    [1, "blue"],
    [2, "red"]
  ]
}
```

**Payload Body (error)**:

```json
{
  "action": "statement_finished",
  "sqlpadUrl": "",
  "statement": {
    "id": "80f4ae01-e804-4962-8e78-239e32ba8d58",
    "batchId": "004df93e-4b78-4896-b929-4e3f9be850f9",
    "sequence": 1,
    "statementText": "SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color UNION ALL",
    "status": "error",
    "startTime": "2020-07-19T22:29:36.967Z",
    "stopTime": "2020-07-19T22:29:36.972Z",
    "durationMs": 5,
    "columns": null,
    "rowCount": null,
    "resultsPath": null,
    "incomplete": null,
    "error": {
      "title": "SQLITE_ERROR: incomplete input"
    },
    "createdAt": "2020-07-19T22:29:36.859Z",
    "updatedAt": "2020-07-19T22:29:36.973Z"
  },
  "batch": {
    "id": "004df93e-4b78-4896-b929-4e3f9be850f9",
    "queryId": "73d11915-0a8e-4a70-9b14-c11f4bc05573",
    "name": null,
    "connectionId": "ef19eae5-d91c-4d5c-abd9-19841d9f0250",
    "connectionClientId": null,
    "status": "error",
    "startTime": "2020-07-19T22:29:36.857Z",
    "stopTime": "2020-07-19T22:29:36.972Z",
    "durationMs": 5,
    "batchText": "SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color UNION ALL",
    "selectedText": "SELECT 1 AS id, 'blue' AS color UNION ALL SELECT 2 AS id, 'red' AS color UNION ALL",
    "chart": null,
    "userId": "7a2823c7-fb1e-41ed-841d-fd1ba0a0a1dc",
    "createdAt": "2020-07-19T22:29:36.858Z",
    "updatedAt": "2020-07-19T22:29:36.974Z"
  },
  "user": {
    "id": "7a2823c7-fb1e-41ed-841d-fd1ba0a0a1dc",
    "name": null,
    "email": "admin@test.com",
    "role": "admin",
    "createdAt": "2020-07-19T22:29:36.517Z"
  },
  "connection": {
    "id": "ef19eae5-d91c-4d5c-abd9-19841d9f0250",
    "name": "test connection",
    "driver": "sqlite"
  },
  "results": []
}
```
