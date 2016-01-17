var _ = require('lodash');
var uaParser = require('ua-parser');
var uuid = require('uuid');
var noop = function () {
};
var moment = require('moment');
var request = require('request');

module.exports = function (app) {

    var db = app.get('db');

    function getQueryFilterData(req, res, next) {
        db.connections.find({}, function (err, connections) {
            var connectionsById = _.indexBy(connections, '_id');
            db.queries.find({}, function (err, queries) {
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

    // Post to a slack webhook
    function pushQueryToSlack(query, userEmail, webhookUrl, cb){
        var options = {
          method: 'post',
          body: {"text": "New Query <" + process.env.PUBLIC_URL +
                         "/queries/" + query._id + "|"+ query.name +
                         "> saved by " + userEmail + " on SqlPad ```" +
                         query.queryText + "```"},
          json: true,
          url: webhookUrl
        }
        request(options, function(err, httpResponse, body){
            cb(err);
        });
    }
    
    app.get('/queries', getQueryFilterData, function (req, res) {
        var filter = {};
        if (req.query && req.query.tag) {
            filter.tags = req.query.tag;
        }
        if (req.query && req.query.connection) {
            filter.connectionId = req.query.connection;
        }
        if (req.query && req.query.createdBy) {
            filter.createdBy = req.query.createdBy;
        }
        if (req.query && req.query.search) {
            var nameRegExp = new RegExp(req.query.search, "i");
            var queryTextRegExp = new RegExp(req.query.search, "i");
            filter.$or = [{queryText: {$regex: queryTextRegExp}}, {name: {$regex: nameRegExp}}];
        }
        var cursor = db.queries.find(filter);
        if (req.query && req.query.sortBy) {
            if (req.query.sortBy === "accessed") {
                cursor.sort({lastAccessedDate: -1});
            } else if (req.query.sortBy === "modified") {
                cursor.sort({modifiedDate: -1});
            } else if (req.query.sortBy === "name") {
                cursor.sort({name: 1});
            }
        } else {
            cursor.sort({modifiedDate: -1});
        }
        cursor.exec(function (err, queries) {
            queries.forEach(function (query) {
                query.lastAccessedFromNow = moment(query.lastAccessedDate).calendar();
                query.modifiedCalendar = moment(query.modifiedDate).calendar();
                var timeForDiff = query.lastAccessedDate || query.modifiedDate;
                query.timeDiff = new Date() - timeForDiff;
            });
            //queries = _.sortBy(queries, 'timeDiff');
            if (req.query && req.query.format && req.query.format === "table-only") {
                res.render('queries-table', {
                    pageTitle: "Queries",
                    queries: queries,
                    filter: filter
                });
            } else {
                res.render('queries', {
                    pageTitle: "Queries",
                    queries: queries,
                    filter: filter
                });
            }

        });
    });

    app.get('/queries/:_id', function (req, res) {

        var ua = req.headers['user-agent'];
        var os = uaParser.parseOS(ua).toString();
        res.locals.isMac = (os.search(/mac/i) >= 0);
        if (res.locals.isMac) {
            res.locals.controlKeyText = 'Command';
        } else {
            res.locals.controlKeyText = 'Ctrl';
        }

        db.config.findOne({key: "allowCsvDownload"}, function (err, config) {

            if (err) {
                console.log(err);
            }

            var preventDownload = config && config.value === "false";

            db.connections.find({}, function (err, connections) {
                res.locals.queryMenu = true;
                res.locals.cacheKey = uuid.v1();
                res.locals.navbarConnections = _.sortBy(connections, 'name');
                res.locals.allowDownload = !preventDownload;
                var format = req.query && req.query.format;

                if (req.params._id === 'new') {
                    res.render('query', {
                        query: {
                            name: ""
                        },
                        format: format
                    });
                } else {
                    db.queries.findOne({_id: req.params._id}, function (err, query) {
                        // TODO: render error if this fails?
                        db.queries.update({_id: req.params._id}, {$set: {lastAccessedDate: new Date()}}, {}, noop);
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
                    });
                }
            });
        });
    });

    app.post('/queries/:_id', function (req, res) {
        // save the query, to the query db
        var bodyQuery = {
            name: req.body.name || "No Name Query",
            tags: req.body.tags,
            connectionId: req.body.connectionId,
            queryText: req.body.queryText,
            chartConfiguration: req.body.chartConfiguration,
            modifiedDate: new Date(),
            modifiedBy: req.user.email,
            lastAccessedDate: new Date()
        };
        if (req.params._id == "new") {
            bodyQuery.createdDate = new Date();
            bodyQuery.createdBy = req.user.email;

            db.queries.insert(bodyQuery, function (err, query) {
                if (err) {
                    console.log(err);
                    res.send({err: err, success: false});
                } else {
                    db.config.findOne({ key: "slackWebhook"}, function(err, webhook){
                        if (err) console.log(err);
                        if (!webhook) {
                            // if not configured, just return success response
                            res.send({success:true, query: query});
                        } else {
                            pushQueryToSlack(query, req.user.email, webhook.value, function(err){
                                if (err) console.log("Something went wrong while sending to Slack.")
                                else {
                                    res.send({success: true, query: query});
                                }
                             });
                        }
                    });
                }
            });
        } else {
            // This style update merges the bodyQuery values to whatever objects 
            // are matched by the initial filter (in this case, _id, which will only match 1 query)
            db.queries.update({_id: req.params._id}, {$set: bodyQuery}, {}, function (err) {
                if (err) {
                    console.log(err);
                    res.send({err: err, success: false});
                } else {
                    bodyQuery._id = req.params._id;
                    res.send({success: true, query: bodyQuery});
                }
            });
        }
    });

    app.delete('/queries/:_id', function (req, res) {
        db.queries.remove({_id: req.params._id}, function (err) {
            console.log(err);
            res.redirect('/queries');
        });
    });

};