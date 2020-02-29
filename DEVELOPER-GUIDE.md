# Developer Guide

## Prerequisites

- [Node](https://nodejs.org) installed at v12.0.0+
- Some dependencies may require compilation. On macOS, the Xcode Command Line Tools should be installed. On Ubuntu, `apt-get install build-essential` will install the required packages. Similar commands should work on other Linux distros. Windows will require some additional steps, see the [`node-gyp` installation instructions](https://github.com/nodejs/node-gyp#installation) for details.

## Style Guide

SQLPad uses an automatic code formatter called [Prettier](https://prettier.io/) and a linting tool called ESLint.
Run `npm run lint` after making any changes to code to check formatting and lint. Some formatting and lint may be fixed automatically by running `npm run fixlint`.

If using Visual Studio Code, Prettier and ESLint extensions can be installed to assist in detecting and fixing issues during development.

## Getting Started

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
node server.js --dbPath ../db --port 3010
```

If prefered, SQLPad can be installed as a global module using the local files in this repo. This allows running SQLPad via the cli in any directory, just as if you had installed it with `npm install sqlpad -g`. Note that you must build and copy the client prior to this step.

```sh
cd server
npm install -g

# Now from somewhere else you can run sqlpad like
cd ~
sqlpad --dbPath ../db --port 3010
```

If sqlpad was installed globally via npm from npm, you may need to run `npm uninstall sqlpad -g`.

A docker image may be built using the Dockerfile located in `server` directory. See `docker-publish.sh` for example docker build command.

## Developing

Open 2 terminal sessions in the root of this repo.

In one session run the back end in development mode

```sh
npm start --prefix server
```

In the other start the development server for the front end.

```sh
npm start --prefix client
```

At this point you should have both back end and front end development servers running.

http://localhost:3000 serves React-based frontend in dev-mode  
http://localhost:3010 serves frontend compiled for production

When viewing the front end in development mode, the page will automatically refresh on client file changes. The back end server will auto-restart on back end file changes as well.

When viewing SQLPad in dev-mode in port 3000, some features may not work correctly (like csv/xlsx downloads, google auth). This is likely due to the port difference in configuration (google auth can only redirect to 1 url/port) or the dev-mode proxy setup (React dev mode is served by a secondary web server that will proxy requests it doesn't understand to the SQLPad server running on 3010 during development.)

ESLint and Prettier are used to enforce code patterns and formatting in this project. A precommit hook should enforce and warn about these checks. If that is not set up however you may find these terminal commands useful.

```sh
# To check lint
npm run lint

# To fix (some) errors and formatting automatically
npm run fixlint
```

## Developing on Windows

To run `build/scripts.sh` on Windows, you may want to use an application like [cmder](https://cmder.net/). It will allow you to run `scripts/build.sh` by calling `sh` directly with `sh scripts/build.sh`.

## Mock driver

When SQLPad server is run in debug mode, a mock driver implementation is available to generate data. The data returned by the query run is determined by information parsed from the comment block. The rest of the query may be anything.

Measure fields will contain random data.

```sql
-- At least one dimension field is required. MUST include number of unique values
-- orderdate and orderdatetime should not be used at same time
-- dimensions = department 10, color 10, product 10, orderdate|orderdatetime 500

-- Optional measures
-- measures = cost, revenue, profit

-- Optional order by. MUST be a dimension or measure returned and MUST include direction
-- orderby = department asc, product desc

-- Optional limit
-- limit = 100

SELECT * FROM the_actual_query_doesnt_matter
```

## Releases

SQLPad tries to follow [semantic versioning](https://semver.org/). As an application, this primarily means breaking HTTP API changes, breaking configuration changes, or major UI design changes will result in a major version bump. Minor and patch version bumps will consist of enhancements and fixes.

For all enhancements, core SQLPad functionality should not be altered in any major way unless planned for an upcoming major release.

The primary means of distributing SQLPad is via Docker Hub images. Images are automatically created off of git tags pushed to the repo matching the version format `v<major>.<minor>.<patch>`.

To simplify the creation of package.json version bumps and tag creation, the `scripts/version.sh` may be used to cut a new release. Make updates to `CHANGELOG.md` followed by running `scripts/versions.sh 3.4.5` (or whatever the version number may be).
