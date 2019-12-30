const mustBeAuthenticated = require('./must-be-authenticated');
const connectionAccessesUtil = require('../models/connectionAccesses.js');

// If admin or has connection access then continue
// If no access don't continue but return 200 with an error message
module.exports = [
  mustBeAuthenticated,
  async function mustHaveConnectionAccess(req, res, next) {
    if (req.user.role === 'admin') {
      return next();
    }
    const connectionId = req.params.connectionId || req.body.connectionId;
    const connectionAccess = await connectionAccessesUtil.findOneActiveByConnectionIdAndUserId(
      connectionId,
      req.user.id
    );
    if (connectionAccess) {
      return next();
    }
    return res.status(200).json({ error: 'No access to this connection' });
  }
];
