require('../typedefs');
const _ = require('lodash');
const passport = require('passport');
const passportCustom = require('passport-custom');
const CustomStrategy = passportCustom.Strategy;

/**
 * An auth-proxy custom strategy
 * If enabled, iterate over headers and map the values to a user object
 * Look up that user and perform usual auth validations
 * @param {import('express').Request & Req} req
 * @param {function} done
 */
async function authProxyStrategy(req, done) {
  const { config, models } = req;

  const headerUser = {};

  config
    .get('proxyAuthHeaders')
    .split(' ')
    .forEach(pairing => {
      const [fieldName, headerName] = pairing.split(':').map(v => v.trim());
      _.set(headerUser, fieldName, req.headers[headerName]);
    });

  // nedb uses user._id for ids, but user.id should also be supported
  // If id was used, translate it for _id for now
  if (headerUser.id && !headerUser._id) {
    headerUser._id = headerUser.id;
    delete headerUser.id;
  }

  // If id and email are not provided we don't have anything to look existing user account up with
  // The request is incomplete and not authorized
  if (!headerUser._id && !headerUser.email) {
    return done(null, false);
  }

  if (!headerUser.role && config.get('proxyAuthDefaultRole')) {
    headerUser.role = config.get('proxyAuthDefaultRole');
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

    if (!_.isEqual(existingUser, existingForCompare)) {
      _.merge(existingUser, headerUser);
      existingUser = await models.users.save(existingUser);
    }
    return done(null, existingUser);
  }

  // If auto sign up is turned on create user
  if (config.get('proxyAuthAutoSignUp')) {
    // Auto create the user
    const newUser = await models.users.save(headerUser);
    return done(null, newUser);
  }

  return done(null, false);
}

// Register the custom auth-proxy strategy implementation with passport
passport.use('auth-proxy', new CustomStrategy(authProxyStrategy));

/**
 * @param {import('express').Request & Req} req
 * @param {*} res
 */
function passportProxyAuth(req, res, next) {
  if (!req.isAuthenticated() && req.config.get('proxyAuthEnabled')) {
    return passport.authenticate('auth-proxy', { session: false })(
      req,
      res,
      next
    );
  }
  next();
}

module.exports = passportProxyAuth;
