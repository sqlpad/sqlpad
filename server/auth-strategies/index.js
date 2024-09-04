import passport from 'passport';
import authProxy from './auth-proxy.js';
import basic from './basic.js';
import disableAuth from './disable-auth.js';
import google from './google.js';
import jwtServiceToken from './jwt-service-token.js';
import ldap from './ldap.js';
import local from './local.js';
import oidc from './oidc.js';
import saml from './saml.js';

// The serializeUser/deserializeUser functions apply regardless of the strategy used.
// Given a user object, extract the id to use for session
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// deserializeUser takes the id from the session and turns it into a user object.
// This user object will decorate req.user
// Note: while passport docs only reference this function taking 2 arguments,
// it can take 3, one of which being the req object
// https://github.com/jaredhanson/passport/issues/743
// https://github.com/passport/www.passportjs.org/pull/83/files
passport.deserializeUser(async function (req, id, done) {
  const { models } = req;
  try {
    const user = await models.users.findOneById(id);
    if (user && !user.disabled) {
      return done(null, user);
    }
    done(null, false);
  } catch (error) {
    done(error);
  }
});

/**
 * Register auth strategies (if configured)
 * @param {object} config
 * @param {object} models
 */
async function authStrategies(config, models) {
  authProxy(config);
  basic(config);
  await disableAuth(config, models);
  google(config);
  jwtServiceToken(config);
  await ldap(config);
  local(config);
  await oidc(config);
  saml(config);
}

export default authStrategies;
