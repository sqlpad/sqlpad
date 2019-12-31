# Changelog

## 3.5.3

### December 30, 2019

- Revert build script to use sh

## 3.5.2

### December 30, 2019

- Fix admin password from env var
- Fix mysql zero-row result bug
- Fix add user and connection form submit page refresh in Firefox
- Fix schema sidebar height issues in Safari/Chrome
- Set build script to use bash instead of sh
- Let connection username/password decipher errors bubble up

## 3.5.1

### December 13, 2019

- Added support for authentication to Cassandra
- Added SSL support for MySQL/MariaDB
- Added JSON query result downloads alongside XSLX and CSV

## 3.5.0

### November 29, 2019

- Add json download format for query result
- Fix use of SQLPAD_ADMIN_PASSWORD setting

## 3.4.0

### November 10, 2019

- Add `sqlserverMultiSubnetFailover` option for SQL Server

## 3.3.0

### November 8, 2019

- Add `SQLPAD_TIMEOUT_SECONDS` config for setting http server timeout. Useful for supporting long running queries.

## 3.2.1

### October 17, 2019

- Fix SQL Server "port must be type number" error

## 3.2.0

### October 12, 2019

- Adds support for defining connections via configuration.

## 3.1.1

### October 10, 2019

Update all dependencies to latest (client & server). Includes major updates to following modules:

- SAP Hana
- Cassandra
- SQL Server
- email support
- XLSX and CSV query result downloads
- SAML authentication

Some integrations are not able to be tested by existing test setup. Please open an issue if any breakage is discovered.

## 3.1.0

### September 30, 2019

- Add cookie name config setting
- Add admin password setting

## 3.0.2

### September 1, 2019

- Removes npm version update check and related config item `disableUpdateCheck`

## 3.0.1

### September 1, 2019

SQLPad v3 is a UI redesign/refresh along with a large file structure change and configuration change. It has been in "beta" for quite some time, and if you are running the latest docker image or running a recent build of master, you've already been using it.

#### Features

- URLs in query results will be turned into links
- All other 3.0.0-beta features

#### Breaking changes

