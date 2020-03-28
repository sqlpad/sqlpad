const passport = require('passport');

module.exports = function(req, res, next) {
  if (
    !req.config.get('disableUserpassAuth') &&
    req.headers.authorization &&
    req.headers.authorization.startsWith('Basic ')
  ) {
    return passport.authenticate('basic', { session: false })(req, res, next);
  }
  next();
};
