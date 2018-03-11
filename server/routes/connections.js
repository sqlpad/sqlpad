const router = require('express').Router()
const runQuery = require('../lib/run-query.js')
const cipher = require('../lib/cipher.js')
const decipher = require('../lib/decipher.js')
const Connection = require('../models/Connection.js')
const mustBeAdmin = require('../middleware/must-be-admin.js')
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js')
const sendError = require('../lib/sendError')

function connectionFromBody(body) {
  return {
    name: body.name,
    driver: body.driver,
    host: body.host,
    port: body.port,
    database: body.database,
    username: body.username,
    password: body.password,
    domain: body.domain,
    sqlserverEncrypt: body.sqlserverEncrypt === true,
    postgresSsl: body.postgresSsl === true,
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
    prestoSchema: body.prestoSchema,
    hanaSchema: body.hanaSchema,
    hanadatabase: body.hanadatabase,
    hanaport: body.hanaport
  }
}

function decipherConnection(connection) {
  if (connection.username) {
    connection.username = decipher(connection.username)
  }
  connection.password = ''
  return connection
}

router.get('/api/connections', mustBeAuthenticated, function(req, res) {
  return Connection.findAll()
    .then(connections =>
      res.json({
        connections: connections.map(decipherConnection)
      })
    )
    .catch(error =>
      sendError(res, error, 'Problem querying connection database')
    )
})

router.get('/api/connections/:_id', mustBeAuthenticated, function(req, res) {
  Connection.findOneById(req.params._id)
    .then(connection => {
      if (!connection) {
        return sendError(res, null, 'Connection not found')
      }
      return res.json({
        connection: decipherConnection(connection)
      })
    })
    .catch(error =>
      sendError(res, error, 'Problem querying connection database')
    )
})

// create
router.post('/api/connections', mustBeAdmin, function(req, res) {
  const connection = new Connection(connectionFromBody(req.body))
  connection.username = cipher(connection.username || '')
  connection.password = cipher(connection.password || '')
  return connection
    .save()
    .then(newConnection =>
      res.json({
        connection: decipherConnection(newConnection)
      })
    )
    .catch(error => sendError(res, error, 'Problem saving connection'))
})

// update
router.put('/api/connections/:_id', mustBeAdmin, function(req, res) {
  return Connection.findOneById(req.params._id)
    .then(connection => {
      if (!connection) {
        return sendError(res, null, 'Connection not found')
      }
      connection.username = cipher(req.body.username || '')
      connection.password = cipher(req.body.password || '')
      connection.name = req.body.name
      connection.driver = req.body.driver
      connection.host = req.body.host
      connection.port = req.body.port
      connection.database = req.body.database
      connection.domain = req.body.domain
      connection.sqlserverEncrypt = req.body.sqlserverEncrypt === true
      connection.postgresSsl = req.body.postgresSsl === true
      connection.postgresCert = req.body.postgresCert
      connection.postgresKey = req.body.postgresKey
      connection.postgresCA = req.body.postgresCA
      connection.mysqlInsecureAuth = req.body.mysqlInsecureAuth === true
      connection.prestoCatalog = req.body.prestoCatalog
      connection.prestoSchema = req.body.prestoSchema
      connection.hanaSchema = req.body.hanaSchema
      connection.hanadatabase = req.body.hanadatabase
      connection.hanaport = req.body.hanaport
      return connection.save().then(connection =>
        res.json({
          connection: decipherConnection(connection)
        })
      )
    })
    .catch(error => sendError(res, error, 'Problem saving connection'))
})

router.delete('/api/connections/:_id', mustBeAdmin, function(req, res) {
  return Connection.removeOneById(req.params._id)
    .then(() => res.json({}))
    .catch(error => sendError(res, error, 'Problem deleting connection'))
})

router.post('/api/test-connection', mustBeAdmin, function(req, res) {
  const bodyConnection = connectionFromBody(req.body)
  let testQuery = "SELECT 'success' AS TestQuery;"
  // TODO move this to drivers implementation
  if (bodyConnection.driver === 'crate') {
    testQuery = 'SELECT name from sys.cluster'
  }
  if (bodyConnection.driver === 'presto') {
    testQuery = "SELECT 'success' AS TestQuery"
  }
  if (bodyConnection.driver === 'hdb') {
    testQuery = 'select * from DUMMY'
  }
  runQuery(testQuery, bodyConnection, function(err, queryResult) {
    if (err) {
      return sendError(res, err)
    }
    return res.send({
      results: queryResult.rows
    })
  })
})

module.exports = router
