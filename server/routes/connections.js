const router = require('express').Router();
const connections = require('../models/connections.js');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/sendError');

function removePassword(connection) {
  connection.password = '';
  return connection;
}

router.get('/api/connections', mustBeAuthenticated, async function(req, res) {
  try {
    const docs = await connections.findAll();
    return res.json({
      connections: docs.map(removePassword)
    });
  } catch (error) {
    sendError(res, error, 'Problem querying connection database');
  }
});

router.get('/api/connections/:_id', mustBeAuthenticated, async function(
  req,
  res
) {
  try {
    const connection = await connections.findOneById(req.params._id);
    if (!connection) {
      return sendError(res, null, 'Connection not found');
    }
    return res.json({
      connection: removePassword(connection)
    });
  } catch (error) {
    sendError(res, error, 'Problem querying connection database');
  }
});

router.post('/api/connections', mustBeAdmin, async function(req, res) {
  try {
    const newConnection = await connections.save(req.body);
    return res.json({
      connection: removePassword(newConnection)
    });
  } catch (error) {
    sendError(res, error, 'Problem saving connection');
  }
});

router.put('/api/connections/:_id', mustBeAdmin, async function(req, res) {
  try {
    let connection = await connections.findOneById(req.params._id);
    if (!connection) {
      return sendError(res, null, 'Connection not found');
    }
    Object.assign(connection, req.body);
    connection = await connections.save(connection);
    return res.json({
      connection: removePassword(connection)
    });
  } catch (error) {
    sendError(res, error, 'Problem saving connection');
  }
});

router.delete('/api/connections/:_id', mustBeAdmin, async function(req, res) {
  try {
    await connections.removeOneById(req.params._id);
    return res.json({});
  } catch (error) {
    sendError(res, error, 'Problem deleting connection');
  }
});

module.exports = router;
