# Getting Started

Thinking SQLPad is for you? Here's a quick rundown of what you'll want to know.

## Running SQLPad

There are 2 options to run SQLPad: Install [Node.js](https://nodejs.org/) and [build and run SQLPad from the git repository](https://github.com/rickbergfalk/sqlpad/blob/master/DEVELOPER-GUIDE.md), or use the [docker images on Docker Hub](https://hub.docker.com/r/sqlpad/sqlpad/).

SQLPad does not require any additional servers other than its own self. It uses its own embedded database stored on the local file system (which makes it easy to run, but not so easy to scale up). Today the database is a mix of [nedb](https://github.com/louischatriot/nedb) and [SQLite](https://www.sqlite.org/index.html), with the intention of moving all data into SQLite.

(Experimental) You can replace the SQLite database with an external database, using the `SQLPAD_BACKEND_DB_URI` environment variable.

The docker image runs on port 3000 by default and stores its local database files at `/var/lib/sqlpad`. See [docker-examples](https://github.com/rickbergfalk/sqlpad/tree/master/docker-examples) directory for example docker-compose setup with SQL Server.

## Updating SQLPad

!> Take a backup prior to updating SQLPad

SQLPad runs its own migrations at application start. Updating SQLPad should just be a matter of pulling the latest code or Docker image, and running it.

Prior to updating, you should take a backup of SQLPad's database files. These are located under the path specified by configuration variable `dbPath` or environment variable `SQLPAD_DB_PATH`. In the past these files used to default to the users home directory under `~/sqlpad/db`. In the official docker image, this path is set to `/var/lib/sqlpad`.

## Releases

SQLPad tries to follow semantic versioning. As an application, this primarily means breaking HTTP API changes, breaking configuration changes, or major UI design changes will result in a major version bump. Minor and patch version bumps will consist of enhancements and fixes.

The `latest` tag on Docker Hub is continously built from latest commit from the `master` branch in GitHub. Do not use it unless you are okay experiencing a work-in-progress. (It should be functional, it just may not be stable or final.)

## Terminology

### Connections

A `Connection` in SQLPad is a configuration to a specific database instance. Other BI software may call these "data sources". A connection may involve a connection string, user credentials, host, port, etc. The data required by a connection depends on the database driver it uses to connect to the target database.

When a user write's a query, they'll pick a connection to use to run it. This connection choice will also be saved with the query.

Admins can create connections in the UI, but connections can also be created in a JSON or INI config file, via a complicated environment variable convention, or via experimental seed data files.

### Driver

SQLPad connections use various drivers to connect to a target database. Prior to the addition of ODBC support, SQLPad required a wrapping each database driver separately, as each implementation was slightly different. In SQLPad there is a Postgres driver and a MySQL driver. There is also an ODBC driver, _which requires its own additional drivers_ to be able to connect to the target database.

### Query

A `Query` in SQLPad terms is a SQL document, generally containing a single SELECT statement. It may contain multiple statements, but your mileage will vary depending on the database driver in use. Some driver implementations handle this, others don't.

### User

SQLPad has its own database of users that are allowed to access the system. These user records are stored and maintained regardless of authentication strategy used. Today the primary use of the user record is to track a user's permissions via the role they are assigned, and provide an identifier queries and connection access can be tied to.

## User Management

SQLPad users are one of two roles today: `Admin` and `Editor`.

`Admin` users administrators of the system, and generally can do anything that is possible in the system. Connection access restrictions and query sharing do not apply to them, and they can see everything. Admins are the only users allowed to create connections via the UI, assign connection access, and add new users.

`Editor` users are basic users that can create, run, and edit queries. As of version `4.2.0` (which is under development), all queries created are private to the user that created them, unless the user shares the query with other users on the platform. Editors cannot create their own connections or add users to the SQLPad instance.