- CLI flags have been changed to use config item key (#460)
- All other 3.0.0-beta breaking changes

## 3.0.0-beta.2

### August 4, 2019

#### Breaking changes

- Default db path is no longer used if db path is not provided in config. Previous default was `$HOME/sqlpad/db`.
- Default config file path no longer used. Previous default was `$HOME/.sqlpadrc`.
- Configuration UI has been removed. See https://github.com/rickbergfalk/sqlpad/issues/447.
- cli-flags in saved .sqlpadrc JSON are no longer used for config values. These configuration keys should instead be switched the the `key` found in `configItems.js`. For example, instead of `dir` or `db`, use `dbPath`. Instead of `cert-passphrase` use `certPassphrase`, etc.
- `--save` and `--forget` cli flags no longer supported

#### Features

- SAML authentication support
- Remember selected connection id / schema toggle
- Configurable session time and secret
- Support for JSON and INI config file added. File should config using `key` fields found in [configItems.js](https://github.com/rickbergfalk/sqlpad/blob/master/server/lib/config/configItems.js). Config file path default is `$HOME/.sqlpadrc` and may otherwise be specified using `--config` via command line or `SQLPAD_CONFIG` environment variable.

#### Fixes

- Fix preview sticking around after query selection
- Fix tag/search input in query list
- Add loading indicator for schema sidebar
- Fix user needing to sign in again after sign up
- Fix app menu for non-admin users
- Fix frozen editor after query error

## 3.0.0

### September 1, 2019

This build is broken. sorry :(

## 3.0.0-beta.1

### June 25, 2019

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

## 2.8.1

### March 7, 2019

- Fix Google oauth for Google+ API shutdown

## 2.8.0

### October 17, 2018

- Add postgres column description to schema sidebar
- Log user id and email in debug mode
- Replace memory-based session store with file-based

## 2.7.1

### August 2, 2018

- Fix query editor not responding to input after query result scroll

## 2.7.0

### July 1, 2018

- Add optional odbc support. See [ODBC wiki page](https://github.com/rickbergfalk/sqlpad/wiki/ODBC) for more detais

## 2.6.1

### June 17, 2018

- Fix query editor loading when connections load slowly

## 2.6.0

### May 5, 2018

- Add Cassandra support
- Sort driver dropdown in connection form

## 2.5.8

### May 5, 2018

- Extend data grid to full width of container

## 2.5.7

### May 4, 2018

- Implement data grid using react-virtualized (fixes resizable columns)
- Fix chart rendering error when columns no longer returned by query are referenced
- Allow case insensitive user lookup by email (fixes case sensitive signup/signin issues)

## 2.5.6

### April 25, 2018

- Revert chart fix from 2.5.5 preventing charts from rendering

## 2.5.5

### April 23, 2018

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

## 2.5.4

### April 1, 2018

- Fixed password reset link when using base url

## 2.5.3

### March 29, 2018

- Fix SAP HANA schema not being cached due to dots in column name

## 2.5.2

### March 27, 2018

- Fix error when updating connection
- Fix SQLPAD_BASE_URL / --base-url use

## 2.5.1

### February 5, 2018

- Fix early session expiration / extend session expiration every response

## 2.5.0

### February 5, 2018

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

## 2.4.2

### December 27, 2017

- Fixed generic schema info query for case-sensitive collation

## 2.4.1

### December 3, 2017

- Fixed disappearing data table after vis resize

## 2.4.0

### December 3, 2017

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

## 2.3.2

### October 21, 2017

- Fix --base-url config use
- Refactored layout styling to use flexbox css

## 2.3.1

### October 7, 2017

- Force no-cache on fetch requests (fixes some odd IE issues)
- Fix docker entry point

## 2.3.0

### September 4, 2017

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

## 2.2.0

### May 29, 2017

- added SOCKS proxy support for postgres (brysgo)

## 2.2.0-beta2

### March 19, 2017

- fixed version displayed in about modal

## 2.2.0-beta1

### March 18, 2017

- fixed query tag weirdness from previous v1 weirdness
- leading 0s preserved in query results and treated as strings instead of numbers
- support for postgres ssl certs (johicks and nikicat)
- fixed crate v1 schema support (mikethebeer)
- naive autocomplete
- refactored connection admin screen
- changed build system to fork create-react-app

## 2.1.3

### January 28, 2017

- Ensure strict db startup order (vweevers)
- Improve query editor performance/reduce SQL editor lag

## 2.1.2

### December 9, 2016

- Fix chart only view not displaying charts
- Fix query editor search
- Update dependencies

## 2.1.1

### November 29, 2016

- Fix: disabling of links on query details modal (vweevers)
- Fix: Vis tab loading indicator behaves same as query tab, hiding error on rerun (vweevers)
- Fix: Charts rendered lazily. Query result grid loads faster, large query results won't lock browser until you try to chart. (vweevers)
- Fix: Hide local auth form if DISABLE_USERPASS_AUTH=true

## 2.1.0

### November 20, 2016

- run https via sqlpad directly (see additional setting) (jameswinegar)
- Support non English characters when downloading files (askluyao)
- render booleans/null timestamps properly

## 2.0.0

### October 12, 2016

- (See beta 1 - 3 release notes)

## 2.0.0-beta3

### October 11, 2016

- Password reset/forogot password functionality added
  - Admins may generate reset links manually
  - If smtp is set up forgot password link is enabled
- EMAIL
- Configuration:
  - Checklist added for OAuth and Email
  - Item is disabled in UI if value is provided by environment or cli
  - sensitive values are only masked if environment variables

## 2.0.0-beta2

### September 19, 2016

- Move to single-page-app architecture
- New query loading animation
- Title and export options added to chart/table only views
- Add Presto DB support
- Basic Auth available for non-admin api
- More performance improvements
- Misc bug fixes
- More code cleanup

## 2.0.0-beta1

### September 1, 2016

- UI design updates _everywhere_
- Query Listing:
  - preview query contents by hovering over query listing
  - occassional search/filter weirdness has been fixed
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

## 1.17.0

- empty postgres queries (like executing a comment only) no longer crash sqlpad
- materialized views are included in schema sidebar for postgres

## 1.16.0

- SQLPad may now be mounted under a base url path by providing --base-url cli flag or SQLPAD_BASE_URL env variable
- Updated taucharts to 0.9.1
- Legends are now included when saving png chart images

## 1.15.0

- Many client-side and server-side dependencies updated
- Add ability to bind to a specific IP address via the --ip flag or the SQLPAD_IP environment variable
- Removed sort inputs for bar charts. (Chart sort may instead be influenced using ORDER BY in SQL query.)

## 1.14.0

- Add ability to turn off date localization (add config item "localize" set to "false")

## 1.13.0

- Add --debug flag to SQLPad cli to enable extra logging
- Port and passphrase may be set via environment variables SQLPAD_PORT and SQLPAD_PASSPHRASE

## 1.12.0

- Add support for Crate.io

## 1.11.0

- Auto-refresh query every x seconds
- Fix crash when unregistered user tries to log in

## 1.10.0

- MySQL connections can now old/insecure pre 4.1 auth system
- links now available to display just the chart or data grid

## 1.9.0

- Charting now handled by the very cool tauCharts library. It's a bit faster, has facets, grammar of graphics concepts, handles time series data better, trendlines.
- When changing chart types, SQLPad will remember and reapply the field selections where applicable.
- SQLPad database files compacted every 10 minutes, instead of once a day
- Signup page styling is fixed.
- Schema-item-name copy-to-clipboard buttons now available. Opt in by creating configuration item `showSchemaCopyButton` to `true`.
- Query results can now be downloaded as xlsx file. (link will be hidden if csv downloads are disabled)

## 1.8.2

- Connection password no longer visible on connection screen.

## 1.8.1

- Duplicate content headers prevented when csv filename contains comma.

## 1.8.0

- Authentication now managed by Passport.js
- Username/Password authenication strategy can be disabled by setting environment variable DISABLE_USERPASS_AUTH
- Google OAuth strategy can be enabled by setting GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and PUBLIC_URL environment variables
- Query can be posted to Slack webhook when saved. To enable, create configuration item with key "slackWebhook", and set the value to a Slack incoming WebHook URL.
- Whitelist domains for username administration by setting environment variable WHITELISTED_DOMAINS
- Query connection now selected by default if only one exists

## 1.7.0

- Tags now look like tags
- Typeahead added for easy tag creation

## 1.6.0

- Code cleanup

## 1.5.1

- remove console logging used for debugging

## 1.5.0

- Vertica now supported via Vertica driver
- CSVs no longer generated if disabled
- optimizations made to schema-info processing

## 1.4.1

- improved db tree/schema info performance

## 1.4.0

- Charts can be saved as images

## 1.3.0

- work-around to handle multiple statements using postgres driver
- fix to provide MAX_SAFE_INTEGER if not defined

## 1.2.1

- query results are limited to 50,000 records. This can be changed by adding a configuration key "queryResultMaxRows" and providing the number of max rows you would like returned.
- Minor bugfixes
- Text selection enabled on query results
- schema information now cached
- connection port is optional in UI

## 1.2.0

- Added port property to connections
- Configuration system has been added
- CSV downloads can be disabled via configuration. Add new item with key "allowCsvDownload" with value "false" to disable.

## 1.1.0

- Add initial Vertica support via use of Postgres driver

## 1.0.0

- SQLPad is released
