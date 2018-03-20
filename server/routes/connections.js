const router = require('express').Router()
const cipher = require('../lib/cipher.js')
const decipher = require('../lib/decipher.js')
const Connection = require('../models/Connection.js')
const mustBeAdmin = require('../middleware/must-be-admin.js')
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js')
const sendError = require('../lib/sendError')

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
  const bodyConnection = Object.assign({}, req.body, {
    sqlserverEncrypt: req.body.sqlserverEncrypt === true,
    mysqlInsecureAuth: req.body.mysqlInsecureAuth === true
  })
  const connection = new Connection(bodyConnection)
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
      Object.assign(connection, req.body, {
        sqlserverEncrypt: req.body.sqlserverEncrypt === true,
        mysqlInsecureAuth: req.body.mysqlInsecureAuth === true,
        username: cipher(req.body.username || ''),
        password: cipher(req.body.password || '')
      })
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

module.exports = router
