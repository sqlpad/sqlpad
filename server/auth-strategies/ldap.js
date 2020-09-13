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
          groupSearchBase: config.get('ldapBaseDN'),
          groupSearchFilter: '(cn={{dn}})',
        },
      },
      async function passportLdapStrategyHandler(req, profile, done) {
        try {
          const { models } = req;
          const email = profile.mail.toLowerCase();
          const uid   = profile.uid.toLowerCase();
          const admin_group = config.get('sqlpadLadpAdminGroupDn');
          const editor_group = config.get('sqlpadLadpEditorGroupDn');

          // get all groups that user belongs to, not sure how to substitue memberOf from env var
          const groups = profile.memberOf;
         // match the groups which are predefined, refer to configuration
         if (groups.includes(admin_group)) {
            appLog.debug(`${uid} successfully logged in with role admin`);
            global.role = 'admin';
          } else if (groups.includes(editor_group)) {
           appLog.debug(`${uid} successfully logged in with role editor`);
           global.role = 'editor';
         } else {
           appLog.error(`${uid} does not belong to any of the specified ldap groups`);
         }

          let [openAdminRegistration, user] = await Promise.all([
            models.users.adminRegistrationOpen(),
            models.users.findOneByEmail(email),
          ]);
         
         // not quite sure if uid is retruned for ActiveDirectory
          if (!uid) {
            return done(null, false, {
              message: 'wrong LDAP username or password',
            });
          }
          if (user.disabled) {
            return done(null, false);
          }
          // always update role
           const newUser = await models.users.update(user.id, {
           role: global.role,
          });

          return done(null, {
            id: user.id,
            role: user.role,
            email: user.email,
          });

        // if SQLPAD_LDAP_AUTO_SIGN_UP=true
          if (openAdminRegistration ||config.get('ldapAutoSignUp')) {
          appLog.debug(`adding user ${uid} to role ${global.role}`);
          const newUser = await models.users.create({
           email,
           role: global.role,
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
