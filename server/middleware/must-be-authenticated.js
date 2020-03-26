const passport = require('passport');
const PassportJwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

/**
 * JWT auth is a fallback authentication method for service tokens when no
 * authenticated session in passport created by other strategies like Local
 * Auth, OAuth or SAML
 * @param {object} config
 */
function makeJwtAuth(req, res, next) {
  passport.use(
    new PassportJwtStrategy(
      {
        passReqToCallback: true,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: req.config.get('serviceTokenSecret')
      },
      async function(req, jwt_payload, done) {
        try {
          const { models } = req;
          const serviceToken = await models.serviceTokens.findOneByName(
            jwt_payload.name
          );
          if (!serviceToken) {
            return done(null, false, { message: 'wrong service token' });
          }
          return done(null, serviceToken);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.authenticate('jwt', { session: false })(req, res, next);
}

// If authenticated continue, otherwise try with JWT service tokens or
// redirect user to signin
function mustBeAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  if (req.config.get('serviceTokenSecret')) {
    makeJwtAuth(req, res, next);
  } else {
    // TODO send 401 instead
    // Sending redirect is old behavior, and signin may not even be available based on auth setup
    res.redirect(req.config.get('baseUrl') + '/signin');
  }
}

module.exports = mustBeAuthenticated;
