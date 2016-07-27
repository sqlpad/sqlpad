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

router.post('/run-query', 
    getConnection, 
    updateCache,
    execRunQuery,
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
    runQuery(req.body.queryText, connection, function (err, queryResult) {
        if (err) {
            console.log(err.toString());
            return res.send({
                success: false,
                error: err.toString()
            });
        }
        res.locals.queryResult = queryResult;
        res.locals.end = new Date();
        next();
    });
}

function downloadCheck (req, res, next) {
    const ALLOW_CSV_DOWNLOAD = config.get('allowCsvDownload');
    if (ALLOW_CSV_DOWNLOAD) {
        next();
    } else {
        var queryResult = res.locals.queryResult;
        return res.send({
            success: true,
            serverMs: res.locals.end - res.locals.start,
            meta: queryResult.meta,
            results: queryResult.rows,
            incomplete: queryResult.incomplete
        });
    }
}

function createXlsxDownload (req, res, next) {
    var queryResult = res.locals.queryResult;
    var cache = res.locals.cache;
    // loop through rows and build out an array of arrays
    var resultArray = [];
    resultArray.push(queryResult.fields);
    for (var i = 0; i < queryResult.rows.length; i++) {
        var row = [];
        for (var c = 0; c < queryResult.fields.length; c++) {
            var fieldName = queryResult.fields[c];
            row.push(queryResult.rows[i][fieldName]);
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
    var queryResult = res.locals.queryResult;
    var cache = res.locals.cache;
    json2csv({data: queryResult.rows, fields: queryResult.fields}, function (err, csv) {
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
    var queryResult = res.locals.queryResult;
    var cache = res.locals.cache;
    res.send({
        success: true,
        serverMs: res.locals.end - res.locals.start,
        meta: queryResult.meta,
        results: queryResult.rows,
        incomplete: queryResult.incomplete,
        csvUrl: '/query-results/' + cache.cacheKey + '.csv'
    });     
}

module.exports = router;