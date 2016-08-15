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


/*  react-applet get routes
============================================================================= */
router.get('/queries', function (req, res) {
    return res.render('react-applet', {
        pageTitle: "Queries"
    });
});

router.get('/queries/:_id', function (req, res) {
    return res.render('react-applet', {
        pageTitle: "Query"
    });
});


/*  API routes
============================================================================= */

router.get('/api/queries', function (req, res) {
    /*
    NOTE: db side filter. implement or? 
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
    Query.findAll(function (err, queries) {
        res.json({
            err: err,
            queries: queries
        });
    })
})

router.get('/api/queries/:_id', function (req, res) {
    Connection.findAll(function (err, connections) {
        Query.findOneById(req.params._id, function (err, query) {
            if (err) {
                return res.json({
                    err: err,
                    connections: connections,
                    query: null
                });
            }
            if (!query) {
                return res.json({
                    connections: connections,
                    query: {
                        // defaults here?
                    }
                });
            }
            return res.json({
                connections: connections,
                query: query
            });
        });
    });
});

// create new
router.post('/api/queries', function (req, res) {
    // previously posted to api/queries/:_id, req.params._id would have been "new"
    // now though we know its new because the client did that for us 
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
            res.send({
                err: err, 
                success: false
            });
        } else {
            // push query to slack if set up. 
            // this is async, but save operation doesn't care about when/if finished
            newQuery.pushQueryToSlackIfSetup(); 
            res.send({
                success:true, 
                query: newQuery
            });
        }
    });
})

router.put('/api/queries/:_id', function (req, res) {
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
});

router.delete('/queries/:_id', function (req, res) {
    Query.removeOneById(req.params._id, function (err) {
        if (err) console.log(err);
        return res.redirect(BASE_URL + '/queries');
    });
});

module.exports = router;
