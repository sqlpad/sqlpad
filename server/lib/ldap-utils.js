const ldap = require('ldapjs');
const appLog = require('./app-log');

/**
 * Create ldap client
 * @param {*} config
 */
function getClient(config) {
  const client = ldap.createClient({
    url: config.get('ldapUrl'),
  });

  // An error listener must be registered,
  // otherwise error is thrown deep within the stack and cannot be caught
  // We'll get an error during bind attempt, so this can mostly be ignored
  client.on('error', (err) => {
    appLog.error(err);
  });

  return client;
}

/**
 * Convenience wrapper to promisify client.bind() function
 * @param {*} client
 * @param {string} bindDN
 * @param {string} ldapPassword
 */
function bindClient(client, bindDN, ldapPassword) {
  appLog.trace(`LDAP bind to ${bindDN}`);
  return new Promise((resolve, reject) => {
    client.bind(bindDN, ldapPassword, function (err) {
      if (err) {
        appLog.trace(err, 'LDAP bind error');
        return reject(err);
      }
      appLog.trace('LDAP bind success');
      return resolve();
    });
  });
}

/**
 * Tries to bind and returns boolean.
 * Connection is immediately closed.
 * @param {import('./config/index')} config
 */
async function ldapCanBind(config) {
  if (!config.get('ldapAuthEnabled')) {
    return;
  }

  const bindDN = config.get('ldapBindDN');
  const bindCredentials = config.get('ldapPassword');

  // Establish LDAP client
  let client;
  let canBind = false;

  try {
    client = getClient(config);
    await bindClient(client, bindDN, bindCredentials);
    canBind = true;
  } catch (error) {
    appLog.error(error, 'Error binding ldap');
  }

  // try to unbind in case connected
  try {
    if (client) {
      client.unbind();
    }
  } catch (error) {
    // ignore error
  }

  return canBind;
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

  appLog.debug(opts, `Running LDAP search with searchBase ${searchBase}`);

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

module.exports = {
  bindClient,
  ldapCanBind,
  queryLdap,
  getClient,
};
