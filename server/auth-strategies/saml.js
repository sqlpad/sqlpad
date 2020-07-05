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
          entryPoint:
            config.get('samlEntryPoint') || config.get('samlEntryPoint_d'),
          issuer: config.get('samlIssuer') || config.get('samlIssuer_d'),
          callbackUrl:
            config.get('samlCallbackUrl') || config.get('samlCallbackUrl_d'),
          cert: config.get('samlCert') || config.get('samlCert_d'),
          authnContext:
            config.get('samlAuthContext') || config.get('samlAuthContext_d'),
          identifierFormat: null,
        },
        async function (req, p, done) {
          const email =
            p[
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
            ];

          // If email is not provided - no auth
          if (!email) {
            return done(null, false);
          }
          appLog.info('User attempts log in via SAML %s', email);

          const { models } = req;

          let [openAdminRegistration, user] = await Promise.all([
            models.users.adminRegistrationOpen(),
            models.users.findOneByEmail(email),
          ]);

          if (user) {
            if (user.disabled) {
              return done(null, false);
            }
            return done(null, {
              id: user.id,
              role: user.role,
              email: user.email,
            });
          }

          // If auto sign up is turned on create user
          if (openAdminRegistration || config.get('samlAutoSignUp')) {
            const newUser = await models.users.create({
              email,
              role: openAdminRegistration
                ? 'admin'
                : config.get('samlDefaultRole') ||
                  config.get('samlDefaultRole_d'),
              signupAt: new Date(),
            });

            return done(null, newUser);
          }

          return done(null, false);
        }
      )
    );
  }
}

module.exports = enableSaml;
