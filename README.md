# SQLPad

[![Build Status](https://travis-ci.org/rickbergfalk/sqlpad.svg?branch=master)](https://travis-ci.org/rickbergfalk/sqlpad)

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate, Vertica, and Presto. Written in Node.js.

![SQLPad Query Editor](http://rickbergfalk.github.io/sqlpad/images/screenshots/query-editor.png)

## Installation, Usage, Screenshots

Visit project page at [http://rickbergfalk.github.io/sqlpad/](http://rickbergfalk.github.io/sqlpad/).

## Using Docker Image

The docker image runs on port 3000 and uses `/var/lib/sqlpad` for the embedded database directory.

Some configuration is exposed via environment variables. See [configItems.js](https://github.com/rickbergfalk/sqlpad/blob/master/server/lib/config/configItems.js) for details on environment variables considered (`envVar` field).

See [docker-validation](https://github.com/rickbergfalk/sqlpad/tree/master/docker-validation) folder for example docker-compose setup with SQL Server.

## Heads up! There will be quite a bit of refactoring over next few months.

## Development

* Clone/download repo
* Install node 6 or later (nvm recommended)
* Install npm5 via `npm i npm -g`
* Install npm modules by running `npm install`
* run `npm start`

At this point you should have both backend and front-end development servers running.

http://localhost:3000 serves react front-end in dev-mode
http://localhost:3010 serves front-end compiled for production

Both front-end/back-end should auto-refresh/auto-reload on file change.

To build front-end production files run `npm run build`.

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
