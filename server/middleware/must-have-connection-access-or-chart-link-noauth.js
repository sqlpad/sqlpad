const mustBeAuthenticated = require('./must-be-authenticated');
const getModels = require('../models');

// If admin or has connection access then continue
// If no access don't continue but return 200 with an error message
module.exports = [
  mustBeAuthenticated,
  async function mustHaveConnectionAccessOrChartLinkNoAuth(req, res, next) {
    const models = getModels(req.nedb);
    if (
      req.user.role === 'admin' ||
      !req.config.get('tableChartLinksRequireAuth')
    ) {
      return next();
    }
    const connectionAccess = await models.connectionAccesses.findOneActiveByConnectionIdAndUserId(
      req.body.connectionId,
      req.user.id
    );
    if (connectionAccess) {
      return next();
    }
    return res.status(200).json({ error: 'No access to this connection' });
  }
];
