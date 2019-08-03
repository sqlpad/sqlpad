const path = require('path');

module.exports = function getConfigFilePath(argv) {
  let configFilePath = argv.config || process.env.SQLPAD_CONFIG;
  if (!configFilePath) {
    const userHome =
      process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
    configFilePath = path.join(userHome, '.sqlpadrc');
  }
  return configFilePath;
};
