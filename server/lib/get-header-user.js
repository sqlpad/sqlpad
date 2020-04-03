const _ = require('lodash');
require('../typedefs');

/**
 * Derive header user from request headers
 * @param {import('express').Request & Req} req
 */
function getHeaderUser(req) {
  const { config } = req;

  // If auth proxy is not enabled don't even try
  if (!config.get('authProxyEnabled')) {
    return null;
  }

  // Derive headerUser from headers
  let headerUser = {};
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
  // If .id was mapped, and _id wasn't, assign it to ._id and delete .id
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
