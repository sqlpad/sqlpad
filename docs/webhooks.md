# Webhooks

?> Available `5.2.0`

A variety of webhooks are available to extend the functionality of SQLPad.

To enable a specific webhook, provide a URL for the event you would like to subscribe to. This URL will be sent an HTTP(S) POST with a payload of relevant information when the event occurs.

To ensure a webhook call is valid, `SQLPAD_WEBHOOK_SECRET` may be configured, and validated on every webhook call.

Each webhook will contain the following headers:

- `Content-Type`: `application/json`
- `SQLPad-Secret`: `SQLPAD_WEBHOOK_SECRET value`
- `SQLPad-URL`: `http://your-sqlpad-public-url:port/base-url`
- `SQLPad-Hook-Name`: `hook_name`

The payload sent to the URL varies by event.

## User Created

The user created webhook whenever a user is added via the users API/UI. This hook can be used to automate user invites, sending a message to users inviting them to sign up (if using local user/password authentication) or sign in (if using a single sign on).

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
