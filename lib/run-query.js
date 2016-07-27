var pg = require('pg');
var mysql = require('mysql');
var mssql = require('mssql');
var PgCursor = require('pg-cursor');
var vertica = require('vertica');
var crate = require('node-crate');
var config = require('./config.js');
var QueryResult = require('../models/QueryResult.js');

module.exports = function runQuery(query, connection, callback) {
    var startTime = new Date();
    // use the client needed by connection.driver
    clients[connection.driver](query, connection, function (err, results) {
        if (config.get("debug")) {
            var endTime = new Date();
            var resultRowCount = (results && results.rows && results.rows.length ? results.rows.length : 0);
            console.log("\n--- lib/run-query.js ---");
            console.log("CONNECTION: " + connection.name);
            console.log("START TIME: " + startTime.toISOString());
            console.log("END TIME: " + endTime.toISOString());
            console.log("ELAPSED MS: " + (endTime - startTime));
            console.log("RESULT ROWS: " + resultRowCount);
            console.log("QUERY: ");
            console.log(query);
            console.log();
        }
        callback(err, results);
    });
};

var clients = {};

clients.mysql = function (query, connection, callback) {
    var queryResult = new QueryResult();
    var myConnection = mysql.createConnection({
        multipleStatements: true,
        host: connection.host,
        port: connection.port ? connection.port : 3306,
        user: connection.username,
        password: connection.password,
        database: connection.database,
        insecureAuth: connection.mysqlInsecureAuth
    });
    myConnection.connect(function (err) {
        if (err) {
            callback(err);
        } else {
            var rowCounter = 0;
            var queryError;
            var resultsSent = false;
            function continueOn () {
                if (!resultsSent) {
                    resultsSent = true;
                    callback(queryError, queryResult);
                }
            };
            var myQuery = myConnection.query(query);
            myQuery
                .on('error', function (err) {
                    // Handle error, 
                    // an 'end' event will be emitted after this as well
                    // so we'll call the callback there.
                    queryError = err;
                })
                .on('result', function (row) {
                    rowCounter++;
                    if (rowCounter <= connection.maxRows) {
                        // if we haven't hit the max yet add row to results
                        queryResult.addRow(row);
                    } else {
                        // Too many rows! pause that connection. 
                        // It sounds like there is no way to close query stream
                        // you just have to close the connection
                        myConnection.pause();
                        queryResult.incomplete = true;
                        continueOn(); // return records to client before closing connection
                        myConnection.end();
                    }
                })
                .on('end', function () {
                    // all rows have been received
                    // This will not fire if we end the connection early
                    continueOn();
                    myConnection.end();
                });
        }
    });
};

// TODO - crate driver should honor max rows restriction
clients.crate = function(query, connection, callback) {
    var queryResult = new QueryResult();
    var crateConfig = {
        host: connection.host
    };
    if (connection.port) {
        crate.connect(crateConfig.host, connection.port);
    } else {
        crate.connect(crateConfig.host);
    }
    query = query.replace(/\;$/, '');
    crate.execute(query).success(function (res) {
        var results = {
            rows: [],
            fields: []
        }
        for (row in res.rows) {
            results.rows[row] = {};
            for(val in res.rows[row]) {
                col_name = res.cols[val];
                type = res.col_types[val];
                val = res.rows[row][val];
                if ( type === 11) {
                    val = new Date(val);
                }
                results.rows[row][col_name] = val;
                results.fields[row] = col_name;
            }
        }
        queryResult.addRows(results.rows);
        callback(null, queryResult);
    }).error(function(err) {
        callback(err.message);
    });
}


