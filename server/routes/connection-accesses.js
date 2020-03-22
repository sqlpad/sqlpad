require('../typedefs');
const router = require('express').Router();
const consts = require('../lib/consts');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/send-error');

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function listConnectionAccesses(req, res) {
  const { models } = req;
  try {
    const { includeInactives } = req.query;
    let connectionAccesses;
    if (includeInactives) {
      connectionAccesses = await models.connectionAccesses.findAll();
    } else {
      connectionAccesses = await models.connectionAccesses.findAllActive();
    }
    return res.json({ connectionAccesses });
  } catch (error) {
    sendError(res, error, 'Problem getting connection accesses');
  }
}

router.get(
  '/api/connection-accesses',
  mustBeAuthenticated,
  listConnectionAccesses
);

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function getConnectionAccess(req, res) {
  const { models } = req;
  try {
    const connectionAccess = await models.connectionAccesses.findOneById(
      req.params._id
    );
    if (!connectionAccess) {
      return sendError(res, null, 'Connection access not found');
    }
    return res.json({ connectionAccess });
  } catch (error) {
    sendError(res, error, 'Problem querying connection access');
  }
}

router.get(
  '/api/connection-accesses/:_id',
  mustBeAuthenticated,
  getConnectionAccess
);

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function createConnectionAccess(req, res) {
  const { models } = req;
  try {
    let user = {
      id: consts.EVERYONE_ID,
      email: consts.EVERYONE_EMAIL
    };
    let connection = {
      id: consts.EVERY_CONNECTION_ID,
      name: consts.EVERY_CONNECTION_NAME
    };

    if (req.body.userId !== consts.EVERYONE_ID) {
      user = await models.users.findOneById(req.body.userId);
      if (!user) {
        return sendError(res, null, 'User not exists');
      }
      if (user.role === 'admin') {
        return sendError(
          res,
          null,
          'User is admin and already has access to connection'
        );
      }
    }
    if (req.body.connectionId !== consts.EVERY_CONNECTION_ID) {
      connection = await models.connections.findOneById(req.body.connectionId);
      if (!connection) {
        return sendError(res, null, 'Connection not exists');
      }
    }
    let activeAccess = await models.connectionAccesses.findOneActiveByConnectionIdAndUserId(
      req.body.connectionId,
      req.body.userId
    );
    if (activeAccess) {
      return sendError(res, null, 'User has active access to connection');
    }
    let connectionAccess = await models.connectionAccesses.save({
      connectionId: req.body.connectionId,
      connectionName: connection.name,
      userId: req.body.userId,
      userEmail: user.email,
      duration: req.body.duration
    });
    return res.json({ connectionAccess });
  } catch (error) {
    if (error.name === 'ValidationError') {
      sendError(res, error, error.message);
    } else {
      sendError(res, error, 'Problem saving connection');
    }
  }
}

router.post('/api/connection-accesses', mustBeAdmin, createConnectionAccess);

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
async function updateConnectionAccess(req, res) {
  const { models } = req;
  try {
    const connectionAccess = await models.connectionAccesses.expire(
      req.params._id
    );
    return res.json({ connectionAccess });
  } catch (error) {
    sendError(res, error, 'Problem expiring connection accesses');
  }
}

router.put(
  '/api/connection-accesses/:_id/expire',
  mustBeAdmin,
  updateConnectionAccess
);

module.exports = router;
