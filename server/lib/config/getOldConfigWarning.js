const path = require('path');
const fs = require('fs');

const userHome =
  process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
const oldConfigFilePath = path.join(userHome, '.sqlpadrc');
const oldDefaultDbPath = path.join(userHome, 'sqlpad/db');

let message = `
  "dbPath" not provided in config. 
  This was previously defaulted to ${oldDefaultDbPath}.
  This must now be explicitly set.`;

if (fs.existsSync(oldConfigFilePath)) {
  message += `
  This value may have been provided by old saved config file at ${oldConfigFilePath}. 
  Config file location must also now be provided explicitly.
  Use --config at command line or set environment variable SQLPAD_CONFIG
  `;
}

module.exports = function getOldConfigWarning() {
  return message;
};
