require('../typedefs');
const router = require('express').Router();
const consts = require('../lib/consts');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const wrap = require('../lib/wrap');

// TODO - Separate out validation from saving to prevent having to intercept save error and respond accordingly

/**
 * @param {Req} req
 * @param {Res} res
 */
async function listConnectionAccesses(req, res) {
  const { models } = req;
  const { includeInactives } = req.query;
  let connectionAccesses;
  if (includeInactives) {
    connectionAccesses = await models.connectionAccesses.findAll();
  } else {
    connectionAccesses = await models.connectionAccesses.findAllActive();
  }
  return res.utils.data(connectionAccesses);
}

router.get(
  '/api/connection-accesses',
  mustBeAuthenticated,
  wrap(listConnectionAccesses)
);

/**
 * @param {Req} req
 * @param {Res} res
 */
async function getConnectionAccess(req, res) {
  const { models } = req;
  const connectionAccess = await models.connectionAccesses.findOneById(
    req.params.id
  );
  return res.utils.data(connectionAccess);
}

router.get(
  '/api/connection-accesses/:id',
  mustBeAuthenticated,
  wrap(getConnectionAccess)
);

/**
 * @param {Req} req
 * @param {Res} res
 */
async function createConnectionAccess(req, res) {
  const { models } = req;

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
      return res.utils.error('User does not exist');
    }
    if (user.role === 'admin') {
      return res.utils.error(
        'User is admin and already has access to connection'
      );
    }
  }
  if (req.body.connectionId !== consts.EVERY_CONNECTION_ID) {
    connection = await models.connections.findOneById(req.body.connectionId);
    if (!connection) {
      return res.utils.error('Connection does not exist');
    }
  }
  let activeAccess = await models.connectionAccesses.findOneActiveByConnectionIdAndUserId(
    req.body.connectionId,
    req.body.userId
  );
  if (activeAccess) {
    return res.utils.error('User has active access to connection');
  }
  let connectionAccess = await models.connectionAccesses.create({
    connectionId: req.body.connectionId,
    connectionName: connection.name,
    userId: req.body.userId,
    userEmail: user.email,
    duration: req.body.duration
  });
  return res.utils.data(connectionAccess);
}

router.post(
  '/api/connection-accesses',
  mustBeAdmin,
  wrap(createConnectionAccess)
);

/**
 * @param {Req} req
 * @param {Res} res
 */
async function updateConnectionAccess(req, res) {
  const { models } = req;
  const connectionAccess = await models.connectionAccesses.expire(
    req.params.id
  );
  return res.utils.data(connectionAccess);
}

router.put(
  '/api/connection-accesses/:id/expire',
  mustBeAdmin,
  wrap(updateConnectionAccess)
);

module.exports = router;
