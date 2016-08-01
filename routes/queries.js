var _ = require('lodash');
var uaParser = require('ua-parser');
var uuid = require('uuid');
var router = require('express').Router();
var moment = require('moment');
var request = require('request');
var config = require('../lib/config.js');
var Connection = require('../models/Connection.js');
var Query = require('../models/Query.js');
var noop = function () {};
const BASE_URL = config.get('baseUrl');

function getQueryFilterData(req, res, next) {
    Connection.findAll(function (err, connections) {
        var connectionsById = _.keyBy(connections, '_id');
        Query.findAll(function (err, queries) {
            var tags = _.uniq(_.flatten(_.map(queries, 'tags'))).sort();
            var createdBys = _.uniq(_.map(queries, 'createdBy')).sort();
            connections = _.sortBy(connections, 'name');
            res.locals.connectionsById = connectionsById;
            res.locals.connections = connections;
            res.locals.createdBys = createdBys;
            res.locals.tags = tags;
            next();
        });
    });
}

router.get('/react/queries', function (req, res) {
    res.render('react-queries', {
        pageTitle: "Queries"
    });
})

router.get('/api/queries', function (req, res) {
    Query.findAll(function (err, queries) {
        res.json({
            err: err,
            queries: queries
        });
    })
})

router.get('/queries', getQueryFilterData, function (req, res) {
    return res.render('queries', {
        pageTitle: "Queries"
    });
    /*
    var filter = {};
    if (req.query && req.query.tag) {
        filter.tags = req.query.tag;
    }
    if (req.query && req.query.connection) {
        filter.connectionId = req.query.connection;
    }
    if (req.query && req.query.createdBy) {
        filter.createdBy = 
    }
    if (req.query && req.query.search) {
        var nameRegExp = new RegExp(req.query.search, "i");
        var queryTextRegExp = new RegExp(req.query.search, "i");
        filter.$or = [{queryText: {$regex: queryTextRegExp}}, {name: {$regex: nameRegExp}}];
    }
    Query.findByFilter(filter, function (err, queries) {

    });
    */
});

function getControlKeyText (req, res, next) {
    var ua = req.headers['user-agent'];
    var os = uaParser.parseOS(ua).toString();
    res.locals.isMac = (os.search(/mac/i) >= 0);
    if (res.locals.isMac) {
        res.locals.controlKeyText = 'Command';
    } else {
        res.locals.controlKeyText = 'Ctrl';
    }
    next();
}

router.get('/queries/:_id', getControlKeyText, function (req, res) {
    Connection.findAll(function (err, connections) {
        res.locals.queryMenu = true;
        res.locals.cacheKey = uuid.v1();
        res.locals.navbarConnections = _.sortBy(connections, 'name');
        res.locals.allowDownload = config.get('allowCsvDownload');
        var format = req.query && req.query.format;
        if (req.params._id === 'new') {
            res.render('query', {
                query: {
                    name: ""
                },
                format: format
            });
        } else {
            Query.findOneById(req.params._id, function (err, query) {
                // TODO: render error if this fails?
                query.logAccess(noop);
                if (query && query.tags) query.tags = query.tags.join(', ');
                if (format === 'json') {
                    // send JSON of query object
                    res.json(query);
                } else {
                    // render page
                    res.render('query', {
                        query: query, 
                        // format may be set to 'chart' or 'table'
                        format: format,
                        fullscreenContent: ['chart', 'table'].indexOf(format) > -1 ? true: false
                    });
                }
            })
        }
    });
});

router.post('/queries/:_id', function (req, res) {
    // save the query, to the query db
    if (req.params._id == "new") {
        var query = new Query({
            name: req.body.name || "No Name Query",
            tags: req.body.tags,
            connectionId: req.body.connectionId,
            queryText: req.body.queryText,
            chartConfiguration: req.body.chartConfiguration,
            createdBy: req.user.email,
            modifiedBy: req.user.email
        });
        query.save(function (err, newQuery) {
            if (err) {
                console.log(err);
                res.send({err: err, success: false});
            } else {
                // push query to slack if set up. 
                // this is async, but save operation doesn't care about when/if finished
                newQuery.pushQueryToSlackIfSetup(); 
                res.send({success:true, query: newQuery});
            }
        });
    } else {
        Query.findOneById(req.params._id, function (err, query) {
            if (err) {
                return res.send({
                    err: err,
                    success: false
                });
            }
            if (!query) {
                return res.send({
                    err: "No query found for that Id",
                    success: false
                });
            }
            query.name = req.body.name || "";
            query.tags = req.body.tags;
            query.connectionId = req.body.connectionId;
            query.queryText = req.body.queryText;
            query.chartConfiguration = req.body.chartConfiguration;
            query.modifiedBy = req.user.email;
            query.save(function (err, newQuery) {
                if (err) {
                    console.log(err);
                    return res.send({success: false, err: err});
                }
                return res.send({success: true, query: newQuery});
            });
        });
    }
});

router.delete('/queries/:_id', function (req, res) {
    Query.removeOneById(req.params._id, function (err) {
        if (err) console.log(err);
        return res.redirect(BASE_URL + '/queries');
    });
});

module.exports = router;
