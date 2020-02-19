const config = require('../lib/config');

// If authenticated continue. otherwise redirect user to signin
module.exports = function mustBeAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect(config.get('baseUrl') + '/signin');
};
