import passport from 'passport';
import { Strategy as PassportJwtStrategy, ExtractJwt } from 'passport-jwt';
import appLog from '../lib/app-log.js';

/**
 * Adds JWT Service Token auth strategy if configured
 *
 * JWT auth is a fallback authentication method for service tokens when no
 * authenticated session in passport created by other strategies like Local
 * Auth, OAuth or SAML
 * @param {object} config
 */
function enableJwtServiceToken(config) {
  const serviceTokenSecret = config.get('serviceTokenSecret');

  if (serviceTokenSecret) {
    appLog.info('Enabling JWT Service Token authentication strategy.');

    passport.use(
      new PassportJwtStrategy(
        {
          passReqToCallback: true,
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: serviceTokenSecret,
        },
        async function (req, jwt_payload, done) {
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
  }
}

export default enableJwtServiceToken;
