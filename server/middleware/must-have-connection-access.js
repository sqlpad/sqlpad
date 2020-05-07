const mustBeAuthenticated = require('./must-be-authenticated');

// If admin or has connection access then continue
// If no access don't continue but return 200 with an error message
module.exports = [
  mustBeAuthenticated,
  async function mustHaveConnectionAccess(req, res, next) {
    try {
      const { models } = req;
      if (req.user.role === 'admin') {
        return next();
      }
      const connectionId = req.params.connectionId || req.body.connectionId;
      const connectionAccess = await models.connectionAccesses.findOneActiveByConnectionIdAndUserId(
        connectionId,
        req.user.id
      );
      if (connectionAccess) {
        return next();
      }
      return res.utils.forbidden();
    } catch (error) {
      next(error);
    }
  },
];
