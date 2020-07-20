# API

!> API patterns described below are new to `latest` and upcoming v5 release

## Overview

SQLPad aims to implement a REST-ish API, and as of v5, has been updated to be more consistent with itself and a typical REST API design.

Not all APIs within SQLPad follow this convention. This should cover _most_ APIs however, and be used as a guide when adding new APIs to SQLPad. Any PRs for tests or utilities to make all this easier and more consistent across the project are welcome.

Prior to v5, SQLPad did some funky things. All responses (whether they contained an error or not) returned a 200 status code. Errors were wrapped in an `error` envelope, where as data was wrapped in an envelope named after the API (For example, `/api/queries` responded with a body of `{ queries: [] }`)

With v5, status codes are used as you would expect. Status code usage is kept minimal, with the following being used as of this guide:

- `200`: OK (request was a success)
- `400`: Bad request (user input error)
- `401`: Unauthorized (you need to be authenticated)
- `403`: Forbidden (you lack the permissions to take that action)
- `404`: Not found (Route or item requested is not found)
- `500`: Internal Server Error (something unexpected happened)

For `200` responses, the response body is the data requested. For a list of items, that means the body will be an array of objects. For a single item, the body will be the item requested.

For `400` - `500` status codes, the body returned will be a JSON error object, with a `title` property at the very least. The error object has yet to be finalized, but may evolve using the [JSON:API](https://jsonapi.org/format/#error-objects) as a guide.

## Example: List Items

List APIs will return an array of objects. The objects in the list may be in summary form specifying only high-level information about the object.

**200: Body with results**

`GET /api/widgets`

```json
[
  {
    "id": "a-1",
    "name": "Some widget 1"
  },
  {
    "id": "b-2",
    "name": "Some widget 2"
  }
]
```

**200: Body without results**

`GET /api/widgets`

```json
[]
```

## Example: Get Single Item

Single item get requests specify the item id to fetch. An `id` in SQLPad will be a string or integer depending on the resource referenced. An attempt on an item that does not exist will result in 404.

**Request:**

`GET /api/widgets/a-1`

**Response**

Response body (200):

```json
{
  "id": "a-1",
  "name": "Some widget 1",
  "detail": "More detail about widget 1"
}
```

## Example: Create Item

Create a new item via `POST` against a top-level resource. `id` should not be sent. A full object of the newly created item will be sent in return.

**Request:**

`POST /api/widgets`

Body:

```json
{
  "name": "Some widget 3",
  "detail": "Some detail about new widget 3"
}
```

**Response:**

Status: 200

Body:

```json
{
  "id": "c-3",
  "name": "Some widget 3",
  "detail": "Some detail about new widget 3"
}
```

## Example: Update Item

An update is made via `PUT` request to a specific item. Partial object data is expected. A full representation of the updated item is sent in return. An attempt on an item that does not exist will result in 404.

**Request:**

`PUT /api/widgets/c-3`

Body:

```json
{
  "detail": "New detail for widget 3"
}
```

**Response:**

Status: 200

Body:

```json
{
  "id": "c-3",
  "name": "Some widget 3",
  "detail": "New detail for widget 3"
}
```

## Example: Delete Item

An update is made via `DELETE` request to a specific item. An empty JSON object with status 200 is returned if successful. An attempt on an item that does not exist will result in 404.

**Request:**

`DELETE /api/widgets/c-3`

**Response:**

Status: 200

Body:

```json
{}
```

## Example: Not Found

A `404` not found error will be returned when a specific item is requested, updated, or deleted, and it does not exist. (Note that at this time not all APIs do this consistently)

**Request:**

`GET /api/widgets/does-not-exist`
`PUT /api/widgets/does-not-exist`
`DELETE /api/widgets/does-not-exist`

**Response**

`GET /api/widgets/n-f`

Response body:

```json
{
  "title": "Not found"
}
```

## Variations From Typical REST APIs

`PUT` does not usually accept a full document and therefore does not typically do a full-replace of an item. It behaves more like `PATCH` in this way.

Pagination and links are not yet supported, but will be added at some point, using `Links` header (https://tools.ietf.org/html/rfc5988#page-6)

Some "action" URLs exist, and behave more like RPC calls. One particular URL for example is to format a query. If you have a good RESTy idea we're open to using a REST approach for it (for now, an RPC call seems pragmatic).

## Authentication to the API

There are several options for authenticating to the REST API.

1. Use GUI username and password with HTML Basic Authentication (unless `SQLPAD_USERPASS_AUTH_DISABLED` is set)

       curl --user username:password http://sqlpad.example.com/sqlpad/api/users

2. Use a Service Token generated from the GUI. Example:

       curl -X GET -H 'Accept: application/json' -H "Authorization: Bearer yourtoken" http://sqlpad.example.com/sqlpad/api/users