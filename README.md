# SqlPad

A Node.js web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, and SQL Server.

![SqlPad Query Editor](screenshots/query-editor.png)

SqlPad is meant to be run on an internal network for a single team. All connections added to the app can be used by all individuals with access to the SqlPad server. All queries written can be run and edited by everyone on the server. 

If you want to be bold and daring, you can expose your SqlPad instance to the outside world. Please make sure you fully understand the risks associated with doing this and use SSL.




## Installation & Usage

First, install Node.js and then

```sh
npm install sqlpad -g
```

For more info visit the project page at [http://rickbergfalk.github.io/sqlpad/](http://rickbergfalk.github.io/sqlpad/).



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

To start SqlPad on port 3000  with datafiles in ./db run 

```sh
npm start
```

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
