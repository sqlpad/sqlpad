# Changelog

## Installing beta via npm:
Install latest beta with `npm i -g sqlpad@beta`  
Install a specific version `npm i -g sqlpad@2.1.3`  

## next (in development)
- added systemd socket activation support (epeli)
- added option to disable update check

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
- UI design updates *everywhere*
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
- Removed sort inputs for bar charts. (Chart sort may instead be influenced using  ORDER BY in SQL query.)

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
