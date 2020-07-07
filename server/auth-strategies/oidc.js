const passport = require('passport');
const OidcStrategy = require('passport-openidconnect').Strategy;
const appLog = require('../lib/app-log');
const checkAllowedDomains = require('../lib/check-allowed-domains.js');

async function passportOidcStrategyHandler(
  req,
  issuer,
  sub,
  profile,
  accessToken,
  refreshToken,
  done
) {
  const { models, config, appLog } = req;
  const _json = profile._json || {};

  // _json.sub appears to be an id. Is it? Should .sub be used for SQLPad user id?
  // Unsure if email ever doesn't exist if email claim is requested,
  // but just in case fall back to preferred_username
  const email = _json.email || _json.preferred_username;
  const name = _json.name;

  if (!email) {
    appLog.debug('OIDC email not provided');
    return done(null, false, {
      message: 'email not provided',
    });
  }

  try {
    let [openAdminRegistration, user] = await Promise.all([
      models.users.adminRegistrationOpen(),
      models.users.findOneByEmail(email),
    ]);

    if (user) {
      if (user.disabled) {
        appLog.debug(`OIDC User ${email} is disabled`);
        return done(null, false);
      }
      user.signupAt = new Date();
      const newUser = await models.users.update(user.id, {
        name,
        signupAt: new Date(),
      });
      appLog.debug(`OIDC User ${email} updated`);
      return done(null, newUser);
    }
    const allowedDomains = config.get('allowedDomains');
    if (openAdminRegistration || checkAllowedDomains(allowedDomains, email)) {
      const newUser = await models.users.create({
        name,
        email,
        role: openAdminRegistration ? 'admin' : 'editor',
        signupAt: new Date(),
      });
      appLog.debug(`OIDC User ${email} created`);
      return done(null, newUser);
    }
    // at this point we don't have an error, but authentication is invalid
    // per passport docs, we call done() here without an error
    // instead passing false for user and a message why
    appLog.debug(`OIDC User ${email} not allowed`);
    return done(null, false, {
      message: "You haven't been invited by an admin yet.",
    });
  } catch (error) {
    done(error, null);
  }
}

/**
 * Adds OIDC auth strategy if OIDC auth is configured
 * @param {object} config
 */
function enableOidc(config) {
  if (config.oidcConfigured()) {
    appLog.info('Enabling OIDC authentication strategy.');

    const baseUrl = config.get('baseUrl');
    const publicUrl = config.get('publicUrl');

    passport.use(
      'oidc',
      new OidcStrategy(
        {
          passReqToCallback: true,
          issuer: config.get('oidcIssuer'),
          authorizationURL: config.get('oidcAuthorizationUrl'),
          tokenURL: config.get('oidcTokenUrl'),
          userInfoURL: config.get('oidcUserInfoUrl'),
          clientID: config.get('oidcClientId'),
          clientSecret: config.get('oidcClientSecret'),
          callbackURL: publicUrl + baseUrl + '/auth/oidc/callback',
          scope: 'openid profile email',
        },
        passportOidcStrategyHandler
      )
    );
  }
}

module.exports = enableOidc;
