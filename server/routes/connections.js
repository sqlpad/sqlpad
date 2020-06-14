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

router.get(
  '/api/connections',
  mustBeAuthenticated,
  wrap(async function (req, res) {
    const { models } = req;
    const connections = await models.connections.findAll();
    return res.utils.data(connections);
  })
);

router.get(
  '/api/connections/:id',
  mustBeAdmin,
  wrap(async function (req, res) {
    const { models } = req;
    const connection = await models.connections.findOneById(req.params.id);
    if (!connection) {
      return res.utils.data();
    }
    return res.utils.data(removePassword(connection));
  })
);

router.post(
  '/api/connections',
  mustBeAdmin,
  wrap(async function (req, res) {
    const { models } = req;
    const newConnection = await models.connections.create(req.body);
    return res.utils.data(removePassword(newConnection));
  })
);

router.put(
  '/api/connections/:id',
  mustBeAdmin,
  wrap(async function (req, res) {
    const { models } = req;
    let connection = await models.connections.findOneById(req.params.id);
    if (!connection) {
      return res.utils.notFound();
    }
    Object.assign(connection, req.body);
    connection = await models.connections.update(req.params.id, connection);
    return res.utils.data(removePassword(connection));
  })
);

router.delete(
  '/api/connections/:id',
  mustBeAdmin,
  wrap(async function (req, res) {
    const { models, params } = req;
    let connection = await models.connections.findOneById(params.id);
    if (!connection) {
      return res.utils.notFound();
    }
    await models.connections.removeOneById(params.id);
    return res.utils.data();
  })
);

module.exports = router;
