require('../typedefs');
const router = require('express').Router();
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/sendError');

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function listConnectionClients(req, res) {
  const { models } = req;
  try {
    const connectionClients = models.connectionClients
      .findAll()
      .map(connectionClient => {
        return {
          id: connectionClient.id,
          name: connectionClient.connection.name,
          connectedAt: connectionClient.connectedAt,
          lastKeepAliveAt: connectionClient.lastKeepAliveAt
        };
      });

    return res.json({
      connectionClients
    });
  } catch (error) {
    sendError(res, error, 'Problem listing connection clients');
  }
}

router.get('/api/connection-clients', mustBeAdmin, listConnectionClients);

/**
 * Get a connection client by id
 * If connection client does is not found it means it was probably disconnected, or never existed
 * (May want to build out a historical reference of connection clients to be able to tell the difference)
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function getConnectionClient(req, res) {
  const { models, params, user } = req;
  try {
    const connectionClient = models.connectionClients.getOneById(
      params.connectionClientId
    );

    if (!connectionClient) {
      return sendError(res, null, 'Connection disconnected');
    }

    // Only the owner of the connection or admin can get the client
    const allowed =
      connectionClient.user._id === user._id || user.role === 'admin';

    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const data = {
      connectionClient: {
        id: connectionClient.id,
        name: connectionClient.connection.name,
        connectedAt: connectionClient.connectedAt,
        lastKeepAliveAt: connectionClient.lastKeepAliveAt
      }
    };

    return res.json(data);
  } catch (error) {
    sendError(res, error, 'Problem getting connection client');
  }
}

router.get(
  '/api/connection-clients/:connectionClientId',
  mustBeAuthenticated,
  getConnectionClient
);

/**
 * Creates and connects a connectionClient
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function createConnectionClient(req, res) {
  const { models, body, user } = req;
  try {
    const { connectionId } = body;
    if (!connectionId) {
      return sendError(res, null, 'connectionId required');
    }

    const connection = await models.connections.findOneById(connectionId);
    if (!connection) {
      return sendError(res, null, 'Connection not found');
    }

    const connectionClient = await models.connectionClients.createNew(
      connection,
      user
    );

    const data = {
      connectionClient: {
        id: connectionClient.id,
        name: connectionClient.connection.name,
        connectedAt: connectionClient.connectedAt,
        lastKeepAliveAt: connectionClient.lastKeepAliveAt
      }
    };

    return res.json(data);
  } catch (error) {
    sendError(res, error, 'Problem creating connection client');
  }
}

router.post(
  '/api/connection-clients',
  mustBeAuthenticated,
  createConnectionClient
);

/**
 * Creates and connects a connectionClient
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function keepAliveConnectionClient(req, res) {
  const { models, params, user } = req;
  try {
    const connectionClient = models.connectionClients.getOneById(
      params.connectionClientId
    );

    // If no connection client it was already closed
    // This is effectively a no-op
    if (!connectionClient) {
      return res.json({});
    }

    // Only the owner of the connection client can keep client alive
    const allowed = connectionClient.user._id === user._id;

    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const keptAlive = connectionClient.keepAlive();
    if (!keptAlive) {
      // remove from in-memory store and respond with nothing
      // disconnect here is not necessary, but should be safe
      await models.connectionClients.disconnectForId(params.connectionClientId);
      return res.json({});
    }

    const data = {
      connectionClient: {
        id: connectionClient.id,
        name: connectionClient.connection.name,
        connectedAt: connectionClient.connectedAt,
        lastKeepAliveAt: connectionClient.lastKeepAliveAt
      }
    };

    return res.json(data);
  } catch (error) {
    sendError(res, error, 'Problem updating connection client');
  }
}

router.put(
  '/api/connection-clients/:connectionClientId',
  mustBeAuthenticated,
  keepAliveConnectionClient
);

/**
 * Creates and connects a connectionClient
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function disconnectConnectionClient(req, res) {
  const { models, params, user } = req;
  const { connectionClientId } = params;
  try {
    const connectionClient = models.connectionClients.getOneById(
      params.connectionClientId
    );

    // Only the owner of the connection or admin can disconnect the client
    const allowed =
      connectionClient.user._id === user._id || user.role === 'admin';

    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await models.connectionClients.disconnectForId(connectionClientId);
    return res.json({});
  } catch (error) {
    sendError(res, error, 'Problem disconnecting connection client');
  }
}

router.delete(
  '/api/connection-clients/:connectionClientId',
  mustBeAuthenticated,
  disconnectConnectionClient
);

module.exports = router;
