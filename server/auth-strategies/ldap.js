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
        },
      },
      async function passportLdapStrategyHandler(req, profile, done) {
        try {
          const { models } = req;
          const mail = profile.mail.toLowerCase();
          const user = await models.users.findOneByEmail(mail);
          if (!user) {
            return done(null, false, {
              message: 'wrong LDAP username or password',
            });
          }
          if (user.disabled) {
            return done(null, false);
          }
          return done(null, {
            id: user.id,
            role: user.role,
            email: user.email,
          });
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

module.exports = enableLdap;
