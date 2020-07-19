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

**Hook Name**: `statement_created`

**Payload Body**:

```js
{
}
```

## Statement Finished

Fires whenever a statement finishes running. A statement finished payload contains results for success, an error for failure

**Env**: `SQLPAD_WEBHOOK_STATEMENT_FINISHED_URL`

**Hook Name**: `statement_finished`

**Payload Body**:

```js
{
}
```
