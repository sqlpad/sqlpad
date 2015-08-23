# SqlPad

A Node.js web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server and Vertica.

![SqlPad Query Editor](screenshots/query-editor.png)

SqlPad is meant to be run on an internal network for a single team. All connections added to the app can be used by all individuals with access to the SqlPad server. All queries written can be run and edited by everyone on the server. 

If you want to be bold and daring, you can expose your SqlPad instance to the outside world. Please make sure you fully understand the risks associated with doing this and use SSL.




## Installation & Usage

First, install Node.js and then

```sh
npm install sqlpad -g
```

For more info visit the project page at [http://rickbergfalk.github.io/sqlpad/](http://rickbergfalk.github.io/sqlpad/).

## Configuration

### Change query result record limit
To change the maximum records returned by a SQL query, add a new item with key "queryResultMaxRows" and set the value to the max number of rows you would like returned. If the key is missing or set to a non-number, SqlPad will return a maximum of 50,000 rows.

### Disable CSV download
To disable CSV downloads, visit the "Configuration" page and add a new item with key `allowCsvDownload` and value `false`. If the key is missing or set to any other value, CSV downloads will be enabled.

## Development Setup

If you want to hack on SqlPad, here's a guide as to what my workflow has been like:

First clone or download this repo. Then install dependencies.

```sh
npm install
```

Install nodemon for automatic server restarts when developing

```sh  
npm install nodemon -g
```

Install browserify to compile client-side scripts

```sh
npm install browserify -g
``` 

Optionally install watchify to automatically browserify your client-side scripts

```sh
npm install watchify -g
```

To start the development environment SqlPad on port 3000  with datafiles in ./db run 

```sh
npm start
```

To start SqlPad in a production environment using forever
```sh
npm start --env=prod --db=./db --port=8080
```
Instructions on how to use the forever are in https://github.com/foreverjs/forever


To bundle client-side scripts run 

```sh 
npm run bundle
```

or to auto-browserify as changes happen

```sh
npm run watchify
```



## License 

MIT
