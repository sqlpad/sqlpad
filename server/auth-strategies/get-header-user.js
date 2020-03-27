require('../typedefs');
const _ = require('lodash');

/**
 * Derive user object from headers and authProxyHeaders config
 * If no headers are defined or mapped, null is returned
 * @param {import('express').Request & Req} req
 */
function getHeaderUser(req) {
  const { config } = req;
  const headerUser = {};
  config
    .get('authProxyHeaders')
    .split(' ')
    .forEach(pairing => {
      const [fieldName, headerName] = pairing.split(':').map(v => v.trim());
      const value = req.get(headerName);
      if (value !== null && value !== undefined) {
        _.set(headerUser, fieldName, req.get(headerName));
      }
    });

  // nedb uses user._id for ids, but user.id should also be supported
  // However .id should always be deleted
  if (headerUser.id && !headerUser._id) {
    headerUser._id = headerUser.id;
  }
  delete headerUser.id;

  if (Object.keys(headerUser).length > 0) {
    return headerUser;
  }
  return null;
}

module.exports = getHeaderUser;
