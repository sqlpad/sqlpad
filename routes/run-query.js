var runQuery = require('../lib/run-query.js');
var sanitize = require("sanitize-filename");
var moment = require('moment');
var router = require('express').Router();
var config = require('../lib/config.js');
var decipher = require('../lib/decipher.js');
var Connection = require('../models/Connection.js');
var Cache = require('../models/Cache.js');

router.post('/api/run-query', 
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
    Cache.findOneByCacheKey(req.body.cacheKey, function (err, cache) {
        if (!cache) {
            cache = new Cache({cacheKey: req.body.cacheKey});
        }
        cache.queryName = sanitize((req.body.queryName || "SqlPad Query Results") + " " + moment().format("YYYY-MM-DD"));
        cache.expiration = expirationDate;
        cache.save(function (err, newCache) {
            if (err) console.error(err);
            res.locals.cache = newCache;
            next();
        })
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
            queryResult: queryResult
        });
    }
}

function createXlsxDownload (req, res, next) {
    var queryResult = res.locals.queryResult;
    var cache = res.locals.cache;
    cache.writeXlsx(queryResult, next);
}

function createCsvDownload (req, res, next) {
    var queryResult = res.locals.queryResult;
    var cache = res.locals.cache;
    cache.writeCsv(queryResult, next);
}

function sendResults (req, res) {
    var queryResult = res.locals.queryResult;
    var cache = res.locals.cache;
    res.send({
        success: true,
        serverMs: res.locals.end - res.locals.start,
        queryResult: res.locals.queryResult
    });     
}

module.exports = router;