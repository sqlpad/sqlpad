const router = require('express').Router()
const cipher = require('../lib/cipher.js')
const decipher = require('../lib/decipher.js')
const connections = require('../models/connections.js')
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
  return connections
    .findAll()
    .then(docs =>
      res.json({
        connections: docs.map(decipherConnection)
      })
    )
    .catch(error =>
      sendError(res, error, 'Problem querying connection database')
    )
})

router.get('/api/connections/:_id', mustBeAuthenticated, function(req, res) {
  return connections
    .findOneById(req.params._id)
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
  const { body } = req

  const connection = Object.assign({}, body, {
    sqlserverEncrypt: body.sqlserverEncrypt === true,
    mysqlInsecureAuth: body.mysqlInsecureAuth === true,
    username: cipher(body.username || ''),
    password: cipher(body.password || '')
  })

  return connections
    .save(connection)
    .then(newConnection =>
      res.json({
        connection: decipherConnection(newConnection)
      })
    )
    .catch(error => sendError(res, error, 'Problem saving connection'))
})

// update
router.put('/api/connections/:_id', mustBeAdmin, function(req, res) {
  const { body } = req

  return connections
    .findOneById(req.params._id)
    .then(connection => {
      if (!connection) {
        return sendError(res, null, 'Connection not found')
      }

      Object.assign(connection, body, {
        sqlserverEncrypt: body.sqlserverEncrypt === true,
        mysqlInsecureAuth: body.mysqlInsecureAuth === true,
        username: cipher(body.username || ''),
        password: cipher(body.password || '')
      })

      return connections.save(connection).then(connection =>
        res.json({
          connection: decipherConnection(connection)
        })
      )
    })
    .catch(error => sendError(res, error, 'Problem saving connection'))
})

router.delete('/api/connections/:_id', mustBeAdmin, function(req, res) {
  return connections
    .removeOneById(req.params._id)
    .then(() => res.json({}))
    .catch(error => sendError(res, error, 'Problem deleting connection'))
})

module.exports = router
