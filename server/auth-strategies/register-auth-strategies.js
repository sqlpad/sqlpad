const basic = require('./basic');
const local = require('./local');
const saml = require('./saml');

/**
 * Register auth strategies (if configured)
 * @param {object} config
 */
function registerAuthStrategies(config) {
  local(config);
  basic(config);
  saml(config);
}

module.exports = registerAuthStrategies;
