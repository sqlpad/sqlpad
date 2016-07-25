var _ = require('lodash');
var router = require('express').Router();
var runQuery = require('../lib/run-query.js');
var cipher = require('../lib/cipher.js');
var decipher = require('../lib/decipher.js');
var config = require('../lib/config.js');
var Connection = require('../models/Connection.js');
var BASE_URL = config.get('baseUrl');

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

router.get('/connections', function (req, res) {
    Connection.findAll(function (err, connections) {
        res.render('connections', {pageTitle: "Connections", connections: connections});
    });
});

router.get('/connections/:_id', function (req, res) {
    Connection.findOneById(req.params._id, function (err, connection) {
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
    var connection = new Connection(connectionFromBody(req.body));
    connection.username = cipher(connection.username);
    connection.password = cipher(connection.password);
    connection.save(function (err, newConnection) {
        if (err) {
            console.log(err);
            res.render('connection', {debug: err});
        } else {
            res.redirect(BASE_URL + '/connections');
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
    var connection = new Connection(connectionFromBody(req.body));
    connection.username = cipher(bodyConnection.username);
    connection.password = cipher(bodyConnection.password);
    connection._id = req.params._id;
    connection.save(function (err, newConnection) {
        if (err) console.error(err);
        res.redirect(BASE_URL + '/connections');
    });
});

router.delete('/connections/:_id', function (req, res) {
    Connection.removeOneById(req.params._id, function (err) {
        if (err) console.error(err);
        res.redirect(BASE_URL + '/connections');
    });
});

module.exports = router;