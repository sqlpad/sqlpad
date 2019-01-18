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

## Building

- Clone/download this repo
- Install node 8 or later ([nvm recommended](https://github.com/creationix/nvm))
- Ensure you have the latest npm

  ```sh
  npm install npm -g
  ```

- Install dependencies and build the UI

  ```sh
  scripts/build.sh
  ```

At this point you can run the SQLPad server with the frontend built for production use:

```sh
cd server
node server.js --dir ../db --port 3010 --base-url '/sqlpad'
```

If prefered, SQLPad can be installed as a global module using the local files in this repo. This allows running SQLPad via the cli in any directory, just as if you had installed it with `npm install sqlpad -g`

```sh
cd server
node install -g

# Now from somewhere else you can run sqlpad like
cd ~
sqlpad --dir ../db --port 3010 --base-url '/sqlpad'
```

A docker image may be built using the Dockerfile located in `server` directory. See `docker-publish.sh` for example docker build command.

## Development

- Clone/download this repo
- Install node 8 or later ([nvm recommended](https://github.com/creationix/nvm))
- Ensure you have the latest npm

  ```sh
  npm install npm -g
  ```

- Install dependencies and build the UI

  ```sh
  scripts/build.sh
  ```

- Open 2 terminal sessions in the root of this repo.

  In one install the backend dependencies and start the development server

  ```sh
  npm start --prefix server
  ```

  In the other install frontend dependencies and start the devleopment server

  ```sh
  npm start --prefix client
  ```

At this point you should have both backend and frontend development servers running.

http://localhost:3000 serves React-based frontend in dev-mode  
http://localhost:3010 serves frontend compiled for production

When viewing the frontend in development mode, the page will automatically refresh on frontend file change. The backend server will auto-restart on backend file change.

ESLint and Prettier are used to enforce code patterns and formatting in this project. A precommit hook should enforce and warn about these checks. If that is not set up however you may find these terminal commands useful.

```sh
# To check lint
npm run lint

# To fix (some) errors and formatting automatically
npm run fixlint
```

### Optional step

A docker-compose file with is provided to provide an empty postgres database to test with.
If you have docker installed, in a third terminal session you can do the following:

```sh
# Bring database containers up in background
docker-compose up

# control-c will stop the databases in docker compose

# If you would like to run this in the background, run
docker-compose up -d

# To bring database down from background
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
