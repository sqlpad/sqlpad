var runQuery = require('../lib/run-query.js');
var json2csv = require('json2csv');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var sanitize = require("sanitize-filename");
var moment = require('moment');
var xlsx = require('node-xlsx');
var router = require('express').Router();
var config = require('../lib/config.js');
var db = require('../lib/db.js');
var decipher = require('../lib/decipher.js');
var Connection = require('../models/Connection.js');

const DB_PATH = config.get('dbPath');

function isNumberLike(n) {
    return (!isNaN(parseFloat(n)) && isFinite(n));
}

router.post('/run-query', 
    getConnection, 
    updateCache,
    execRunQuery,
    getMetaData,
    downloadCheck,
    createXlsxDownload,
    createCsvDownload,
    sendResults
);

function getConnection (req, res, next) {
    Connection.findOneById(req.body.connectionId, function (err, connection) {
        if (err) {
            return res.send({
                success: false,
                error: err.toString()
            });
        }
        if (!connection) {
            return res.send({
                success: false,
                error: "Please choose a connection!"
            });
        } 
        connection.maxRows = Number(config.get('queryResultMaxRows'));
        connection.username = decipher(connection.username);
        connection.password = decipher(connection.password);
        res.locals.connection = connection;
        next();
    });
}

function updateCache (req, res, next) {
    var connection = res.locals.connection;
    var now = new Date();
    var expirationDate = new Date(now.getTime() + (1000 * 60 * 60 * 8)); // 8 hours in the future.
    var cache = {
        cacheKey: req.body.cacheKey,
        expiration: expirationDate,
        queryName: sanitize((req.body.queryName || "SqlPad Query Results") + " " + moment().format("YYYY-MM-DD"))
    };
    res.locals.cache = cache;
     // upsert cacheKey if it doesn't exist, setting new expiration time
    db.cache.update({cacheKey: cache.cacheKey}, cache, {upsert: true}, function (err) {
        if (err) console.log(err);
        next();
    });
}

function execRunQuery (req, res, next) {
    var connection = res.locals.connection;
    res.locals.start = new Date();
    runQuery(req.body.queryText, connection, function (err, results) {
        res.locals.end = new Date();
        if (err) {
            console.log(err.toString());
            return res.send({
                success: false,
                error: err.toString()
            });
        }
        res.locals.results = results; 
        next();
    });
}

function getMetaData (req, res, next) {
    // this meta data will be used by the UI to format data appropriately
    // it will also be used to determine columns for basic data visuals
    /*
    {
        fieldname: {
            datatype: 'date',        // or 'number' or 'string'
            max: 42 ,                // if a number, max is present
            min: 1                   // available if number
        }
    }
    */
    var results = res.locals.results;
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
    res.locals.fields = fields;
    res.locals.meta = meta;
    next();
}

function downloadCheck (req, res, next) {
    const ALLOW_CSV_DOWNLOAD = config.get('allowCsvDownload');
    if (ALLOW_CSV_DOWNLOAD) {
        next();
    } else {
        var results = res.locals.results;
        var fields = res.locals.fields;
        var meta = res.locals.meta;
        return res.send({
            success: true,
            serverMs: res.locals.end - res.locals.start,
            meta: meta,
            results: results.rows,
            incomplete: results.incomplete
        });
    }
}

function createXlsxDownload (req, res, next) {
    var results = res.locals.results;
    var fields = res.locals.fields;
    var meta = res.locals.meta;
    var cache = res.locals.cache;
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
    var xlsxBuffer = xlsx.build([{name: "query-results", data: resultArray}]); // returns a buffer 
    var xlsxPath = path.join(DB_PATH, "/cache/", cache.cacheKey + ".xlsx");
    fs.writeFile(xlsxPath, xlsxBuffer, function (err) {
        if (err) {
            console.log(err);
            // continue on despite error. 
            // we can still send results even if download file failed to create 
        }
        next();
    });
}

function createCsvDownload (req, res, next) {
    var results = res.locals.results;
    var fields = res.locals.fields;
    var cache = res.locals.cache;
    json2csv({data: results.rows, fields: fields}, function (err, csv) {
        if (err) {
            console.log(err);
            return next();
        }
        var csvPath = path.join(DB_PATH, "/cache/", cache.cacheKey + ".csv");
        fs.writeFile(csvPath, csv, function (err) {
            if (err) console.log(err);
            return next();
        });
    });
}

function sendResults (req, res) {
    var results = res.locals.results;
    var meta = res.locals.meta;
    var cache = res.locals.cache;
    res.send({
        success: true,
        serverMs: res.locals.end - res.locals.start,
        meta: meta,
        results: results.rows,
        incomplete: results.incomplete,
        csvUrl: '/query-results/' + cache.cacheKey + '.csv'
    });     
}

module.exports = router;