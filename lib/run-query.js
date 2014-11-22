var pg = require('pg.js'); 
var mysql = require('mysql');
var mssql = require('mssql');

module.exports = function runQuery (query, connection, callback) {
    // use the client needed by connection.driver
    clients[connection.driver] (query, connection, callback);
};

var clients = {};

clients.mysql = function (query, connection, callback) {
    var myConnection = mysql.createConnection({
        multipleStatements: true,
        host: connection.host,
        user: connection.username,
        password: connection.password,
        database: connection.database
    });
    myConnection.connect(function (err) {
        if (err) {
            callback(err);
        } else {
            myConnection.query(query, function (err, rows, fields) {
                if (err) {
                    callback(err);
                    myConnection.end();
                    /*
                    myConnection.end(function (err) {
                        universalClient.connected = false;
                        endCallback(err);
                    })
                    */
                } else {
                    var results = {};
                    if (rows) results.rows = rows;
                    if (fields) results.fields = fields;
                    callback(err, results);
                    myConnection.end();
                }
            });
        }
    });
};


clients.postgres = function (query, connection, callback) {
    var connectionUrl = "tcp://" + connection.username 
                      + ":" + connection.password
                      + "@" + connection.host
                      + "/" + connection.database;
                      
    var client = new pg.Client(connectionUrl);
    client.connect(function (err) {
        if (err) {
            callback(err);
            client.end();
        } else {
            client.query(query, function(err, result) {
                callback(err, result);
                client.end();
            });
        }
    });
};

clients.sqlserver = function (query, connection, callback) {
    var sqlconfig = {
        user: connection.username,
        password: connection.password,
        server: connection.host,
        database: connection.database,
        requestTimeout: 1000 * 60 * 60 // one hour
    };
    mssql.connect(sqlconfig, function (err) {
        if (err) {
            callback(err);
            // TODO: can we end? stole this from postgrator and at the time I said we cant
        } else {
            var request = new mssql.Request();
            request.query(query, function (err, result) {
                callback(err, {rows: result});
                // TODO: end?
            }); 
        }
    });
};