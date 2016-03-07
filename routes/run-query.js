var runQuery = require('../lib/run-query.js');
var json2csv = require('json2csv');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var sanitize = require("sanitize-filename");
var moment = require('moment');
var xlsx = require('node-xlsx');

function isNumberLike(n) {
    return (!isNaN(parseFloat(n)) && isFinite(n));
}

module.exports = function (app, router) {

    var db = app.get('db');
    var decipher = app.get('decipher');

    router.post('/run-query', function (req, res) {
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
                // figure out max rows for the connection if it exists
                db.config.findOne({key: "queryResultMaxRows"}, function (err, config) {
                    if (err) {
                        console.log(err);
                    }
                    if (config && Number(config.value)) {
                        connection.maxRows = Number(config.value);
                    } else {
                        connection.maxRows = 50000;
                    }

                    connection.username = decipher(connection.username);
                    connection.password = decipher(connection.password);
                    var now = new Date();
                    var expirationDate = new Date(now.getTime() + (1000 * 60 * 60 * 8)); // 8 hours in the future.
                    var cache = {
                        cacheKey: req.body.cacheKey,
                        expiration: expirationDate,
                        queryName: sanitize((req.body.queryName || "SqlPad Query Results") + " " + moment().format("YYYY-MM-DD"))
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

                                // get meta data
                                // this meta data will be used by the UI to format data appropriately
                                // it will also be used to determine columns for basic data visuals
                                /**
                                 {
                                     fieldname: {
                                         datatype: 'date',        // or 'number' or 'string'
                                         max: 42 ,                // if a number, max is present
                                         min: 1                   // available if number
                                     }
                                 }
                                 */
                                var fields = [];
                                var meta = {};
                                for (var r = 0; r < results.rows.length; r++) {
                                    var row = results.rows[r];
                                    _.forOwn(row, function (value, key) {
                                        // if this is first row, record fields in fields array
                                        if (r === 0) fields.push(key);
                                        if (!meta[key]) meta[key] = {
                                            datatype: null,
                                            max: null,
                                            min: null,
                                            maxValueLength: 0
                                        };

                                        // if we don't have a data type and we have a value yet lets try and figure it out
                                        if (!meta[key].datatype && value) {
                                            if (_.isDate(value)) meta[key].datatype = 'date';
                                            else if (isNumberLike(value)) meta[key].datatype = 'number';
                                            else if (_.isString(value)) {
                                                meta[key].datatype = 'string';
                                                if (meta[key].maxValueLength < value.length) meta[key].maxValueLength = value.length;
                                            }
                                        }
                                        // if we have a value and are dealing with a number or date, we should get min and max
                                        if (
                                            value
                                            && (meta[key].datatype === 'number' || meta[key].datatype === 'date')
                                            && (isNumberLike(value) || _.isDate(value))
                                        ) {
                                            // if we haven't yet defined a max and this row contains a number
                                            if (!meta[key].max) meta[key].max = value;
                                            // otherwise this field in this row contains a number, and we should see if its bigger
                                            else if (value > meta[key].max) meta[key].max = value;
                                            // then do the same thing for min
                                            if (!meta[key].min) meta[key].min = value;
                                            else if (value < meta[key].min) meta[key].min = value;
                                        }
                                        // if the datatype is number-like, 
                                        // we should check to see if it ever changes to a string
                                        // this is hacky, but sometimes data will be 
                                        // a mix of number-like and strings that aren't number like
                                        // in the event that we get some data that's NOT NUMBER LIKE, 
                                        // then we should *really* be recording this as string
                                        if (meta[key].datatype === 'number' && value) {
                                            if (!isNumberLike(value)) {
                                                meta[key].datatype = 'string';
                                                meta[key].max = null;
                                                meta[key].min = null;
                                            }
                                        }
                                    });
                                }

                                db.config.findOne({key: "allowCsvDownload"}, function (err, config) {
                                    var preventDownload = config && config.value === "false";
                                    if (!preventDownload) {
                                        
                                        // loop through rows and build out an array of arrays
                                        var resultArray = [];
                                        resultArray.push(fields);
                                        for (var i = 0; i < results.rows.length; i++) {
                                            var row = [];
                                            for (var c = 0; c < fields.length; c++) {
                                                var fieldName = fields[c];
                                                row.push(results.rows[i][fieldName]);
                                            }
                                            resultArray.push(row);
                                        }
                                        
                                        // build out and write xlsx file
                                        var xlsxBuffer = xlsx.build([{name: "query-results", data: resultArray}]); // returns a buffer 
                                        var xlsxPath = path.join(app.get('dbPath'), "/cache/", cache.cacheKey + ".xlsx");
                                        fs.writeFile(xlsxPath, xlsxBuffer, function (err) {
                                            if (err) {
                                                console.log(err);
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
                                                            meta: meta,
                                                            results: results.rows,
                                                            incomplete: results.incomplete,
                                                            csvUrl: '/query-results/' + cache.cacheKey + '.csv'
                                                        });
                                                    });
                                                }
                                            });
                                        });
                                        
                                    } else {
                                        res.send({
                                            success: true,
                                            serverMs: end - start,
                                            meta: meta,
                                            results: results.rows,
                                            incomplete: results.incomplete
                                        });
                                    }
                                });
                            }
                        });
                    }); // end db cache update
                }); // end db config find one
            }
        });
    });
};
