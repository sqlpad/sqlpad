// If admin or has connection access then continue
// If no access don't continue but return 200 with an error message
module.exports = [
  async function mustHaveConnectionAccessOrChartLinkNoAuth(req, res, next) {
    const { models, config } = req;

    // If table/chart links do not require auth, let request through
    if (!config.get('tableChartLinksRequireAuth')) {
      return next();
    }

    // If not authenticated, redirect to authenticate (to maintain legacy behavior)
    // TODO respond with 401 in future
    if (!req.user) {
      return res.redirect(config.get('baseUrl') + '/signin');
    }

    // Admins can run all queries regardless of connection access
    if (req.user.role === 'admin') {
      return next();
    }

    // User is not admin, and must have connection access
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
