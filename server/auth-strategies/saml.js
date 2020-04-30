const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const appLog = require('../lib/app-log');

/**
 * Adds passport SAML strategy if SAML is configured
 * @param {object} config
 */
function enableSaml(config) {
  if (config.samlAuthConfigured()) {
    appLog.info('Enabling SAML authentication strategy.');

    passport.use(
      new SamlStrategy(
        {
          passReqToCallback: true,
          path: '/login/callback',
          entryPoint: config.get('samlEntryPoint'),
          issuer: config.get('samlIssuer'),
          callbackUrl: config.get('samlCallbackUrl'),
          cert: config.get('samlCert'),
          authnContext: config.get('samlAuthContext'),
          identifierFormat: null,
        },
        async function (req, p, done) {
          const email =
            p[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
            ];
          const { models } = req;
          const user = await models.users.findOneByEmail(email);
          appLog.info('User logged in via SAML %s', email);
          if (!user) {
            return done(null, false);
          }
          return done(null, {
            id: user.id,
            role: user.role,
            email: user.email,
          });
        }
      )
    );
  }
}

module.exports = enableSaml;