clients.postgres = function (query, connection, callback) {
    var queryResult = new QueryResult();
    var pgConfig = {
        user: connection.username,
        password: connection.password,
        database: connection.database,
        host: connection.host,
        ssl: connection.postgresSsl
    };
    if (connection.port) pgConfig.port = connection.port;
    
    var client = new pg.Client(pgConfig);
    client.connect(function (err) {
        if (err) {
            callback(err);
            client.end();
        } else {
            var cursor = client.query(new PgCursor(query));
            cursor.read(connection.maxRows + 1, function (err, rows) {
                if (err) {
                    // pg_cursor can't handle multi-statements at the moment
                    // as a work around we'll retry the query the old way, but we lose the  maxRows protection
                    client.query(query, function (err, result) {
                        queryResult.addRows(result.rows);
                        callback(err, queryResult);
                        client.end();
                    });
                } else {
                    queryResult.addRows(rows);
                    if (rows.length === connection.maxRows + 1) {
                        queryResult.incomplete = true;
                        queryResult.rows.pop(); // get rid of that extra record. we only get 1 more than the max to see if there would have been more...
                    }
                    callback(err, queryResult);
                    cursor.close(function (err) {
                        if (err) {
                            console.log("error closing pg-cursor:");
                            console.log(err);
                        }
                        client.end();
                    });
                }
            });
        }
    });
};

clients.sqlserver = function (query, connection, callback) {
    var queryResult = new QueryResult();
    var sqlconfig = {
        user: connection.username,
        password: connection.password,
        server: connection.host,
        port: connection.port ? connection.port : 1433,
        database: connection.database,
        stream: true,
        requestTimeout: 1000 * 60 * 60, // one hour
        options: {
            encrypt: connection.sqlserverEncrypt
        }
    };
    var mssqlConnection = new mssql.Connection(sqlconfig, function (err) {
        if (err) {
            callback(err);
        } else {
            var rowCounter = 0;
            var queryError;
            var resultsSent = false;
            var tooManyHandled = false;

            // For SQL Server, this can be called more than once safely
            var continueOn = function () {
                if (!resultsSent) {
                    resultsSent = true;
                    callback(queryError, queryResult);
                }
            };

            var request = new mssql.Request(mssqlConnection);
            request.query(query);

            request.on('row', function (row) {
                // Emitted for each row in a recordset
                rowCounter++;
                if (rowCounter <= connection.maxRows) {
                    // if we haven't hit the max yet add row to results
                    queryResult.addRow(row);
                } else {
                    if (!tooManyHandled) {
                        tooManyHandled = true;
                        // Too many rows! 
                        queryResult.incomplete = true;
                        continueOn();
                        console.log("Row limit hit - Attempting to cancel query...");
                        request.cancel(); // running this will yeild a cancel error
                    }
                }
            });

            request.on('error', function (err) {
                // May be emitted multiple times
                // for now I guess we just set queryError to be the most recent error?
                if (err.code === "ECANCEL") {
                    console.log("Query cancelled successfully");
                } else {
                    console.log("mssql query error:");
                    console.log(err);
                    queryError = err;
                }
            });

            request.on('done', function (returnValue) {
                // Always emitted as the last one
                continueOn();
                mssqlConnection.close(); // I don't think this does anything using the tedious driver. but maybe someday it will
            });
        }
    });
};

clients.vertica = function (query, connection, callback) {
    var queryResult = new QueryResult();
    var params = {
        host: connection.host,
        port: connection.port ? connection.port : 5433,
        user: connection.username,
        password: connection.password,
        database: connection.database
    };
    var client = vertica.connect(params, function (err) {
        if (err) {
            callback(err);
            client.disconnect();
        } else {
            var finished = false,
                rowCounter = 0,
                fields = [],
                results = {
                    rows: [],
                    incomplete: false
                };

            var verticaQuery = client.query(query);

            verticaQuery.on('fields', function (f) {
                for (var i in f) {
                    if (f.hasOwnProperty(i)) {
                        fields.push(f[i]['name']);
                    }
                }
            });

            verticaQuery.on('row', function (row) {
                if (rowCounter < connection.maxRows) {
                    var resultRow = {};
                    for (var item in row) {
                        if (row.hasOwnProperty(item)) {
                            resultRow[fields[item]] = row[item];
                        }
                    }
                    queryResult.addRow(resultRow);
                    rowCounter++;
                } else {
                    if (!finished) {
                        finished = true;
                        client.disconnect();
                        queryResult.incomplete = true;
                        callback(err, queryResult);
                    }
                }
            });

            verticaQuery.on('end', function () {
                if (!finished) {
                    finished = true;
                    client.disconnect();
                    callback(err, queryResult);
                }
            });

            verticaQuery.on('error', function (err) {
                if (!finished) {
                    finished = true;
                    client.disconnect();
                    callback(err, queryResult);
                }
            });
        }
    });
};
