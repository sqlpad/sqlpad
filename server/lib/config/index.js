const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const definitions = require('./configItems');
const fromDefault = require('./fromDefault');
const fromEnv = require('./fromEnv');
const fromCli = require('./fromCli');

// argv
const argv = minimist(process.argv.slice(2));

// Saved argv
const userHome =
  process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
const filePath = path.join(userHome, '.sqlpadrc');
const savedArgv = fs.existsSync(filePath)
  ? JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }))
  : {};

const defaultConfig = fromDefault();
const cliConfig = fromCli(argv);
const savedCliConfig = fromCli(savedArgv);
const envConfig = fromEnv();

const all = Object.assign(
  {},
  defaultConfig,
  envConfig,
  savedCliConfig,
  cliConfig
);

exports.get = function get(key) {
  if (!key) {
    throw new Error('key must be provided');
  }

  if (!all.hasOwnProperty(key)) {
    throw new Error(`config item ${key} not defined in configItems.js`);
  }
  return all[key];
};

exports.getUiConfig = () => {
  return definitions
    .filter(item => item.uiDependency)
    .reduce((configMap, item) => {
      configMap[item.key] = all[item.key];
      return configMap;
    }, {});
};

exports.smtpConfigured = () =>
  all.smtpHost && all.smtpUser && all.smtpFrom && all.smtpPort && all.publicUrl;

exports.googleAuthConfigured = () =>
  all.publicUrl && all.googleClientId && all.googleClientSecret;
