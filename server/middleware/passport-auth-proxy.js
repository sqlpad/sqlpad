require('../typedefs');
const passport = require('passport');
const getHeaderUser = require('../auth-strategies/get-header-user');

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
function passportProxyAuth(req, res, next) {
  if (!req.isAuthenticated() && req.config.get('authProxyEnabled')) {
    // Only try to authenticate if headers are present to identify a user
    // This is necessary for routes that do not require authentication.
    // It may make sense to move all auth like this into the middleware that requires auth?
    const headerUser = getHeaderUser(req);
    if (!headerUser) {
      return next();
    }

    return passport.authenticate('auth-proxy', { session: false })(
      req,
      res,
      next
    );
  }
  next();
}

module.exports = passportProxyAuth;
