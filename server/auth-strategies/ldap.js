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
         // Enable Group Search, very  limited RBAC
         // searchfilter should include the group
         // SQLPAD_LDAP_SEARCH_FILTER='(&(uid={{username}})(memberOf=<GROUP_DN>))'
          groupSearchBase: config.get('ldapBaseDN'),
          groupSearchFilter: '(cn={{dn}})',
        },
      },
      async function passportLdapStrategyHandler(req, profile, done) {
        try {
          const { models } = req;
          const email = profile.mail.toLowerCase();
          const user = await models.users.findOneByEmail(mail);
          let [openAdminRegistration, user] = await Promise.all([
            models.users.adminRegistrationOpen(),
            models.users.findOneByEmail(email),
          ]);
          if (email!) {
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

        //If SQLPAD_LDAP_AUTO_SIGN_UP=true
          if (openAdminRegistration ||config.get('ldapAutoSignUp')) {
          const newUser = await models.users.create({
           email,
           role: config.get('ldapDefaultRole'),
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
