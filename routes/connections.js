var _ = require('lodash');
var router = require('express').Router();
var runQuery = require('../lib/run-query.js');
var cipher = require('../lib/cipher.js');
var decipher = require('../lib/decipher.js');
var config = require('../lib/config.js');
var Connection = require('../models/Connection.js');
var BASE_URL = config.get('baseUrl');

router.get('/connections', function (req, res) {
    return res.render('react-applet', {
        pageTitle: "Connections"
    });
});

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

router.get('/api/connections', function (req, res) {
    Connection.findAll(function (err, connections) {
        connections = connections.map((connection) => {
            connection.username = decipher(connection.username);
            connection.password = '';
            return connection;
        });
        res.json({
            error: err,
            connections: connections 
        });
    });
});

router.get('/api/connections/:_id', function (req, res) {
    Connection.findOneById(req.params._id, function (err, connection) {
        if (!connection) {
            return res.json({
                error: "Connection not found"
            });
        }
        connection.username = decipher(connection.username);
        connection.password = "";
        return res.json({
            connection: connection
        });
    });
});


// create
router.post('/api/connections', function (req, res) {
    var connection = new Connection(connectionFromBody(req.body));
    connection.username = cipher(connection.username || '');
    connection.password = cipher(connection.password || '');
    connection.save(function (err, newConnection) {
        if (err) console.error(err);
        if (newConnection) {
            newConnection.username = decipher(connection.username);
            newConnection.password = "";
        }
        return res.json({
            error: err,
            connection: newConnection
        })
    });
});

// update
router.put('/api/connections/:_id', function (req, res) {
    Connection.findOneById(req.params._id, function (err, connection) {
        if (err) {
            console.log(err);
            return res.json({
                error: err 
            });
        }
        if (!connection) {
            return res.json({
                error: "connection not found."
            });
        }
        connection.username = cipher(req.body.username || '');
        connection.password = cipher(req.body.password || '');
        connection.name = req.body.name;
        connection.driver = req.body.driver;
        connection.host = req.body.host;
        connection.port = req.body.port;
        connection.database = req.body.database;
        connection.sqlserverEncrypt = (req.body.sqlserverEncrypt ? true : false);
        connection.postgresSsl = (req.body.postgresSsl ? true : false);
        connection.mysqlInsecureAuth = (req.body.mysqlInsecureAuth ? true : false);
        connection.save(function (err, connection) {
            connection.username = decipher(connection.username);
            connection.password = "";
            res.json({
                error: err,
                connection: connection
            });
        }); 
    });
});

// delete
router.delete('/api/connections/:_id', function (req, res) {
    Connection.removeOneById(req.params._id, function (err) {
        if (err) console.error(err);
        return res.json({
            error: err
        });
    });
});


// test connection 
router.post('/api/test-connection', function testConnection(req, res) {
    var bodyConnection = connectionFromBody(req.body);
    testQuery = "SELECT 'success' AS TestQuery;"
    if (bodyConnection.driver == "crate") {
        testQuery = "SELECT name from sys.cluster";
    }
    runQuery(testQuery, bodyConnection, function (err, queryResult) {
        if (err) {
            console.log(err);
            res.send({
                success: false,
                error: err
            });
        } else {
            res.send({
                success: true,
                results: queryResult.rows
            });
        }
    });
});


module.exports = router;