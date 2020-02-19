const config = require('../lib/config');

// If authenticated or setting allows it continue. Otherwise redirect user to signin
module.exports = function mustBeAuthenticatedOrChartLinkNoAuth(req, res, next) {
  if (req.isAuthenticated() || !config.get('tableChartLinksRequireAuth')) {
    return next();
  }
  res.redirect(config.get('baseUrl') + '/signin');
};
