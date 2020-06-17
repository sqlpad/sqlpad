require('../typedefs');
const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');

function removePassword(connection) {
  connection.password = '';
  if (connection.data && connection.data.password) {
    connection.data.password = '';
  }
  return connection;
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listConnections(req, res) {
  const { models } = req;
  const connections = await models.connections.findAll();
  return res.utils.data(connections);
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getConnection(req, res) {
  const { models } = req;
  const connection = await models.connections.findOneById(req.params.id);
  if (!connection) {
    return res.utils.data();
  }
  return res.utils.data(removePassword(connection));
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function createConnection(req, res) {
  const { models } = req;
  const newConnection = await models.connections.create(req.body);
  return res.utils.data(removePassword(newConnection));
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function updateConnection(req, res) {
  const { models } = req;
  let connection = await models.connections.findOneById(req.params.id);
  if (!connection) {
    return res.utils.notFound();
  }
  Object.assign(connection, req.body);
  connection = await models.connections.update(req.params.id, connection);
  return res.utils.data(removePassword(connection));
}

/**
 * @param {Req} req
 * @param {Res} res
 */
async function deleteConnection(req, res) {
  const { models, params } = req;
  let connection = await models.connections.findOneById(params.id);
  if (!connection) {
    return res.utils.notFound();
  }
  await models.connections.removeOneById(params.id);
  return res.utils.data();
}

router.get('/api/connections', mustBeAuthenticated, wrap(listConnections));
router.get('/api/connections/:id', mustBeAdmin, wrap(getConnection));
router.post('/api/connections', mustBeAdmin, wrap(createConnection));
router.put('/api/connections/:id', mustBeAdmin, wrap(updateConnection));
router.delete('/api/connections/:id', mustBeAdmin, wrap(deleteConnection));

module.exports = router;
