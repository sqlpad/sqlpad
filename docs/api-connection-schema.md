# Connection Schema API

## Overview

The connection schema API returnes the database schema (schemas, tables, and columns) for the connection specified.

## Get Connection Schema

?> Available in version 5.7.0

The connection schema API returnes the database schema (schemas, tables, and columns) for the connection specified.

By default this API returns cached schema response. A fresh schema may be calculated by sending query string `?reload=true`.

### Example

`GET /api/connections/<connectionId>/schema`

`GET /api/connections/<connectionId>/schema?reload=true`

### Parameters

- `reload`: string set to `true` to force schema refresh

### Response

_Note: Column `dataType` will contain value as sent back from database driver._

```json
{
  "schemas": [
    {
      "name": "schema_1_name",
      "description": "",
      "tables": [
        {
          "name": "table_1_name",
          "description": "",
          "columns": [
            {
              "name": "column_1_name",
              "description": "",
              "dataType": "INT"
            },
            {
              "name": "column_2_name",
              "description": "",
              "dataType": "TEXT"
            }
          ]
        }
      ]
    }
  ]
}
```

Some databases do not support a schema concept. In those cases, the top-level field may be `tables`:

```json
{
  "tables": [
    {
      "name": "table_1_name",
      "description": "",
      "columns": [
        {
          "name": "column_1_name",
          "description": "",
          "dataType": "INT"
        },
        {
          "name": "column_2_name",
          "description": "",
          "dataType": "TEXT"
        }
      ]
    }
  ]
}
```

## Get Schema Info (Deprecated)

!> Deprecated

The original schema-info API may be used to get schema details in an object tree format. This API is deprecated, and will be removed at some future release.

The schema result is cached by default. A fresh schema may be forced by providing query parameter `?reload=true`.

### Example

`GET /api/schema-info/<connectionId>`

`GET /api/schema-info/<connectionId>?reload=true`

### Parameters

- `reload`: string set to `true` to force schema refresh

### Response

_Note: Column `data_type` will contain value as sent back from database driver._

```json
{
  "<actualSchemaName>": {
    "<actualTableName>": [
      {
        "column_name": "column_1_name",
        "column_description": "",
        "data_type": "INT"
      },
      {
        "column_name": "column_2_name",
        "column_description": "",
        "data_type": "TEXT"
      }
    ]
  }
}
```
