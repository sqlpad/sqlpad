# Developer Guide

Follow build guide in README to install dependencies and build an initial build. Once complete, Open 2 terminal sessions in the root of this repo.

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

### Mock driver

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
