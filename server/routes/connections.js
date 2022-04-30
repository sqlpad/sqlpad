require('../typedefs');
const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin');
const mustBeAuthenticated = require('../middleware/must-be-authenticated');
const wrap = require('../lib/wrap');
const consts = require('../lib/consts');

function removePassword(connection) {
  connection.password = '';
  if (connection.data && connection.data.password) {
    connection.data.password = '';
  }
  return connection;
}

/**
 * Lists only connections that are available to the user.
 * TODO MAJOR BREAKING - for next major version, remove all connection data other than name, driver, dates created
 *
 * @param {Req} req
 * @param {Res} res
 */
async function listConnections(req, res) {
  const { models } = req;
  let [connections, access] = await Promise.all([
    models.connections.findAll(),
    models.connectionAccesses.findAllActiveByUserId(req.user.id),
  ]);

  connections = connections.map((connection) => removePassword(connection));

  // Admins have access to all connections.
  if (req.user.role !== 'admin') {
    // map access to a set of connection ids
    access = new Set(access.map((e) => e.connectionId));
    // If all connections are allowed by this magic id, we can show all and don't need to filter the list.
    if (!access.has(consts.EVERY_CONNECTION_ID)) {
      // if not all are allowed then we filter each connection and check that it is in the access list.
      connections = connections.filter((e) => access.has(e.id));
    }
  }
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
