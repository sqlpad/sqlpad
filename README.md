# SQLPad

[![Build Status](https://travis-ci.org/rickbergfalk/sqlpad.svg?branch=master)](https://travis-ci.org/rickbergfalk/sqlpad)

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate, Vertica, Presto, and SAP HANA. Other databases potentially supported via [unix odbc support](https://github.com/rickbergfalk/sqlpad/wiki/ODBC).

## Version 3 Work in progress

Version 3 work has been promoted to master branch and is functional but not ready for release.

This work involves a directory restructuring and a front-end react component framework migration from react-bootstrap to antd.

Version 3 will not contain any breaking back-end changes. It should be possible to try v3 out with a given SQLPad database, and revert back to v2 if desired.

## Installation, Usage, Screenshots

Visit project page at [http://rickbergfalk.github.io/sqlpad/](http://rickbergfalk.github.io/sqlpad/).

![SQLPad Query Editor](http://rickbergfalk.github.io/sqlpad/images/screenshots/query-editor.png)

## Using Docker Image

The docker image runs on port 3000 and uses `/var/lib/sqlpad` for the embedded database directory.

Some configuration is exposed via environment variables. See [configItems.js](https://github.com/rickbergfalk/sqlpad/blob/master/server/lib/config/configItems.js) for details on environment variables considered (`envVar` field).

See [docker-validation](https://github.com/rickbergfalk/sqlpad/tree/master/docker-validation) folder for example docker-compose setup with SQL Server.

## Development

* Clone/download this repo
* Install node 8 or later ([nvm recommended](https://github.com/creationix/nvm))
* Ensure you have the latest npm

  ```sh
  npm install npm -g
  ```

* Install dependencies (front and back)

  ```sh
  npm ci --prefix client
  npm ci
  ```

* Build front-end

  ```sh
  npm run build
  ```

* Start dev server

  ```sh
  npm start
  ```

At this point you should have both back-end and front-end development servers running.

http://localhost:3000 serves react front-end in dev-mode
http://localhost:3010 serves front-end compiled for production

When viewing the front end in development mode, the page will automatically refresh on front-end file change. The back-end server will always auto-restart on file change.

### Databases

A docker-compose file with is provided to provide an empty postgres database to test with.
If you have docker installed you can do the following:

```sh
# Bring database containers up in background
docker-compose up -d

# To bring database down
docker-compose down

# To remove dangling containers volumes etc
docker system prune
```

To connect to the database within SQLPad during development use the following settings:

```
driver: postgres
host: localhost
database: sqlpad
username: sqlpad
password: sqlpad
```

## License

MIT
