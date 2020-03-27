const basic = require('./basic');
const google = require('./google');
const local = require('./local');
const saml = require('./saml');

/**
 * Register auth strategies (if configured)
 * @param {object} config
 */
function registerAuthStrategies(config) {
  basic(config);
  google(config);
  local(config);
  saml(config);
}

module.exports = registerAuthStrategies;
