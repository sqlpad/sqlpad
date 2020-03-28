require('../typedefs');
const passport = require('passport');
const _ = require('lodash');

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
function passportAuthProxy(req, res, next) {
  const { config } = req;

  if (!req.isAuthenticated() && config.get('authProxyEnabled')) {
    // Derive headerUser from headers
    let headerUser = {};
    config
      .get('authProxyHeaders')
      .split(' ')
      .forEach(pairing => {
        const [fieldName, headerName] = pairing.split(':').map(v => v.trim());
        const value = req.get(headerName);
        if (value !== null && value !== undefined) {
          _.set(headerUser, fieldName, req.get(headerName));
        }
      });

    // nedb uses user._id for ids, but user.id should also be supported
    // However .id should always be deleted
    if (headerUser.id && !headerUser._id) {
      headerUser._id = headerUser.id;
    }
    delete headerUser.id;

    // Only try to authenticate if headers are present to identify a user
    // We otherwise assume the request is not meant to be authenticated (not all routes require it)
    // This is necessary for routes that do not require authentication.
    if (Object.keys(headerUser).length > 0) {
      // Set req.headerUser for auth-proxy reference later
      req.headerUser = headerUser;
      return passport.authenticate('auth-proxy', { session: false })(
        req,
        res,
        next
      );
    }
  }
  next();
}

module.exports = passportAuthProxy;
