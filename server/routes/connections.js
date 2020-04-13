const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');

// TODO v5 - regular users should probably just get { id, name, driver, andMaybeSomeDescription }
// While password is removed, other info is sensitive
// Getting a single connection can be an admin-only thing

function removePassword(connection) {
  connection.password = '';
  return connection;
}

router.get(
  '/api/connections',
  mustBeAuthenticated,
  wrap(async function(req, res) {
    const { models } = req;
    const docs = await models.connections.findAll();
    return res.utils.data(docs.map(removePassword));
  })
);

router.get(
  '/api/connections/:_id',
  mustBeAuthenticated,
  wrap(async function(req, res) {
    const { models } = req;
    const connection = await models.connections.findOneById(req.params._id);
    if (!connection) {
      return res.utils.data();
    }
    return res.utils.data(removePassword(connection));
  })
);

router.post(
  '/api/connections',
  mustBeAdmin,
  wrap(async function(req, res) {
    const { models } = req;
    const newConnection = await models.connections.save(req.body);
    return res.utils.data(removePassword(newConnection));
  })
);

router.put(
  '/api/connections/:_id',
  mustBeAdmin,
  wrap(async function(req, res) {
    const { models } = req;
    let connection = await models.connections.findOneById(req.params._id);
    if (!connection) {
      return res.utils.notFound();
    }
    Object.assign(connection, req.body);
    connection = await models.connections.save(connection);
    return res.utils.data(removePassword(connection));
  })
);

router.delete(
  '/api/connections/:_id',
  mustBeAdmin,
  wrap(async function(req, res) {
    const { models, params } = req;
    let connection = await models.connections.findOneById(params._id);
    if (!connection) {
      return res.utils.notFound();
    }
    await models.connections.removeOneById(params._id);
    return res.utils.data();
  })
);

module.exports = router;
