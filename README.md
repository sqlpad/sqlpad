# SqlPad

A Node.js web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate and Vertica.

![SqlPad Query Editor](screenshots/query-editor.png)

For installation and usage, visit project page at [http://rickbergfalk.github.io/sqlpad/](http://rickbergfalk.github.io/sqlpad/).


## Development

Please use branch [v2-development](https://github.com/rickbergfalk/sqlpad/tree/v2-devlopment) for any new SqlPad features and code cleanup. See wiki for v2 roadmap.


## Tips

If you have highlighted just part of your query, only that part will be executed when you click Run Query.

## Configuration

### IP Address

By default SqlPad will listen from all available addresses (0.0.0.0). This may be overridden via the `--ip` flag or the `SQLPAD_IP` environment variable.

### Port

By default SqlPad will use port 80. This may be overridden via cli parameter `--port` or environment variable `SQLPAD_PORT`.

### Base URL Path

By default SqlPad will be accessible from the absolute base path of the available IP address(es). This may be overridden via cli parameter `--base-url` or environment variable `SQLPAD_BASE_URL`.

### Encryption Passphrase 

SqlPad uses very simple encryption when storing database connection passwords. A custom encryption passphrase may be set via cli parameter --passphrase or environment variable SQLPAD_PASSPHRASE.

### Query result record limit
To change the maximum records returned by a SQL query, add a new item with key `queryResultMaxRows` and set the value to the max number of rows you would like returned. If the key is missing or set to a non-number, SqlPad will return a maximum of 50,000 rows.

### Disable CSV download
To disable CSV downloads, visit the "Configuration" page and add a new item with key `allowCsvDownload` and value `false`. If the key is missing or set to any other value, CSV downloads will be enabled.

### Show Schema Copy Buttons
Some databases (like Vertica) require the fully qualified table and column names
within a SQL statement. This can be a hassle to remember or type when you have long and complicated names. For convenience, you can enable fully-qualified-name copy buttons that appear in the schema sidebar. When hovering over an item in the schema tree, a copy button will appear. Click it and the schema name, table name, and column name will be copied to your clipboard.

To enable the schema copy buttons, add a new configuration item with key `showSchemaCopyButton` with value `true`.


## License 

MIT
