const authProxy = require('./auth-proxy');
const basic = require('./basic');
const google = require('./google');
const jwtServiceToken = require('./jwt-service-token');
const local = require('./local');
const saml = require('./saml');

/**
 * Register auth strategies (if configured)
 * @param {object} config
 */
function registerAuthStrategies(config) {
  authProxy(config);
  basic(config);
  google(config);
  jwtServiceToken(config);
  local(config);
  saml(config);
}

module.exports = registerAuthStrategies;
