# SQLPad

[![Build Status](https://travis-ci.org/rickbergfalk/sqlpad.svg?branch=master)](https://travis-ci.org/rickbergfalk/sqlpad)

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate, Vertica, and Presto. Written in Node.js.

## Heads up! Directory structure will be changing to separate front and back end development

![SQLPad Query List](http://rickbergfalk.github.io/sqlpad/images/screenshots/queries.png)
![SQLPad Query Editor](http://rickbergfalk.github.io/sqlpad/images/screenshots/query-editor.png)
![SQLPad Chart Editor](http://rickbergfalk.github.io/sqlpad/images/screenshots/chart-line.png)

## Installation and Usage

Visit project page at [http://rickbergfalk.github.io/sqlpad/](http://rickbergfalk.github.io/sqlpad/).

## Development

* Clone/download repo
* Install node 6 or later (nvm recommended)
* Install npm5 via `npm i npm -g`
* run `npm start`

At this point you should have both backend and front-end development servers running.

http://localhost:3000 serves react front-end in dev-mode
http://localhost:3010 serves front-end compiled for production

Both front-end/back-end should auto-refresh/auto-reload on file change.

To build front-end production files run `npm run build`.

See [wiki](https://github.com/rickbergfalk/sqlpad/wiki/Development-Guide) for additional development details and project information.

### Databases

A docker-compose file is provided to provide a variety of SQL database services to develop and test against.
To run these, first install docker and then run the following commands:

```sh
# Bring database containers up
docker-compose up
# To bring down
docker-compose down
# To remove dangling containers volumes etc
docker system prune
```

## License

MIT
