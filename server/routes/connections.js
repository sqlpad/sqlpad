const router = require('express').Router();
const connections = require('../models/connections.js');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/sendError');

function removePassword(connection) {
  connection.password = '';
  return connection;
}

router.get('/api/connections', mustBeAuthenticated, function(req, res) {
  return connections
    .findAll()
    .then(docs =>
      res.json({
        connections: docs.map(removePassword)
      })
    )
    .catch(error =>
      sendError(res, error, 'Problem querying connection database')
    );
});

router.get('/api/connections/:_id', mustBeAuthenticated, function(req, res) {
  return connections
    .findOneById(req.params._id)
    .then(connection => {
      if (!connection) {
        return sendError(res, null, 'Connection not found');
      }
      return res.json({
        connection: removePassword(connection)
      });
    })
    .catch(error =>
      sendError(res, error, 'Problem querying connection database')
    );
});

router.post('/api/connections', mustBeAdmin, function(req, res) {
  return connections
    .save(req.body)
    .then(newConnection =>
      res.json({
        connection: removePassword(newConnection)
      })
    )
    .catch(error => sendError(res, error, 'Problem saving connection'));
});

router.put('/api/connections/:_id', mustBeAdmin, function(req, res) {
  return connections
    .findOneById(req.params._id)
    .then(connection => {
      if (!connection) {
        return sendError(res, null, 'Connection not found');
      }

      Object.assign(connection, req.body);

      return connections.save(connection).then(connection =>
        res.json({
          connection: removePassword(connection)
        })
      );
    })
    .catch(error => sendError(res, error, 'Problem saving connection'));
});

router.delete('/api/connections/:_id', mustBeAdmin, function(req, res) {
  return connections
    .removeOneById(req.params._id)
    .then(() => res.json({}))
    .catch(error => sendError(res, error, 'Problem deleting connection'));
});

module.exports = router;
