const _ = require('lodash');
const appLog = require('./app-log');
require('../typedefs');


/**
 * Derive header user from request headers
 * @param {Req} req
 */
function getHeaderUser(req) {
  const { config } = req;

  if (!config.get('authProxyEnabled')) {
    return null;
  }

  // Derive headerUser from headers
  let headerUser = {};
  config
    .get('authProxyHeaders')
    .split(' ')
    .forEach((pairing) => {
      const [fieldName, headerName] = pairing.split(':').map((v) => v.trim());
      const value = req.get(headerName);
      if (value !== null && value !== undefined) {
        _.set(headerUser, fieldName, req.get(headerName));
      }
    });

  appLog.warn("getHeaderUser = " + JSON.stringify(headerUser));
  if (Object.keys(headerUser).length > 0) {
    return headerUser;
  }

  return null;
}

module.exports = getHeaderUser;
