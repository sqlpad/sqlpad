const passport = require('passport');
const ldap = require('ldapjs');
const appLog = require('../lib/app-log');
const LdapStrategy = require('passport-ldapauth');

/**
 * Convenience wrapper to promisify client.bind() function
 * @param {*} client
 * @param {string} bindDN
 * @param {string} ldapPassword
 */
function bindClient(client, bindDN, ldapPassword) {
  return new Promise((resolve, reject) => {
    client.bind(bindDN, ldapPassword, function (err) {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

/**
 * Convenience wrapper to query ldap and get an array of results
 * If nothing found empty array is returned
 * @param {*} client
 * @param {string} searchBase
 * @param {string} scope - base or sub
 * @param {string} filter - ldap query string
 */
function queryLdap(client, searchBase, scope, filter) {
  const opts = {
    scope,
    filter,
  };
  return new Promise((resolve, reject) => {
    client.search(searchBase, opts, (err, res) => {
      const results = [];
      if (err) {
        return reject(err);
      }

      res.on('searchEntry', function (entry) {
        results.push(entry.object);
      });
      res.on('error', function (err) {
        reject(err);
      });
      res.on('end', function () {
        resolve(results);
      });
    });
  });
}

function enableLdap(config) {
  if (!(config.get('ldapAuthEnabled') || config.get('enableLdapAuth'))) {
    return;
  }

  const bindDN =
    config.get('ldapBindDN') ||
    config.get('ldapUsername') ||
    config.get('ldapUsername_d');

  const bindCredentials =
    config.get('ldapPassword') || config.get('ldapPassword_d');

  const searchBase =
    config.get('ldapSearchBase') ||
    config.get('ldapBaseDN') ||
    config.get('ldapBaseDN_d');

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
          searchBase,
          bindDN,
          bindCredentials,
          searchFilter: config.get('ldapSearchFilter'),
          groupSearchBase: config.get('ldapBaseDN'),
          groupSearchFilter: '(cn={{dn}})',
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

          // Email could be multi-valued
          // For now first is used, but might need to check both in future?
          let email = Array.isArray(profile.mail)
            ? profile.mail[0]
            : profile.mail;

          email = email.toLowerCase();

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
            const client = ldap.createClient({
              url: config.get('ldapUrl'),
            });
            await bindClient(client, bindDN, bindCredentials);

            try {
              if (adminRoleFilter) {
                const filter = `(&${userIdFilter}${adminRoleFilter})`;
                appLog.debug(`Running LDAP search ${filter}`);
                const results = await queryLdap(
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
                appLog.debug(`Running LDAP search ${filter}`);
                const results = await queryLdap(
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

          let user = await models.users.findOneByEmail(email);

          if (user) {
            if (user.disabled) {
              return done(null, false);
            }

            // If a role was set by RBAC and user already exists, but role doesn't match, update it
            if (
              roleSetByRBAC &&
              role &&
              user.syncAuthRole &&
              user.role !== role
            ) {
              const newUser = await models.users.update(user.id, {
                role,
              });
              return done(null, newUser);
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
