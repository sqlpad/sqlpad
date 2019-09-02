# SQLPad

[![Build Status](https://travis-ci.org/rickbergfalk/sqlpad.svg?branch=master)](https://travis-ci.org/rickbergfalk/sqlpad)

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate, Vertica, Presto, and SAP HANA. Other databases potentially supported via [unix odbc support](https://github.com/rickbergfalk/sqlpad/wiki/ODBC).

![SQLPad Query Editor](https://rickbergfalk.github.io/sqlpad/images/screenshots/v3-beta.png)

## Docker Image

The docker image runs on port 3000 and uses `/var/lib/sqlpad` for the embedded database directory.

For configuration exposed via environment variables reference [CONFIGURATION.md](https://github.com/rickbergfalk/sqlpad/blob/master/CONFIGURATION.md).

See [docker-examples](https://github.com/rickbergfalk/sqlpad/tree/master/docker-examples) directory for example docker-compose setup with SQL Server.

## Building

- Install node 10 or later
- Clone/download this repo
- Install dependencies and build the UI

  ```sh
  scripts/build.sh
  ```

  The gist of this script is:

  ```sh
  # install root level dependencies using package-lock.json as reference
  npm ci
  # install front-end dependencies using package-lock.json
  cd client
  npm ci
  # build front-end
  npm run build
  # install back-end dependencies
  cd ../server
  npm ci
  cd ..
  # copy client build to server directory
  mkdir server/public
  cp -r client/build/* server/public
  ```

At this point you can run the SQLPad server with the front-end built for production use:

```sh
cd server
node server.js --dir ../db --port 3010
```

If prefered, SQLPad can be installed as a global module using the local files in this repo. This allows running SQLPad via the cli in any directory, just as if you had installed it with `npm install sqlpad -g`. Note that you must build and copy the client prior to this step.

```sh
cd server
node install -g

# Now from somewhere else you can run sqlpad like
cd ~
sqlpad --dir ../db --port 3010
```

A docker image may be built using the Dockerfile located in `server` directory. See `docker-publish.sh` for example docker build command.

## Configuration

[CONFIGURATION.md](CONFIGURATION.md)

## Development

[Developer guide](DEVELOPER-GUIDE.md)

## License

MIT
