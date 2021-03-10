const passport = require('passport');
const appLog = require('../lib/app-log');
const checkAllowedDomains = require('../lib/check-allowed-domains.js');
const { Issuer, Strategy } = require('openid-client');

async function openidClientHandler(req, tokenSet, userinfo, done) {
  const { models, config, appLog, webhooks } = req;

  const _json = tokenSet.claims() || {};

  const email = _json.email || _json.preferred_username;
  let name = _json.name;
  if (!name && _json.given_name && _json.family_name) {
    name = `${_json.given_name} ${_json.family_name}`;
  }

  if (!email) {
    appLog.debug('OIDC email not provided');
    return done(null, false, {
      message: 'email not provided',
    });
  }

  try {
    let user = await models.users.findOneByEmail(email);

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
    if (checkAllowedDomains(allowedDomains, email)) {
      const newUser = await models.users.create({
        name,
        email,
        role: 'editor',
        signupAt: new Date(),
      });
      webhooks.userCreated(newUser);
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
async function enableOidc(config) {
  if (config.oidcConfigured()) {
    appLog.info('Enabling OIDC authentication strategy (via openid-client).');

    const baseUrl = config.get('baseUrl');
    const publicUrl = config.get('publicUrl');

    const issuer = await Issuer.discover(config.get('oidcIssuer'));

    const client = new issuer.Client({
      client_id: config.get('oidcClientId'),
      client_secret: config.get('oidcClientSecret'),
      redirect_uris: [`${publicUrl}${baseUrl}/auth/oidc/callback`],
      post_logout_redirect_uris: [`${publicUrl}${baseUrl}`],
    });

    passport.use(
      'oidc',
      new Strategy(
        {
          passReqToCallback: true,
          client,
          params: { scope: 'openid profile email' },
        },
        openidClientHandler
      )
    );
  }
}

module.exports = enableOidc;
