# SQLPad

A web app for writing and running SQL queries and visualizing the results. Supports Postgres, MySQL, SQL Server, Crate, Vertica, and Presto. Written in Node.js.

![SQLPad Query List](http://rickbergfalk.github.io/sqlpad/images/screenshots/queries.png)
![SQLPad Query Editor](http://rickbergfalk.github.io/sqlpad/images/screenshots/query-editor.png)
![SQLPad Chart Editor](http://rickbergfalk.github.io/sqlpad/images/screenshots/chart-line.png)


## Installation and Usage

Visit project page at [http://rickbergfalk.github.io/sqlpad/](http://rickbergfalk.github.io/sqlpad/).

Quickstart: 

```sh
# Assuming node 6 or later is installed
npm install sqlpad -g 
sqlpad --help
```

To update sqlpad installed via npm run 
```sh
npm install sqlpad -g
```


## Development

**Using docker**
```sh
docker-compose run --rm web npm -i
docker-compose up
```

**Locally**
- Clone/download repo
- Install node 6 or later
- Install npm5
- run `npm start` from command line 

At this point you should have both backend and front-end development servers running.

http://localhost:3000 serves react front-end in dev-mode
http://localhost:3010 serves front-end compiled for production

Both front-end/back-end should auto-refresh/auto-reload on file change.

To build front-end production files run `npm run build`.

See [wiki](https://github.com/rickbergfalk/sqlpad/wiki/Development-Guide) for additional development details and project information.


## Tips

If you have highlighted just part of your query, only that part will be executed when you click Run Query.


## License 

MIT
