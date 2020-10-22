const passport = require('passport');
const appLog = require('../lib/app-log');
const LdapStrategy = require('passport-ldapauth');

function enableLdap(config) {
  if (!(config.get('ldapAuthEnabled') || config.get('enableLdapAuth'))) {
    return;
  }

  appLog.info('Enabling ldap authentication strategy.');
  passport.use(
    new LdapStrategy(
      {
        passReqToCallback: true,
        integrated: false,
        // email field from local auth is used for username when using LDAP
        usernameField: 'email',
        passwordField: 'password',
        server: {
          url: config.get('ldapUrl') || config.get('ldapUrl_d'),
          searchBase:
            config.get('ldapSearchBase') ||
            config.get('ldapBaseDN') ||
            config.get('ldapBaseDN_d'),
          bindDN:
            config.get('ldapBindDN') ||
            config.get('ldapUsername') ||
            config.get('ldapUsername_d'),
          bindCredentials:
            config.get('ldapPassword') || config.get('ldapPassword_d'),
          searchFilter: config.get('ldapSearchFilter'),
          groupSearchBase: config.get('ldapBaseDN'),
          groupSearchFilter: '(cn={{dn}})',
        },
      },
      async function passportLdapStrategyHandler(req, profile, done) {
        try {
          const { models } = req;

          const uid = (profile.uid || profile.sAMAccountName).toLowerCase();
          const adminRoleValue = config.get('ldapRoleAdminValue');
          const editorRoleValue = config.get('ldapRoleEditorValue');
          const roleAttribute = config.get('ldapRoleAttribute');

          // If all rbac configs are set,
          // update role later on if user is found and current role doesn't match
          const rbacByProfile =
            adminRoleValue && editorRoleValue && roleAttribute;

          // Email could be multi-valued
          // For now first is used, but might need to check both in future?
          let email = Array.isArray(profile.mail)
            ? profile.mail[0]
            : profile.mail;

          email = email.toLowerCase();

          let role = config.get('ldapDefaultRole');

          // Get all groups that user belongs to
          // NOTE default is memberOf, which isn't available on all LDAP implementation
          const attributeValue = profile[roleAttribute];

          // match the groups which are predefined, refer to configuration
          // Matching attribute is allowed to be equal if single valued, or containing the designated value if a list
          if (
            attributeValue &&
            (attributeValue === adminRoleValue ||
              (Array.isArray(attributeValue) &&
                attributeValue.includes(adminRoleValue)))
          ) {
            appLog.debug(`${uid} successfully logged in with role admin`);
            role = 'admin';
          } else if (
            attributeValue &&
            (attributeValue === editorRoleValue ||
              (Array.isArray(attributeValue) &&
                attributeValue.includes(editorRoleValue)))
          ) {
            appLog.debug(`${uid} successfully logged in with role editor`);
            role = 'editor';
          }

          let [openAdminRegistration, user] = await Promise.all([
            models.users.adminRegistrationOpen(),
            models.users.findOneByEmail(email),
          ]);

          // not quite sure if uid is returned for ActiveDirectory
          if (!uid) {
            return done(null, false, {
              message: 'wrong LDAP username or password',
            });
          }

          if (user) {
            if (user.disabled) {
              return done(null, false);
            }

            // If user already exists but role doesn't match, update it
            if (user.role !== role && rbacByProfile) {
              const newUser = await models.users.update(user.id, {
                role,
              });
              return done(null, newUser);
            }

            // Otherwise return found user
            return done(null, user);
          }

          if (openAdminRegistration || config.get('ldapAutoSignUp')) {
            appLog.debug(`adding user ${uid} to role ${role}`);
            const newUser = await models.users.create({
              email,
              role,
              signupAt: new Date(),
            });
            return done(null, newUser);
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

module.exports = enableLdap;
