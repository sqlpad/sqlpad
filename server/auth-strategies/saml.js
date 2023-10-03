const passport = require('passport');
const SamlStrategy = require('@node-saml/passport-saml').Strategy;
const appLog = require('../lib/app-log');

/**
 * Lookup table to make code below more readable.
 * For AzureAD claims see, https://docs.microsoft.com/nl-nl/azure/active-directory/develop/reference-saml-tokens
 */
const CLAIMS = {
  emailaddress:
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  family_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
  given_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
  display_name: 'http://schemas.microsoft.com/identity/claims/displayname',
  role: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  groups: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups',
};

/**
 * This should ne widely accaptable.
 * @param {import('passport-saml').Profile} p
 */
function getSamlName(p) {
  // azure...
  if (CLAIMS.display_name in p) return p[CLAIMS.display_name];

  // The two below are not always available so lets hope display_name captures that.
  /** @type string | undefined */
  const family_name = p[CLAIMS.family_name];
  /** @type string | undefined */
  const given_name = p[CLAIMS.given_name];

  if (family_name && given_name) {
    return `${given_name} ${family_name}`;
  }

  return undefined;
}

/**
 * Use claims to determine the role of the user instead of having it managed in SQLPad.
 *
 * @param {import('passport-saml').Profile} p
 */
function isAdmin(p, samlAdminGroup) {
  // The saml api only gives an array if more then one value for an attribute is given otherwise a plain string.

  /**
   * This one is AzureAD specific, and emulates the OIDC roles structure in SAML.
   *
   * @type string[] | undefined
   */
  const appRoles = p[CLAIMS.role];
  if (appRoles) {
    // So in case multiple roles are send.
    if (Array.isArray(appRoles) && appRoles.include('admin')) return true;
    else if (appRoles === 'admin') return true;
  }

  /** In AzureAd this may need to be enabled explicitly */
  if (samlAdminGroup && samlAdminGroup.length > 0) {
    /**
     * This one is AzureAD specific, but allows you to specify access based on a AD group.
     * NOTE: it is almost always a UUID, but it can be remapped to a group attribute in AzureAD.
     * @type string[] | undefined
     */
    const userGroups = p[CLAIMS.groups];
    if (userGroups) {
      if (Array.isArray(userGroups) && userGroups.includes(samlAdminGroup))
        return true;
      else if (userGroups === samlAdminGroup) return true;
    }
  }

  return false;
}

function getSamlRole(p, samlAdminGroup, samlDefaultRole) {
  if (isAdmin(p, samlAdminGroup)) return 'admin';
  return samlDefaultRole;
}

/**
 * Adds passport SAML strategy if SAML is configured
 * @param {object} config
 */
function enableSaml(config) {
  if (config.samlAuthConfigured()) {
    appLog.info('Enabling SAML authentication strategy.');

    const samlEnforcedRole =
      config.get('samlEnforcedRole') === 'true' ||
      config.get('samlEnforcedRole') === true;

    /**
     * @type string
     */
    const samlAdminGroup = config.get('samlAdminGroup');

    /**
     * It is best to keep this 'editor' and use claims to manage admin role for SQLPAD.
     * @type string
     */
    const samlDefaultRole = config.get('samlDefaultRole');

    // FIX: https://github.com/node-saml/passport-saml/blob/v3.1.2/src/node-saml/types.ts#L101
    let samlAuthContext = config.get('samlAuthContext');
    if (samlAuthContext && !Array.isArray(samlAuthContext)) {
      samlAuthContext = [samlAuthContext];
    }

    passport.use(
      'saml',
      new SamlStrategy(
        {
          passReqToCallback: true,
          path: '/login/callback',
          entryPoint: config.get('samlEntryPoint'),
          issuer: config.get('samlIssuer'),
          callbackUrl: config.get('samlCallbackUrl'),
          cert: config.get('samlCert'),
          authnContext: samlAuthContext,
          identifierFormat: null,
        },
        async function (req, p, done) {
          const email = p[CLAIMS.emailaddress];
          // If email is not provided - no auth
          if (!email) {
            return done(null, false);
          }

          const name = getSamlName(p);

          const { models, webhooks } = req;

          let user = await models.users.findOneByEmail(email);

          /** @type string */
          const samlAssignedRole = getSamlRole(
            p,
            samlAdminGroup,
            samlDefaultRole
          );

          if (user) {
            if (user.disabled) {
              return done(null, false);
            }
            if (samlEnforcedRole && user.role !== samlAssignedRole) {
              appLog.debug(
                `User '${email}' role changed to '${samlAssignedRole}' based on SAML attributes`
              );
              user = await models.users.update(user.id, {
                name,
                role: samlAssignedRole,
                signupAt: new Date(),
              });
            }
            return done(null, user);
          }

          // If auto sign up is turned on create user
          if (config.get('samlAutoSignUp')) {
            appLog.debug(
              `User '${email}' created with role '${samlAssignedRole}' based on SAML attributes`
            );
            const newUser = await models.users.create({
              name,
              email,
              role: samlAssignedRole,
              signupAt: new Date(),
            });
            webhooks.userCreated(newUser);
            return done(null, newUser);
          }

          return done(null, false);
        }
      )
    );
  }
}

module.exports = enableSaml;
