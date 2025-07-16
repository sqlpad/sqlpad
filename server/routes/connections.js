import '../typedefs.js';
import mustBeAdmin from '../middleware/must-be-admin.js';
import mustBeAuthenticated from '../middleware/must-be-authenticated.js';
import wrap from '../lib/wrap.js';
import consts from '../lib/consts.js';
import express from 'express';
const router = express.Router();

function removePassword(connection) {
  connection.password = '';
  if (connection.data && connection.data.password) {
    connection.data.password = '';
  }
  return connection;
}

/**
 * Lists only connections that are available to the user.
 */
async function listConnections(req, res) {
  const { models } = req;
  let [connections, access] = await Promise.all([
    models.connections.findAll(),
    models.connectionAccesses.findAllActiveByUserId(req.user.id),
  ]);

  connections = connections.map((connection) => removePassword(connection));

  if (req.user.role !== 'admin') {
    access = new Set(access.map((e) => e.connectionId));
    if (!access.has(consts.EVERY_CONNECTION_ID)) {
      connections = connections.filter((e) => access.has(e.id));
    }
  }
  return res.utils.data(connections);
}

async function getConnection(req, res) {
  const { models } = req;
  const connection = await models.connections.findOneById(req.params.id);
  if (!connection) {
    return res.utils.data();
  }
  return res.utils.data(removePassword(connection));
}

//Always returns error while trying to create a new connection via UI
async function createConnection(req, res) {
  return res.utils.error(
    'Creating connections via API is disabled. Use config files or environment variables.'
  );
}

async function updateConnection(req, res) {
  return res.utils.error(
    'Editing connections via API is disabled. Use config files or environment variables.'
  );
}

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
router.post('/api/connections', mustBeAdmin, wrap(createConnection)); // Always returns error
router.put('/api/connections/:id', mustBeAdmin, wrap(updateConnection)); // Always returns error too
router.delete('/api/connections/:id', mustBeAdmin, wrap(deleteConnection));

export default router;
