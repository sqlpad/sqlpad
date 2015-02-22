var pg = require('pg');
var mysql = require('mysql');
var mssql = require('mssql');
var PgCursor = require('pg-cursor');

module.exports = function runQuery(query, connection, callback) {
    // use the client needed by connection.driver
    clients[connection.driver](query, connection, callback);
};

var clients = {};

clients.mysql = function (query, connection, callback) {
    var myConnection = mysql.createConnection({
        multipleStatements: true,
        host: connection.host,
        port: connection.port ? connection.port : 3306,
        user: connection.username,
        password: connection.password,
        database: connection.database
    });
    myConnection.connect(function (err) {
        if (err) {
            callback(err);
        } else {
            var results = {
                rows: [],
                incomplete: false
            };
            var rowCounter = 0;
            var queryError;
            var continueOn = function () {
                callback(queryError, results);
            };
            
            var myQuery = myConnection.query(query);
            myQuery
                .on('error', function(err) {
                    // Handle error, 
                    // an 'end' event will be emitted after this as well
                    // so we'll call the callback there.
                    queryError = err;
                })
                .on('fields', function(fields) {
                    results.fields = fields;
                })
                .on('result', function(row) {
                    rowCounter++;
                    if (rowCounter <= connection.maxRows) {
                        // if we haven't hit the max yet add row to results
                        results.rows.push(row);
                    } else {
                        // Too many rows! pause that connection. 
                        // It sounds like there is no way to close query stream
                        // you just have to close the connection
                        myConnection.pause();
                        results.incomplete = true;
                        continueOn(); // return records to client before closing connection
                        myConnection.end();
                    }
                })
                .on('end', function() {
                    // all rows have been received
                    // This will not fire if we end the connection early
                    continueOn();
                    myConnection.end();
                });
        }
    });
};


clients.postgres = function (query, connection, callback) {
    var connectionUrl = "postgres://" + connection.username
        + ":" + connection.password
        + "@" + connection.host
        + (connection.port ? ':' + connection.port : '')
        + "/" + connection.database;

    var client = new pg.Client(connectionUrl);
    client.connect(function (err) {
        if (err) {
            callback(err);
            client.end();
        } else {
            var results = {
                rows: [],
                incomplete: false
            };
            var cursor = client.query(new PgCursor(query));
            // read the first 20,000 rows from this cursor
            // This will be configurable if people need more records for some reason
            cursor.read(connection.maxRows + 1, function(err, rows) {
                if (err) {
                    //cursor error - release the client
                    //normally you'd do app-specific error handling here
                    console.log(err);
                    callback(err);
                    client.end();
                } else {
                    results.rows = rows;
                    if (rows.length === connection.maxRows + 1) { 
                        results.incomplete = true;
                        results.rows.pop(); // get rid of that extra record. we only get 1 more than the max to see if there would have been more...
                    }
                    callback(err, results);
                    cursor.close(function(err) {
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
    var sqlconfig = {
        user: connection.username,
        password: connection.password,
        server: connection.host,
        port: connection.port ? connection.port : 1433,
        database: connection.database,
        stream: true,
        requestTimeout: 1000 * 60 * 60 // one hour
    };
    var mssqlConnection = new mssql.Connection(sqlconfig, function (err) {
        if (err) {
            callback(err);
        } else {
            var results = {
                rows: [],
                incomplete: false
            };
            var rowCounter = 0;
            var queryError;
            var resultsSent = false;
            var tooManyHandled = false;
            
            // For SQL Server, this can be called more than once safely
            var continueOn = function () {
                if (!resultsSent) {
                    resultsSent = true; 
                    callback(queryError, results);
                }
            };
            
            var request = new mssql.Request(mssqlConnection);
            request.query(query);
            request.on('recordset', function(columns) {
                // Emitted once for each recordset in a query
                results.columns = columns;
            });
        
            request.on('row', function(row) {
                // Emitted for each row in a recordset
                rowCounter++;
                if (rowCounter <= connection.maxRows) {
                    // if we haven't hit the max yet add row to results
                    results.rows.push(row);
                } else {
                    if (!tooManyHandled) {
                        tooManyHandled = true;
                        // Too many rows! 
                        results.incomplete = true;
                        continueOn(); 
                        console.log("Row limit hit - Attempting to cancel query...");
                        request.cancel(); // running this will yeild a cancel error
                    }
                }
            });
        
            request.on('error', function(err) {
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
        
            request.on('done', function(returnValue) {
                // Always emitted as the last one
                continueOn();
                mssqlConnection.close(); // I don't think this does anything using the tedious driver. but maybe someday it will
            });
        }
    });
};

clients.vertica = function (query, connection, callback) {

    var connectionUrl = "postgres://" + connection.username
        + ":" + connection.password
        + "@" + connection.host
        + (connection.port ? ':' + connection.port : '')
        + "/" + connection.database;

    var client = new pg.Client(connectionUrl);
    client.connect(function (err) {
        if (err) {
            callback(err);
            client.end();
        } else {
            var results = {
                rows: [],
                incomplete: false
            };
            var cursor = client.query(new PgCursor(query));
            // read the first 20,000 rows from this cursor
            // This will be configurable if people need more records for some reason
            cursor.read(connection.maxRows + 1, function(err, rows) {
                if (err) {
                    //cursor error - release the client
                    //normally you'd do app-specific error handling here
                    console.log(err);
                    callback(err);
                    client.end();
                } else {
                    results.rows = rows;
                    if (rows.length === connection.maxRows + 1) { 
                        results.incomplete = true;
                        results.rows.pop(); // get rid of that extra record. we only get 1 more than the max to see if there would have been more...
                    }
                    callback(err, results);
                    cursor.close(function(err) {
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
