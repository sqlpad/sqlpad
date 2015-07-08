# Changelog

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
- SqlPad is released!