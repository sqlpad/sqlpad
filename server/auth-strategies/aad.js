const passport = require('passport');
const appLog = require('../lib/app-log');
const checkAllowedDomains = require('../lib/check-allowed-domains');
const { Issuer, Strategy } = require('openid-client');

async function aadClientHandler(req, tokenSet, userinfo, done) {
  const { models, config, appLog, webhooks } = req;

  const _json = tokenSet.claims() || {};
  const email = _json.email || _json.preferred_username;
  let name = _json.name;
  if (!name && _json.given_name && _json.family_name) {
    name = `${_json.given_name} ${_json.family_name}`;
  }

  if (!email) {
    appLog.debug('AAD email not provided');
    return done(null, false, {
      message: 'email not provided',
    });
  }
  let role = 'editor';
  if (_json.roles && _json.roles.includes('admin')) {
    role = 'admin';
  }
  try {
    let user = await models.users.findOneByEmail(email);

    if (user) {
      if (user.disabled) {
        appLog.debug(`AAD User ${email} is disabled`);
        return done(null, false);
      }
      user.signupAt = new Date();
      const newUser = await models.users.update(user.id, {
        name,
        role,
        signupAt: new Date(),
      });
      appLog.debug(`AAD User ${email} updated`);
      return done(null, newUser);
    }
    const allowedDomains = config.get('allowedDomains');
    if (checkAllowedDomains(allowedDomains, email)) {
      const newUser = await models.users.create({
        name,
        email,
        role,
        signupAt: new Date(),
      });
      webhooks.userCreated(newUser);
      appLog.debug(`AAD User ${email} created`);
      return done(null, newUser);
    }
    // at this point we don't have an error, but authentication is invalid
    // per passport docs, we call done() here without an error
    // instead passing false for user and a message why
    appLog.debug(`AAD User ${email} not allowed`);
    return done(null, false, {
      message: "You haven't been invited by an admin yet.",
    });
  } catch (error) {
    done(error, null);
  }
}

/**
 * Adds AAD auth strategy if AAD auth is configured
 * @param {object} config
 */
async function enableAad(config) {
  if (config.aadConfigured()) {
    appLog.info('Enabling AAD authentication strategy (via openid-client).');

    const baseUrl = config.get('baseUrl');
    const publicUrl = config.get('publicUrl');
    const tenantId = config.get('aadTenantId');

    const issuer = await Issuer.discover(
      `https://login.microsoftonline.com/${tenantId}/v2.0`
    );

    const client = new issuer.Client({
      client_id: config.get('aadClientId'),
      client_secret: config.get('aadClientSecret'),
      redirect_uris: [`${publicUrl}${baseUrl}/auth/aad/callback`],
      post_logout_redirect_uris: [`${publicUrl}${baseUrl}`],
    });

    passport.use(
      'aad',
      new Strategy(
        {
          passReqToCallback: true,
          client,
          params: { scope: 'openid profile email' },
        },
        aadClientHandler
      )
    );
  }
}

module.exports = enableAad;
