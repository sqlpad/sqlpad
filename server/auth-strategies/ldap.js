const passport = require('passport');
const LdapStrategy = require('passport-ldapauth');
const appLog = require('../lib/app-log');
const ldapUtils = require('../lib/ldap-utils');

async function enableLdap(config) {
  if (!config.get('ldapAuthEnabled')) {
    return;
  }

  const bindDN = config.get('ldapBindDN');
  const bindCredentials = config.get('ldapPassword');
  const searchBase = config.get('ldapSearchBase');
  const adminRoleFilter = config.get('ldapRoleAdminFilter');
  const editorRoleFilter = config.get('ldapRoleEditorFilter');

  // Derive what the ldapDefaultRole should be from config
  // Value in config could be `editor`, `admin`, `denied` or empty string
  // Only `editor` and `admin` are valid roles - anything else is effectively disabling setting a default role
  let ldapDefaultRole = config.get('ldapDefaultRole').toLowerCase().trim();

  const validRoles = new Set(['editor', 'admin']);
  if (!validRoles.has(ldapDefaultRole)) {
    ldapDefaultRole = '';
  }

  appLog.info('Enabling LDAP authentication strategy.');

  appLog.debug('Checking LDAP bind config');
  const canBind = await ldapUtils.ldapCanBind(config);
  if (canBind) {
    appLog.debug('LDAP bind successful');
  } else {
    appLog.warn(
      'LDAP bind attempt failed. LDAP auth will still be configured.'
    );
  }

  passport.use(
    new LdapStrategy(
      {
        passReqToCallback: true,
        integrated: false,
        // email field from local auth is used for username when using LDAP
        usernameField: 'email',
        passwordField: 'password',
        server: {
          url: config.get('ldapUrl'),
          searchBase,
          bindDN,
          bindCredentials,
          searchFilter: config.get('ldapSearchFilter'),
          groupSearchBase: config.get('ldapSearchBase'),
          groupSearchFilter: '(cn={{dn}})',
          log: appLog.logger,
        },
      },
      async function passportLdapStrategyHandler(req, profile, done) {
        try {
          const { models } = req;

          if (!profile) {
            appLog.debug(`No LDAP profile found for user ${req.body.email}`);
            return done(null, false, {
              message: 'wrong LDAP username or password',
            });
          }

          // At least with test setup, jpegPhoto is gnarly output
          // Remove prior to logging
          delete profile.jpegPhoto;
          appLog.debug(profile, 'Found LDAP profile');

          const profileUsername = profile.uid || profile.sAMAccountName;

          if (!profileUsername) {
            appLog.warn(
              profile,
              `Found LDAP profile, but uid or sAMAccountName fields are missing. SQLPad's LDAP auth implementation requires enhancements to support your environment.`
            );
            return done(null, false, {
              message: 'wrong LDAP username or password',
            });
          }

          // Derive a userId fiter based on profile that is found
          // ActiveDirectory will have sAMAccountName, while OpenLDAP will have uid
          let userIdFilter = '';
          if (profile.sAMAccountName) {
            userIdFilter = `(sAMAccountName=${profile.sAMAccountName})`;
          } else if (profile.uid) {
            userIdFilter = `(uid=${profile.uid})`;
          }

          // Mail may not always be available on profile
          let email = Array.isArray(profile.mail)
            ? profile.mail[0]
            : profile.mail;

          if (typeof email === 'string') {
            email = email.toLowerCase().trim();
          }

          const ldapId = profileUsername.toLowerCase();

          let role = '';

          // Create a variable to keep track if role is set by RBAC
          // If it is, update role later on if user is found and current role doesn't match
          let roleSetByRBAC = false;

          // If admin or editor role filters are specified, open a connection to LDAP server and run additional queries
          // Try to find a role by running searches with a restriction on user that was found
          // Searches should start with most priveleged, then progress onward
          // If a row is returned, the user can be assigned that role and no other queries are needed
          if (adminRoleFilter || editorRoleFilter) {
            roleSetByRBAC = true;

            // Establish LDAP client to make additional queries
            const client = ldapUtils.getClient(config);

            await ldapUtils.bindClient(client, bindDN, bindCredentials);

            try {
              if (adminRoleFilter) {
                const filter = `(&${userIdFilter}${adminRoleFilter})`;
                const results = await ldapUtils.queryLdap(
                  client,
                  searchBase,
                  'sub',
                  filter
                );
                if (results.length > 0) {
                  appLog.debug(
                    `${profileUsername} successfully logged in with role admin`
                  );
                  role = 'admin';
                }
              }

              // If role wasn't found for admin, try running editor search
              if (!role && editorRoleFilter) {
                const filter = `(&${userIdFilter}${editorRoleFilter})`;
                const results = await ldapUtils.queryLdap(
                  client,
                  searchBase,
                  'sub',
                  filter
                );
                if (results.length > 0) {
                  appLog.debug(
                    `${profileUsername} successfully logged in with role editor`
                  );
                  role = 'editor';
                }
              }

              // Close connection to LDAP server
              client.unbind();
            } catch (error) {
              // If an error happened, make sure LDAP connection is closed then rethrow error
              client.unbind();
              throw error;
            }
          }

          // Find user. Try email first, then ldapId (username) as a fallback
          // Email might not have been populated
          let user;
          if (email) {
            user = await models.users.findOneByEmail(email);
          }
          // There was a brief time in master branch where username was stored in email so try this too
          if (!user) {
            user = await models.users.findOneByEmail(ldapId);
          }
          if (!user) {
            user = await models.users.findOneByLdapId(ldapId);
          }

          if (user) {
            if (user.disabled) {
              return done(null, false);
            }

            const updates = {};

            // If a role was set by RBAC and user already exists, but role doesn't match, update it
            if (
              roleSetByRBAC &&
              role &&
              user.syncAuthRole &&
              user.role !== role
            ) {
              updates.role = role;
            }

            // If ldapId has not been captured yet, or it is different update it
            if (user.ldapId !== ldapId) {
              updates.ldapId = ldapId;
            }

            if (Object.keys(updates).length > 0) {
              const updatedUser = await models.users.update(user.id, updates);
              return done(null, updatedUser);
            }

            // Otherwise return found user
            return done(null, user);
          }

          // At this point user was not found
          // A decision needs to be made to either create or reject the user

          // If role is still not set, and default is provided, use that
          if (!role) {
            role = ldapDefaultRole;
          }

          // If role is set and ldap auto sign up is turned on, create user
          if (role && config.get('ldapAutoSignUp')) {
            appLog.debug(`adding user ${profileUsername} to role ${role}`);
            const newUser = await models.users.create({
              email,
              ldapId,
              role,
              syncAuthRole: true,
              signupAt: new Date(),
            });
            return done(null, newUser);
          }

          // If no user was found, and config does not allow initial log in or auto-creating users,
          // Return not authorized
          return done(null, false);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

module.exports = enableLdap;
