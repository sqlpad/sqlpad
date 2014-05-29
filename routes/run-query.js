var runQuery = require('../lib/run-query.js');
var json2csv = require('json2csv');
var fs = require('fs');
var path = require('path');

module.exports = function (app) {
    
    var db = app.get('db');
    var decipher = app.get('decipher');
    
    app.post('/run-query', function (req, res) {
        //TODO: log usage stuff about it to the query db?
        db.connections.findOne({_id: req.body.connectionId}, function (err, connection) {
            if (err) {
                res.send({
                    success: false,
                    error: err.toString()
                });
            } else if (!connection) {
                res.send({
                    success: false,
                    error: "Please choose a connection!"
                });
            } else {
                connection.username = decipher(connection.username);
                connection.password = decipher(connection.password);
                var now = new Date();
                var expirationDate = new Date(now.getTime() + (1000 * 60 * 60 * 8)); // 8 hours in the future.
                var cache = {
                    cacheKey: req.body.cacheKey,
                    expiration: expirationDate
                };
                // upsert cacheKey if it doesn't exist, setting new expiration time
                db.cache.update({cacheKey: cache.cacheKey}, cache, {upsert: true}, function (err) {
                    if (err) console.log(err);
                    var start = new Date();
                    runQuery(req.body.queryText, connection, function (err, results) {
                        var end = new Date();
                        if (err) {
                            console.log(err.toString());
                            res.send({
                                success: false,
                                error: err.toString()
                            });
                        } else {
                            var fields = [];
                            for (var key in results.rows[0]) {
                                fields.push(key);
                            }
                            json2csv({data: results.rows, fields: fields}, function (err, csv) {
                                if (err) {
                                    console.log(err);
                                    res.send({
                                        success: true,
                                        serverMs: end - start,
                                        results: results.rows
                                    });
                                } else {
                                    var csvPath = path.join(app.get('dbPath'), "/cache/", cache.cacheKey + ".csv");
                                    fs.writeFile(csvPath, csv, function (err) {
                                        if (err) console.log(err);
                                        res.send({
                                            success: true,
                                            serverMs: end - start,
                                            results: results.rows,
                                            csvUrl: '/query-results/' + cache.cacheKey + '.csv'
                                        });
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
    });
};