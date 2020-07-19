# Webhooks

?> Available `5.2.0`

A variety of webhooks are available to extend the functionality of SQLPad.

To enable a specific webhook, set `SQLPAD_WEBHOOK_ENABLED` to `true`, and provide a URL for the event you would like to subscribe to. HTTP and HTTPS URLs are supported. This URL will be sent an HTTP POST with a payload of relevant information when the event occurs.

To ensure a webhook call is valid, `SQLPAD_WEBHOOK_SECRET` may be configured, and validated on every webhook call.

Each webhook POST will contain the following headers:

- `Content-Type`: `application/json`
- `SQLPad-Secret`: `SQLPAD_WEBHOOK_SECRET value`
- `SQLPad-URL`: `http://your-sqlpad-public-url:port/base-url`
- `SQLPad-Hook-Name`: `hook_name`

The request body sent to the URL varies by event.

## User Created

The user created webhook is sent whenever a user is added via the users API/UI or auto user creation (if enabled and supported via authentication configured). This hook can be used to automate user invites, sending a message to users inviting them to sign up (if using local user/password authentication) or sign in (if using a single sign on).

**Env**: `SQLPAD_WEBHOOK_USER_CREATED_URL`

**Hook Name**: `user_created`

**Payload Body**:

```js
{
  id: '7681aec0-b8c5-4267-b9cb-26f7ff3b3e48',
  name: 'user1',
  email: 'user1@test.com',
  role: 'editor',
  createdAt: '2020-07-13T19:12:48.020Z'
}
```

## Query Created

Fires whenever a query is created (initial query save). This is not fired on query execution (see batch created).

**Env**: `SQLPAD_WEBHOOK_QUERY_CREATED_URL`

**Hook Name**: `query_created`

**Payload Body**:

```js
{
  id: '65791206-ae82-4075-acc4-638d0eddf38c',
  name: 'test query',
  queryText: 'SELECT * FROM some_table',
  tags: [ 'tag-one', 'tag-two' ],
  // Chart object populated if chart was created
  chart: null,
  createdByUser: {
    id: 'd27b9673-f828-4e1f-8aa0-3cfa46708932',
    // User may not have name. This previously was not captured
    name: null,
    email: 'admin@test.com'
  },
  createdAt: '2020-07-13T19:17:58.111Z',
  // Connection object is optional and may not exist
  connection: {
    id: '71d4a1dd-f76c-4663-835b-8d70fee61118',
    name: 'test connection',
    driver: 'sqlite'
  }
}
```

## Batch Created

Fires whenever a batch is created. A batch is one or more queries, and is the API used to execute queries in the UI.

**Env**: `SQLPAD_WEBHOOK_BATCH_CREATED_URL`

**Hook Name**: `batch_created`

**Payload Body**:

```js
{
  "id": "c523d422-d1f9-4f3b-8d6c-2c7e3bca8efc",
  "queryId": "5adbd01b-10f9-43cd-8ab2-29d5eca3b6a3",
  "name": null,
  "connectionId": "74f9ba6a-1edb-4162-8cab-3b92ac6274d5",
  "connectionClientId": null,
  "status": "started",
  "startTime": "2020-07-13T23:59:05.896Z",
  "stopTime": null,
  "durationMs": null,
  "batchText": "SELECT 1 AS id, 'blue' AS color",
  "selectedText": "SELECT 1 AS id, 'blue' AS color",
  "chart": null,
  "userId": "10b949a6-21e3-445c-8fbf-95c43e81825c",
  "createdAt": "2020-07-13T23:59:05.897Z",
  "updatedAt": "2020-07-13T23:59:05.897Z",
  "statements": [
    {
      "id": "b7a29581-c67d-4a49-9211-c6e6672bc57f",
      "batchId": "c523d422-d1f9-4f3b-8d6c-2c7e3bca8efc",
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
      "createdAt": "2020-07-13T23:59:05.899Z",
      "updatedAt": "2020-07-13T23:59:05.899Z"
    }
  ],
  "user": {
    "id": "10b949a6-21e3-445c-8fbf-95c43e81825c",
    "name": null,
    "email": "admin@test.com",
    "role": "admin"
  },
  "connection": {
    "id": "74f9ba6a-1edb-4162-8cab-3b92ac6274d5",
    "name": "test connection",
    "driver": "sqlite"
  }
}
```

## Batch Finished

Fires whenever a batch finished running. Payload contains summary information for success, or first error on failure. To receive results, use statement finished hook.

**Env**: `SQLPAD_WEBHOOK_BATCH_FINISHED_URL`

**Hook Name**: `batch_finished`

**Payload Body**:

```js
{
  "id": "fc20f322-37c2-4e93-8006-3a0a4a8dd8a2",
  "queryId": "4669eeb5-81d8-49c3-bb23-e567d7d999ee",
  "name": null,
  "connectionId": "0900ea67-8403-487b-bc42-788531d25262",
  "connectionClientId": null,
  "status": "finished",
  "startTime": "2020-07-15T02:20:15.391Z",
  "stopTime": "2020-07-15T02:20:15.539Z",
  "durationMs": 14,
  "batchText": "SELECT 1 AS id, 'blue' AS color",
  "selectedText": "SELECT 1 AS id, 'blue' AS color",
  "chart": null,
  "userId": "bc9fec27-4044-4cae-b996-11315fd02e64",
  "createdAt": "2020-07-15T02:20:15.391Z",
  "updatedAt": "2020-07-15T02:20:15.540Z",
  "statements": [
    {
      "id": "8c8d06ad-d7ea-46c0-94e1-f41251a551d1",
      "batchId": "fc20f322-37c2-4e93-8006-3a0a4a8dd8a2",
      "sequence": 1,
      "statementText": "SELECT 1 AS id, 'blue' AS color",
      "status": "finished",
      "startTime": "2020-07-15T02:20:15.525Z",
      "stopTime": "2020-07-15T02:20:15.531Z",
      "durationMs": 6,
      "columns": [
        {
          "datatype": "number",
          "name": "id"
        },
        {
          "datatype": "string",
          "name": "color"
        }
      ],
      "rowCount": 1,
      "resultsPath": "results\\8c8\\8c8d06ad-d7ea-46c0-94e1-f41251a551d1.json",
      "incomplete": false,
      "error": null,
      "createdAt": "2020-07-15T02:20:15.394Z",
      "updatedAt": "2020-07-15T02:20:15.538Z"
    }
  ],
  "user": {
    "id": "bc9fec27-4044-4cae-b996-11315fd02e64",
    "name": null,
    "email": "admin@test.com",
    "role": "admin"
  },
  "connection": {
    "id": "0900ea67-8403-487b-bc42-788531d25262",
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
