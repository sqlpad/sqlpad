const router = require('express').Router();
const connectionAccessesUtil = require('../models/connectionAccesses.js');
const consts = require('../lib/consts');
const usersUtil = require('../models/users.js');
const connectionUtil = require('../models/connections.js');
const mustBeAdmin = require('../middleware/must-be-admin.js');
const mustBeAuthenticated = require('../middleware/must-be-authenticated.js');
const sendError = require('../lib/sendError');

router.get('/api/connection-accesses', mustBeAuthenticated, async function(
  req,
  res
) {
  try {
    const { query } = req;
    const { includeInactives } = query;
    let connectionAccesses;
    if (includeInactives) {
      connectionAccesses = await connectionAccessesUtil.findAll();
    } else {
      connectionAccesses = await connectionAccessesUtil.findAllActive();
    }
    return res.json({ connectionAccesses });
  } catch (error) {
    sendError(res, error, 'Problem getting connection accesses');
  }
});

router.get('/api/connection-accesses/:_id', mustBeAuthenticated, async function(
  req,
  res
) {
  try {
    const connectionAccess = await connectionAccessesUtil.findOneById(
      req.params._id
    );
    if (!connectionAccess) {
      return sendError(res, null, 'Connection access not found');
    }
    return res.json({ connectionAccess });
  } catch (error) {
    sendError(res, error, 'Problem querying connection access');
  }
});

// crete active connection access
router.post('/api/connection-accesses', mustBeAdmin, async function(req, res) {
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
      user = await usersUtil.findOneById(req.body.userId);
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
      connection = await connectionUtil.findOneById(req.body.connectionId);
      if (!connection) {
        return sendError(res, null, 'Connection not exists');
      }
    }
    let activeAccess = await connectionAccessesUtil.findOneActiveByConnectionIdAndUserId(
      req.body.connectionId,
      req.body.userId
    );
    if (activeAccess) {
      return sendError(res, null, 'User has active access to connection');
    }
    let connectionAccess = await connectionAccessesUtil.save({
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
});

router.put('/api/connection-accesses/:_id/expire', mustBeAdmin, async function(
  req,
  res
) {
  try {
    const connectionAccess = await connectionAccessesUtil.expire(
      req.params._id
    );
    return res.json({ connectionAccess });
  } catch (error) {
    sendError(res, error, 'Problem expiring connection accesses');
  }
});

module.exports = router;
