const passport = require('passport');
const authProxy = require('./auth-proxy');
const basic = require('./basic');
const disableAuth = require('./disable-auth');
const google = require('./google');
const jwtServiceToken = require('./jwt-service-token');
const ldap = require('./ldap');
const local = require('./local');
const saml = require('./saml');

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
  ldap(config);
  local(config);
  saml(config);
}

module.exports = authStrategies;
