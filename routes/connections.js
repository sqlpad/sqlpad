var router = require('express').Router()
var runQuery = require('../lib/run-query.js')
var cipher = require('../lib/cipher.js')
var decipher = require('../lib/decipher.js')
var Connection = require('../models/Connection.js')
var mustBeAdmin = require('../middleware/must-be-admin.js')
var mustBeAuthenticated = require('../middleware/must-be-authenticated.js')

function connectionFromBody (body) {
  return {
    name: body.name,
    driver: body.driver,
    host: body.host,
    port: body.port,
    database: body.database,
    username: body.username,
    password: body.password,
    domain: body.domain,
    sqlserverEncrypt: (body.sqlserverEncrypt === true),
    postgresSsl: (body.postgresSsl === true),
    postgresCert: body.postgresCert,
    postgresKey: body.postgresKey,
    postgresCA: body.postgresCA,
    useSocks: body.useSocks,
    socksHost: body.socksHost,
    socksPort: body.socksPort,
    socksUsername: body.socksUsername,
    socksPassword: body.socksPassword,
    mysqlInsecureAuth: body.mysqlInsecureAuth === true,
    prestoCatalog: body.prestoCatalog,
    prestoSchema: body.prestoSchema
  }
}

router.get('/api/connections', mustBeAuthenticated, function (req, res) {
  Connection.findAll(function (err, connections) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem querying connection database'
      })
    }
    connections = connections.map((connection) => {
      connection.username = decipher(connection.username)
      connection.password = ''
      return connection
    })
    res.json({
      connections: connections
    })
  })
})

router.get('/api/connections/:_id', mustBeAuthenticated, function (req, res) {
  Connection.findOneById(req.params._id, function (err, connection) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem querying connection database'
      })
    }
    if (!connection) {
      return res.json({
        error: 'Connection not found'
      })
    }
    connection.username = decipher(connection.username)
    connection.password = ''
    return res.json({
      connection: connection
    })
  })
})

// create
router.post('/api/connections', mustBeAdmin, function (req, res) {
  var connection = new Connection(connectionFromBody(req.body))
  connection.username = cipher(connection.username || '')
  connection.password = cipher(connection.password || '')
  connection.save(function (err, newConnection) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem saving connection'
      })
    }
    if (newConnection) {
      newConnection.username = decipher(connection.username)
      newConnection.password = ''
    }
    return res.json({
      connection: newConnection
    })
  })
})

// update
router.put('/api/connections/:_id', mustBeAdmin, function (req, res) {
  Connection.findOneById(req.params._id, function (err, connection) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem querying connection database'
      })
    }
    if (!connection) {
      return res.json({
        error: 'connection not found.'
      })
    }
    connection.username = cipher(req.body.username || "");
    connection.password = cipher(req.body.password || "");
    connection.name = req.body.name;
    connection.driver = req.body.driver;
    connection.host = req.body.host;
    connection.port = req.body.port;
    connection.database = req.body.database;
    connection.domain = req.body.domain;
    connection.sqlserverEncrypt = req.body.sqlserverEncrypt === true;
    connection.postgresSsl = req.body.postgresSsl === true;
    connection.postgresCert = req.body.postgresCert;
    connection.postgresKey = req.body.postgresKey;
    connection.postgresCA = req.body.postgresCA;
    connection.mysqlInsecureAuth = req.body.mysqlInsecureAuth === true;
    connection.prestoCatalog = req.body.prestoCatalog;
    connection.prestoSchema = req.body.prestoSchema;
    connection.save(function(err, connection) {
      if (err) {
        console.error(err)
        return res.json({
          error: 'Problem saving connection'
        })
      }
      connection.username = decipher(connection.username)
      connection.password = ''
      return res.json({
        connection: connection
      })
    })
  })
})

// delete
router.delete('/api/connections/:_id', mustBeAdmin, function (req, res) {
  Connection.removeOneById(req.params._id, function (err) {
    if (err) {
      console.error(err)
      return res.json({
        error: 'Problem deleting connection'
      })
    }
    return res.json({})
  })
})

// test connection
router.post('/api/test-connection', mustBeAdmin, function testConnection (req, res) {
  var bodyConnection = connectionFromBody(req.body)
  var testQuery = "SELECT 'success' AS TestQuery;"
  if (bodyConnection.driver === 'crate') {
    testQuery = 'SELECT name from sys.cluster'
  }
  if (bodyConnection.driver === 'presto') {
    testQuery = "SELECT 'success' AS TestQuery"
  }
  runQuery(testQuery, bodyConnection, function (err, queryResult) {
    if (err) {
      console.error(err)
      return res.json({
        error: err
      })
    }
    return res.send({
      results: queryResult.rows
    })
  })
})

module.exports = router
