require('../typedefs');
const _ = require('lodash');
const passport = require('passport');
const passportCustom = require('passport-custom');
const CustomStrategy = passportCustom.Strategy;

/**
 * Derive user object from headers and authProxyHeaders config
 * If no headers are defined or mapped, null is returned
 * @param {import('express').Request & Req} req
 */
function getHeaderUser(req) {
  const { config } = req;
  const headerUser = {};
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

  if (Object.keys(headerUser).length > 0) {
    return headerUser;
  }
  return null;
}

/**
 * An auth-proxy custom strategy
 * If enabled, iterate over headers and map the values to a user object
 * Look up that user and perform usual auth validations
 * @param {import('express').Request & Req} req
 * @param {function} done
 */
async function authProxyStrategy(req, done) {
  try {
    const { config, models } = req;

    const headerUser = getHeaderUser(req) || {};

    // If id and email are not provided we don't have anything to look existing user account up with
    // The request is incomplete and not authorized
    if (!headerUser._id && !headerUser.email) {
      return done(null, false);
    }

    if (!headerUser.role && config.get('authProxyDefaultRole')) {
      headerUser.role = config.get('authProxyDefaultRole');
    }

    // Try to find existing user in SQLPad's db
    // This tries to find a match on both id and email, with id taking priority
    let existingUser;
    if (headerUser._id) {
      existingUser = await models.users.findOneById(headerUser._id);
    }
    if (!existingUser && headerUser.email) {
      existingUser = await models.users.findOneByEmail(headerUser.email);
    }

    // If existing user is found, see if there are changes and update it
    // Only perform update if actual changes though
    if (existingUser) {
      // Get a subset of existing user to use for comparison
      const existingForCompare = {};
      Object.keys(headerUser).forEach(key => {
        existingForCompare[key] = existingUser[key];
      });

      if (!_.isEqual(headerUser, existingForCompare)) {
        _.merge(existingUser, headerUser);
        existingUser = await models.users.save(existingUser);
      }
      return done(null, existingUser);
    }

    // If auto sign up is turned on create user
    if (config.get('authProxyAutoSignUp')) {
      // If role or email are not provided no auth
      if (!headerUser.role || !headerUser.email) {
        return done(null, false);
      }

      // Auto create the user
      const newUser = await models.users.save(headerUser);
      return done(null, newUser);
    }

    return done(null, false);
  } catch (error) {
    done(error);
  }
}

// Register the custom auth-proxy strategy implementation with passport
passport.use('auth-proxy', new CustomStrategy(authProxyStrategy));

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
