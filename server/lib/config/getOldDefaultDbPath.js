const path = require('path');

/**
 * Gets old default db path. Going forward user needs to provide this explicitly
 * @returns {string} oldDbPath
 */
module.exports = function getOldDefaultDbPath() {
  const userHome =
    process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
  return path.join(userHome, 'sqlpad/db');
};
