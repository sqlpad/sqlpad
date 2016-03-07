var _ = require('lodash');
var runQuery = require('../lib/run-query.js');

function connectionFromBody (body) {
    return {
        name: body.name,
        driver: body.driver,
        host: body.host,
        port: body.port,
        database: body.database,
        username: body.username,
        password: body.password,
        sqlserverEncrypt: (body.sqlserverEncrypt ? true : false),
        postgresSsl: (body.postgresSsl ? true : false),
        mysqlInsecureAuth: (body.mysqlInsecureAuth ? true : false)
    };
}

module.exports = function (app, router) {

    var db = app.get('db');
    var decipher = app.get('decipher');
    var cipher = app.get('cipher');
    var baseUrl = app.get('baseUrl');

    router.get('/connections', function (req, res) {
        db.connections.find({}).sort({name: 1}).exec(function (err, connections) {
            connections = _.sortBy(connections, function (c) {
                return c.name.toLowerCase();
            });
            res.render('connections', {pageTitle: "Connections", connections: connections});
        });
    });

    router.get('/connections/:_id', function (req, res) {
        db.connections.findOne({_id: req.params._id}, function (err, connection) {
            if (!connection) {
                connection = {};
            } else {
                connection.username = decipher(connection.username);
                connection.password = "";
            }
            res.render('connection', {
                connection: connection
            });
        });
    });

    router.post('/connections/new', function (req, res) {
        var connection = connectionFromBody(req.body);
        connection.createdDate = new Date();
        connection.modifiedDate = new Date();
        connection.username = cipher(connection.username);
        connection.password = cipher(connection.password);
        db.connections.insert(connection, function (err) {
            if (err) {
                console.log(err);
                res.render('connection', {debug: err});
            } else {
                res.redirect(baseUrl + '/connections');
            }
        });
    });

    function testConnection(req, res) {
        var bodyConnection = connectionFromBody(req.body);
        testQuery = "SELECT 'success' AS TestQuery;"
        if (bodyConnection.driver == "crate") {
            testQuery = "SELECT name from sys.cluster";
        }
        runQuery(testQuery, bodyConnection, function (err, results) {
            if (err) {
                console.log(err);
                res.send({
                    success: false,
                    err: err
                });
            } else {
                res.send({
                    success: true,
                    results: results.rows
                });
            }
        });
    }

    router.post('/connections/test', testConnection);
    router.put('/connections/test', testConnection);

    router.put('/connections/:_id', function (req, res) {
        var bodyConnection = connectionFromBody(req.body);
        bodyConnection.username = cipher(bodyConnection.username);
        bodyConnection.password = cipher(bodyConnection.password);
        db.connections.findOne({_id: req.params._id}, function (err, connection) {
            _.merge(connection, bodyConnection);
            connection.modifiedDate = new Date();
            db.connections.update({_id: req.params._id}, connection, {}, function (err) {
                if (err) console.log(err);
                res.redirect(baseUrl + '/connections');
            });
        });
    });

    router.delete('/connections/:_id', function (req, res) {
        db.connections.remove({_id: req.params._id}, function (err) {
            if (err) console.log(err);
            res.redirect(baseUrl + '/connections');
        });
    });
};
