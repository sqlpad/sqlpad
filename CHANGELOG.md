# Changelog

## [5.6.0] - 2020-09-04

- Fix Presto/ClickHouse error display
- Show line numbers in SQL editor
- Update dependencies

## [5.5.1] - 2020-08-07

- Fix missing `top` strategy addition in 5.5.0

## [5.5.0] - 2020-08-07

- Add `top` limit strategy for ODBC connections
- Fix SQL editor not clearing on new query
- Update dependencies

## [5.4.0] - 2020-08-03

- Add configurable query result store (memory, database, and redis now an option). See `SQLPAD_QUERY_RESULT_STORE` under [configuration](https://rickbergfalk.github.io/sqlpad/#/configuration) docs.
- Update MySQL connections to use INTERACTIVE flag to prevent early connection close.

## [5.3.0] - 2020-07-31

- Embolden result column headers
- Add configurable session store (memory, database, and redis now an option). See `SQLPAD_SESSION_STORE` under [configuration](https://rickbergfalk.github.io/sqlpad/#/configuration) docs.
- Update server dependencies

## [5.2.1] - 2020-07-27

- Fix MySQL2 transaction support
- Fix old query results potentially overwriting new query results when using multi-statement transactions

## [5.2.0] - 2020-07-20

This release introduces new generic webhooks for a variety of events, while deprecating specific communication implementations (SMTP email and Slack). With webhooks, it is up to you to implement communication to your SQLPad users.

The webhooks added support a larger number of events than previously handled, such as queries being run and results/error received from those queries.

- Add webhooks [documentation](http://rickbergfalk.github.io/sqlpad/#/webhooks)
- Deprecate SMTP email and Slack webhook, both to be removed in v6.
- Capture database error message on ODBC driver connection error
- Show service token UI only if enabled via config (#787)
- CrateDB - provide separate user, password, and SSL fields (#793)
- Fix multiline string support in `sql-limiter`
- Fix regular expression constraint in `sql-limiter`

## [5.1.0] - 2020-07-10

- Add OpenID Connect authentication support
- Add .env config file support
- Fix disabled admin on initial SQLPad load when using seed queries
- Deprecate INI and JSON config files support
- Environment variables renamed for better consistency. Old name is deprecated:
  - `GOOGLE_CLIENT_ID` ➡ `SQLPAD_GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET` ➡ `SQLPAD_GOOGLE_CLIENT_SECRET`
  - `DISABLE_AUTH` ➡ `SQLPAD_AUTH_DISABLED`
  - `SQLPAD_DISABLE_AUTH_DEFAULT_ROLE` ➡ `SQLPAD_AUTH_DISABLED_DEFAULT_ROLE`
  - `DISABLE_USERPASS_AUTH` ➡ `SQLPAD_USERPASS_AUTH_DISABLED`
  - `ENABLE_LDAP_AUTH` ➡ `SQLPAD_LDAP_AUTH_ENABLED`
  - `LDAP_URL` ➡ `SQLPAD_LDAP_URL`
  - `LDAP_BASE_DN` ➡ `SQLPAD_LDAP_BASE_DN`
  - `LDAP_USERNAME` ➡ `SQLPAD_LDAP_USERNAME`
  - `LDAP_PASSWORD` ➡ `SQLPAD_LDAP_PASSWORD`
  - `CERT_PATH` ➡ `SQLPAD_HTTPS_CERT_PATH`
  - `CERT_PASSPHRASE` ➡ `SQLPAD_HTTPS_CERT_PASSPHRASE`
  - `KEY_PATH` ➡ `SQLPAD_HTTPS_KEY_PATH`
  - `SERVICE_TOKEN_SECRET` ➡ `SQLPAD_SERVICE_TOKEN_SECRET`

## [5.0.0] - 2020-07-03

Version 5 contains many infrastructure and API changes, as well as migrations that are not easy to roll back from. It is highly recommended take a backup of your database (`SQLPAD_DB_PATH` directory and/or your backend db in use).

This release finishes the migration from an embedded JSON database to an ORM and SQLite (used by default). For new instances of SQLPad, the following alternative backend databases may be used: SQL Server, MySQL, MariaDB, or PostgreSQL via `SQLPAD_BACKEND_DB_URI`.

Providing a value for `SQLPAD_DB_PATH`/`dbPath` is still required, as the file system is still used for sessions and storage of query results. This requirement will be removed in a later 5.x release.

Migrations will be run on SQLPad start up. To disable this behavior, set `SQLPAD_DB_AUTOMIGRATE` to `false`. Migrations may be run manually via `node server.js --config path/to/file.ext --migrate`. When using `--migrate` the process will exit after applying migrations.

Special thanks to @eladeyal-intel, @bruth, @yorek, @dengc367, @murphyke, and @Wizhi, for all their contributions in this release!

### Enhancements

- Column descriptions added for Google BigQuery

- Added MySQL 2 driver

- Add Redshift driver

- Add ClickHouse driver

- Add ActiveDirectory authentication

- Multi-transaction statement option made available for MySQL/MySQL 2 drivers

- Connection dropdown hidden if user is non-admin and only 1 connection exists

- Connection may be pre-selected via URL query parameter `connectionId` or `connectionName`

- Add default role when using disabling auth (`SQLPAD_DISABLE_AUTH_DEFAULT_ROLE`). `editor` is used by default.

- Users may be enabled/disabled to restrict access (alternative to deletion)

- Migrations may be run on their own using `--migration`

- Automigration may be disabled with `SQLPAD_DB_AUTOMIGRATE`

- Server side filtering and pagination added for `queries` API

- ODBC - limit strategies added for configuring method used to enforce query row limits

- Test connection error shown

- New `/batches` API for running multi-statement SQL. This replaces `/query-result` API, and is written in a more RESTful approach, removing the need to extend SQLPad timeouts. See [API docs](http://rickbergfalk.github.io/sqlpad/#/api-batches) for more info.

- Adds `allowedDomains` config item and deprecates `whitelistedDomains` to be removed in v6.

### Breaking

- Only admins may see all query history

- `denyMultipleStatements` connection option removed. Multiple statements are now attempted to be supported at SQLPad REST API level via `batches` and `statements` API.

- `/download-results/` API has been removed in favor of `/statement-results/`, which is similar but based on `statementId` instead of `cacheKey`. See [API docs](http://rickbergfalk.github.io/sqlpad/#/api-batches) for more info.

- `debug` config option removed. Use `appLogLevel` set to `debug` instead.

- `tableChartLinksRequireAuth` config option removed.

  All table/chart links require authentication going forward. If unauthenticated access to these URLs is necessary, look into whether an alternate auth solution may be used to passively provide authentication as necessary (like auth proxy for example.)

- data model changes:

  - `createdDate` fields have been renamed to `createdAt` (`created_at` in table)
  - `modifiedDate` fields have been renamed to `updatedAt` (`updated_at` in table)
  - `user.signupDate` renamed to `user.signupAt` (`signup_at` in table)
  - `query.modifiedBy` renamed to `query.updatedBy` (`updated_by` in table)
  - `query.createdBy` and `query.updatedBy` now hold user id as opposed to user email address.
  - `query.lastAccessDate` is removed. It was no different from `updatedAt`
  - Connection driver-specific fields have been moved to `connection.data`. Fields are still decorated on base of connection object for compatibility.
  - `cache` table has changed to use `id` instead of `cacheKey`.
  - `cache.expiration` has renamed to `cache.expiryDate` for consistency with other models
  - `cache.queryName` has renamed to `cache.name` for more generic use
  - `cache.schema` has been renamed to `cache.data` and stores raw JSON for generic use

- Regex filter for query history no longer supported

- Config file without an .json or .ini extension will be assumed to be JSON. Specific extensions will be required in a future release.

- Config file that does not exist will throw an error at startup instead of silently ignoring.

## [4.4.0] - 2020-04-22

- Adds ability to set initial default connection via configuration `defaultConnectionId`. (Only for initial load. User connections are then cached locally)
- Changes default query list filter to "all queries" instead of "my queries".
- Defaults schema sidebar to open, and removes local caching of toggle selection.
- Fixes autocomplete missing when schema sidebar is hidden on load.
- Updates dependencies

## [4.3.0] - 2020-04-16

- Support multiple datasets in BigQuery connection
- Fix sql splitting for strings containing `;`

## [4.2.0] - 2020-04-06

### Features

- Add Google BigQuery support [documentation](https://rickbergfalk.github.io/sqlpad/#/connections?id=bigquery)

- Add SQLite support [documentation](https://rickbergfalk.github.io/sqlpad/#/connections?id=sqlite)

- Adds batch query support to ODBC (last statement is shown in UI)

- Auth: Add option to disable authentication. [documentation](https://rickbergfalk.github.io/sqlpad/#/authentication?id=no-authentication)

  When auth is disabled, application no longer requires authentication.

- Auth: Add proxy authentication support. [documentation](https://rickbergfalk.github.io/sqlpad/#/authentication?id=auth-proxy)

- Add private/shared query model.

  Going forward queries are _private_ by default. When sharing is enabled, query is shared with all users (and they are given write permissions). Finer-grained access to be added in the future (share with specific user, read vs write)

- Add connection and query seed data support [documentation](https://rickbergfalk.github.io/sqlpad/#/seed-data)

- Add service tokens (api tokens). New menu option is available when logged in as admin.

- Add application header for application-level administration

- Adds multi-statement transaction support for Postgres, SQLite, and ODBC. [documentation](https://rickbergfalk.github.io/sqlpad/#/connections?id=multi-statement-transaction-support)

- Add config deprecation for following keys: `debug`, `tableChartLinksRequireAuth`, `keyPath`, `certPath`, `certPassphrase`

- Add connection template support [documentation](https://rickbergfalk.github.io/sqlpad/#/connection-templates)

- Adds additional query run logging for queries executed and details surrounding them (logged under `info` level)

### Fixes

- Fix: long connection form display to always show save/test buttons

- Use ISO 8601 timestamps for log messages instead of unix epoch

### Maintenance / Misc / Dev updates

- Updated dependencies
- Introduced SQLite as backing store. nedb data (embedded db currently in use) will eventually be migrated to SQLite.
- Added migration framework. Migrations are run at server startup.
- Added mult-stage build
- Lots of refactoring to better organize authentication, addition of new features.

## [4.1.1] - 2020-03-10

- Fix auth for email addresses containing `+` and quoted `@` characters

## [4.1.0] - 2020-02-25

### Features

- Add Snowflake driver/support (#519)
- Add MS SQL Server readOnly intent option (#520)
- Add logging using pino (#527, #547)

  SQLPad now logs json messages to stdout using the [pino](http://getpino.io/#/) library. Amount of logging can be controlled by setting `appLogLevel` and `webLogLevel` for application and web logs respectively. Pino does not manage log transport, but has an ecosystem of tooling available that does http://getpino.io/#/docs/transports.

- Allow dynamic user data in connection configuration (#544)

  Connections can have user values dynamically substituted in connection configuration values containing text values. This is a work-in-progress and can be used for adventurous. See PR for details, otherwise more info and corresponding UI will come with future releases.

- Add GitHub Release builds via build pipeline (#550)
- Add `dbInMemory` setting (#553)

  `dbInMemory` will run the embedded SQLPad db in memory without logging to disk. Enabling this does not remove the need for `dbPath` at this time, as file system access is still required for result caches and express session support. (`dbPath` to become optional in future release)

### Fixes

- Fix TypeError: Do not know how to serialize a BigInt (#522)
- Fix tests for non-utc time zones (#524)

### Maintenance

- Update server dependencies (#525)
- Maintenance & refactoring (#534, #535, #538, #539, #540, #541, #542, #543, #545, #551, #552, #553)

## [4.0.0] - 2020-01-18

### Breaking changes

- Node 12 or later required

### Features

- Add ability to restrict connections to specific users (#502)
- Merge multiple statement result sets for postgres into 1 result set (#510)
- Add Pre-query statements options to MySQL driver (#511)
- Add Query execution history (#512)
- Add Pre-query statements options to MySQL driver (#515)
- Update odbc dependency to v2

## [3.5.3] - 2019-12-30

- Revert build script to use sh

## [3.5.2] - 2019-12-30

- Fix admin password from env var
- Fix mysql zero-row result bug
- Fix add user and connection form submit page refresh in Firefox
- Fix schema sidebar height issues in Safari/Chrome
- Set build script to use bash instead of sh
- Let connection username/password decipher errors bubble up

## [3.5.1] - 2019-12-13

- Added support for authentication to Cassandra
- Added SSL support for MySQL/MariaDB
- Added JSON query result downloads alongside XSLX and CSV

## [3.5.0] - 2019-11-29

- Add json download format for query result
- Fix use of SQLPAD_ADMIN_PASSWORD setting

## [3.4.0] - 2019-11-10

- Add `sqlserverMultiSubnetFailover` option for SQL Server

## [3.3.0] - 2019-11-08

- Add `SQLPAD_TIMEOUT_SECONDS` config for setting http server timeout. Useful for supporting long running queries.

## [3.2.1] - 2019-10-17

- Fix SQL Server "port must be type number" error

## [3.2.0] - 2019-10-12

- Adds support for defining connections via configuration.

## [3.1.1] - 2019-10-10

Update all dependencies to latest (client & server). Includes major updates to following modules:

- SAP Hana
- Cassandra
- SQL Server
- email support
- XLSX and CSV query result downloads
- SAML authentication

Some integrations are not able to be tested by existing test setup. Please open an issue if any breakage is discovered.

## [3.1.0] - 2019-09-30

- Add cookie name config setting
- Add admin password setting

## [3.0.2] - 2019-09-01

- Removes npm version update check and related config item `disableUpdateCheck`

## [3.0.1] - 2019-09-01

SQLPad v3 is a UI redesign/refresh along with a large file structure change and configuration change. It has been in "beta" for quite some time, and if you are running the latest docker image or running a recent build of master, you've already been using it.

### Features

- URLs in query results will be turned into links
- SAML authentication support
- Remember selected connection id / schema toggle
- Configurable session time and secret
- Support for JSON and INI config file added. File should config using `key` fields found in [configItems.js](https://github.com/rickbergfalk/sqlpad/blob/master/server/lib/config/config-items.js). Config file path default is `$HOME/.sqlpadrc` and may otherwise be specified using `--config` via command line or `SQLPAD_CONFIG` environment variable.

### Breaking changes

- CLI flags have been changed to use config item key (#460)
- Default db path is no longer used if db path is not provided in config. Previous default was `$HOME/sqlpad/db`.
- Default config file path no longer used. Previous default was `$HOME/.sqlpadrc`.
- Configuration UI has been removed. See https://github.com/rickbergfalk/sqlpad/issues/447.
- cli-flags in saved .sqlpadrc JSON are no longer used for config values. These configuration keys should instead be switched the the `key` found in `configItems.js`. For example, instead of `dir` or `db`, use `dbPath`. Instead of `cert-passphrase` use `certPassphrase`, etc.
- `--save` and `--forget` cli flags no longer supported

### Fixes

- Fix preview sticking around after query selection
- Fix tag/search input in query list
- Add loading indicator for schema sidebar
- Fix user needing to sign in again after sign up
- Fix app menu for non-admin users
- Fix frozen editor after query error

## [3.0.0] - 2019-09-01

This build is broken. sorry :(

## [3.0.0-beta.1] - 2019-06-25

Beta for version 3 may be installed via latest docker image, or by installing via npm referencing exact version or beta tag.

SQLPad v3 is backwards-compatible with SQLPad v2 database files, and is mostly a UI redesign/refresh and a large file structure change. Give it a try and if you aren't ready for it roll back to v2 and everything should still work.

#### Editor-first UI refresh

UI components previously based on bootstrap UI components are now replaced by custom components. Magenta is embraced as a secondary color.

Management and listing pages (Queries, connections, users, and configuration) have been moved into side drawers, allowing management and browsing of things without leaving the current query. The query editor is the primary focus of the application.

Query editor toolbars have been consolidated into a single bar to maximize use of space on the page.

Unsaved changes to a previously-saved query are now saved, prompting the user to restore on next open. This is not enabled for unsaved changes to "new" queries since it could become an annoyance, but can be added if there is interest.

Query result chart has been moved to a smaller resizable pane along side the SQL query instead of being placed in a tab. This impacts the size available for the chart, but brings it to the default view, allowing altering of the query without changing tabs.

The schema sidebar may now be hidden and is now searchable. It has also been rewritten to render large trees efficiently.

Query result grid no longer has data bars for numeric values since it didn't make sense for all number values. Date value display logic has been altered to only show timestamps if timestamps are detected. When timestamps are shown, the full timestamp from the JavaScript date object is displayed.

## [2.8.1] - 2019-03-07

- Fix Google oauth for Google+ API shutdown

## [2.8.0] - 2018-10-17

- Add postgres column description to schema sidebar
- Log user id and email in debug mode
- Replace memory-based session store with file-based

## [2.7.1] - 2018-08-02

- Fix query editor not responding to input after query result scroll

## [2.7.0] - 2018-07-01

- Add optional odbc support. See [ODBC wiki page](https://github.com/rickbergfalk/sqlpad/wiki/ODBC) for more detais

## [2.6.1] - 2018-06-17

- Fix query editor loading when connections load slowly

## [2.6.0] - 2018-05-05

- Add Cassandra support
- Sort driver dropdown in connection form

## [2.5.8] - 2018-05-05

- Extend data grid to full width of container

## [2.5.7] - 2018-05-04

- Implement data grid using react-virtualized (fixes resizable columns)
- Fix chart rendering error when columns no longer returned by query are referenced
- Allow case insensitive user lookup by email (fixes case sensitive signup/signin issues)

## [2.5.6] - 2018-04-25

- Revert chart fix from 2.5.5 preventing charts from rendering

## [2.5.5] - 2018-04-23

- Remove frameguard protection (fixes iframe embeds)
- Use CDN for bootstrap font (fixes missing icons when using baseUrl)
- Update dependencies
- Fix 0 values classified as string in query results
- Fix UI chart error when referencing columns no longer returned by query
- Fix SQLPad crash postgres queries exceeding max row limit
- Only show admin registration open message if admin registration is actually open
- Fix baseUrl of undefined error
- A lot of driver refactoring
  - Driver implementations now consolidated at /server/drivers
  - All drivers now tested
- New docker build process/root-level Dockerfile

## [2.5.4] - 2018-04-01

- Fixed password reset link when using base url

## [2.5.3] - 2018-03-29

- Fix SAP HANA schema not being cached due to dots in column name

## [2.5.2] - 2018-03-27

- Fix error when updating connection
- Fix SQLPAD_BASE_URL / --base-url use

## [2.5.1] - 2018-02-05

- Fix early session expiration / extend session expiration every response

## [2.5.0] - 2018-02-05

- Added support for SAP HANA (ccmehil)
- Many security improvements
  - Majority of dependencies updated
  - Implemented expressjs security best practices
  - Helmet middleware added
  - Express-session used instead of cookie-session
  - Randomly generated cookie secrets
  - Sessions now expire (1 hour)
  - Limited amount of config info sent to front end
- Updated styling for User and Connection admin pages (bringing boring tables back. updates to rest of app to follow)
- Schema sidebar updates
  - Limits presto schema sidebar to schema if provided in connection info
  - Removed (view) label on views

## [2.4.2] - 2017-12-27

- Fixed generic schema info query for case-sensitive collation

## [2.4.1] - 2017-12-03

- Fixed disappearing data table after vis resize

## [2.4.0] - 2017-12-03

- Added resizable panes to query editor
- Added SQL formatter to query editor (KochamCie)
- Added clone query button to query editor
- Added prompt when navigating away from unsaved query edits
- Redesigned bar charts in data grid to a more minimal design
- Redesigned query editor nav bar
  - Brings query name input out of modal
  - Adds unsaved changes indicator to save button
  - Adds shortcut/tip documentation to modal
  - Uses nav links instead of buttons for less visual noise
- Updated editor shortcuts
  - Running query now `ctrl+return` or `command+return`
  - Format query with `shift+return`
- Updated tauCharts to latest version
- Implemented react-router & fix unnecessary page loads on navigation
- Bundled remaining vendor JavaScript libs
- Removed external font-awesome dependency from CDN
- Fixed bigint handling for MySQL
- Fixed date display in charts
- Fixed date display for MySQL
- Fixed cell content not expanding when cell is expanded
- Fixed unintended page refresh on editor sidebar link clicks
- Fixed layout bugs from flexbox
- Lots of misc front-end refactoring

## [2.3.2] - 2017-10-21

- Fix --base-url config use
- Refactored layout styling to use flexbox css

## [2.3.1] - 2017-10-07

- Force no-cache on fetch requests (fixes some odd IE issues)
- Fix docker entry point

## [2.3.0] - 2017-09-04

- New features
  - Added systemd socket activation support (epeli)
  - Added option to disable update check
  - Resizable data grid columns (slightly buggy)
- Fixes
  - Fixes MySQL schema sidebar showing extra dbs
  - Fixes loss of precision of numbers in UI grid (even if they were text)
  - Fixes Presto driver
  - Fixes React deprecation warnings
  - Fixes incorrect date display in UI
    - All dates were being localized. now displayed without localization
- Compatibility notes
  - Node v6.x now required at minimum

## [2.2.0] - 2017-05-29

- added SOCKS proxy support for postgres (brysgo)

## [2.2.0-beta2] - 2017-03-19

- fixed version displayed in about modal

## [2.2.0-beta1] - 2017-03-18

- fixed query tag weirdness from previous v1 weirdness
- leading 0s preserved in query results and treated as strings instead of numbers
- support for postgres ssl certs (johicks and nikicat)
- fixed crate v1 schema support (mikethebeer)
- naive autocomplete
- refactored connection admin screen
- changed build system to fork create-react-app

## [2.1.3] - 2017-01-28

- Ensure strict db startup order (vweevers)
- Improve query editor performance/reduce SQL editor lag

## [2.1.2] - 2016-12-09

- Fix chart only view not displaying charts
- Fix query editor search
- Update dependencies

## [2.1.1] - 2016-11-29

- Fix: disabling of links on query details modal (vweevers)
- Fix: Vis tab loading indicator behaves same as query tab, hiding error on rerun (vweevers)
- Fix: Charts rendered lazily. Query result grid loads faster, large query results won't lock browser until you try to chart. (vweevers)
- Fix: Hide local auth form if DISABLE_USERPASS_AUTH=true

## [2.1.0] - 2016-11-20

- run https via sqlpad directly (see additional setting) (jameswinegar)
- Support non English characters when downloading files (askluyao)
- render booleans/null timestamps properly

## [2.0.0] - 2016-10-12

- (See beta 1 - 3 release notes)

## [2.0.0-beta3] - 2016-10-11

- Password reset/forogot password functionality added
  - Admins may generate reset links manually
  - If smtp is set up forgot password link is enabled
- EMAIL
- Configuration:
  - Checklist added for OAuth and Email
  - Item is disabled in UI if value is provided by environment or cli
  - sensitive values are only masked if environment variables

## [2.0.0-beta2] - 2016-09-19

- Move to single-page-app architecture
- New query loading animation
- Title and export options added to chart/table only views
- Add Presto DB support
- Basic Auth available for non-admin api
- More performance improvements
- Misc bug fixes
- More code cleanup

## [2.0.0-beta1] - 2016-09-01

- UI design updates _everywhere_
- Query Listing:
  - preview query contents by hovering over query listing
  - occasional search/filter weirdness has been fixed
- Query Editor:
  - Schema sidebar no longer separates views and tables in hierarchy
  - New result grid
    - inline bar plot rendered for numeric values
    - display issues fixed for certain browsers
  - New tags widget for cleaner input
  - Browser tab name now reflects query name
  - Updated taucharts library with stacked bar charts
  - Line and Scatterplot charts may have chart filters enabled
  - 'show advanced settings' in vis editor now has a few advanced settings depending on chart (y min/max, show trendline, show filter)
  - switching between sql/vis tabs won't reset chart series toggles
  - table/chart only links may be set to no longer require login (see configuration page)
- Configuration:
  - Specific config inputs and labels - no more open ended key/value inputs
  - Current environment config documented with assistive popovers
- Update notification moved in-app
- Under the hood
  - updated all the code dependencies
  - reworked some foundation code for easier future development
- Known issues / not yet implemented:
  - Query tag input does not allow creation
  - Query auto-refresh not yet implemented

## [1.17.0]

- empty postgres queries (like executing a comment only) no longer crash sqlpad
- materialized views are included in schema sidebar for postgres

## [1.16.0]

- SQLPad may now be mounted under a base url path by providing --base-url cli flag or SQLPAD_BASE_URL env variable
- Updated taucharts to 0.9.1
- Legends are now included when saving png chart images

## [1.15.0]

- Many client-side and server-side dependencies updated
- Add ability to bind to a specific IP address via the --ip flag or the SQLPAD_IP environment variable
- Removed sort inputs for bar charts. (Chart sort may instead be influenced using ORDER BY in SQL query.)

## [1.14.0]

- Add ability to turn off date localization (add config item "localize" set to "false")

## [1.13.0]

- Add --debug flag to SQLPad cli to enable extra logging
- Port and passphrase may be set via environment variables SQLPAD_PORT and SQLPAD_PASSPHRASE

## [1.12.0]

- Add support for Crate.io

## [1.11.0]

- Auto-refresh query every x seconds
- Fix crash when unregistered user tries to log in

## [1.10.0]

- MySQL connections can now old/insecure pre 4.1 auth system
- links now available to display just the chart or data grid

## [1.9.0]

- Charting now handled by the very cool tauCharts library. It's a bit faster, has facets, grammar of graphics concepts, handles time series data better, trendlines.
- When changing chart types, SQLPad will remember and reapply the field selections where applicable.
- SQLPad database files compacted every 10 minutes, instead of once a day
- Signup page styling is fixed.
- Schema-item-name copy-to-clipboard buttons now available. Opt in by creating configuration item `showSchemaCopyButton` to `true`.
- Query results can now be downloaded as xlsx file. (link will be hidden if csv downloads are disabled)

## [1.8.2]

- Connection password no longer visible on connection screen.

## [1.8.1]

- Duplicate content headers prevented when csv filename contains comma.

## [1.8.0]

- Authentication now managed by Passport.js
- Username/Password authenication strategy can be disabled by setting environment variable DISABLE_USERPASS_AUTH
- Google OAuth strategy can be enabled by setting GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and PUBLIC_URL environment variables
- Query can be posted to Slack webhook when saved. To enable, create configuration item with key "slackWebhook", and set the value to a Slack incoming WebHook URL.
- Whitelist domains for username administration by setting environment variable WHITELISTED_DOMAINS
- Query connection now selected by default if only one exists

## [1.7.0]

- Tags now look like tags
- Typeahead added for easy tag creation

## [1.6.0]

- Code cleanup

## [1.5.1]

- remove console logging used for debugging

## [1.5.0]

- Vertica now supported via Vertica driver
- CSVs no longer generated if disabled
- optimizations made to schema-info processing

## [1.4.1]

- improved db tree/schema info performance

## [1.4.0]

- Charts can be saved as images

## [1.3.0]

- work-around to handle multiple statements using postgres driver
- fix to provide MAX_SAFE_INTEGER if not defined

## [1.2.1]

- query results are limited to 50,000 records. This can be changed by adding a configuration key "queryResultMaxRows" and providing the number of max rows you would like returned.
- Minor bugfixes
- Text selection enabled on query results
- schema information now cached
- connection port is optional in UI

## [1.2.0]

- Added port property to connections
- Configuration system has been added
- CSV downloads can be disabled via configuration. Add new item with key "allowCsvDownload" with value "false" to disable.

## [1.1.0]

- Add initial Vertica support via use of Postgres driver

## [1.0.0]

- SQLPad is released
