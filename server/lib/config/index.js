const minimist = require('minimist');
const fromDefault = require('./fromDefault');
const fromEnv = require('./fromEnv');
const fromCli = require('./fromCli');
const fromFile = require('./fromFile');
const getConfigFilePath = require('./getConfigFilePath');

const argv = minimist(process.argv.slice(2));
const configFilePath = getConfigFilePath(argv);

const defaultConfig = fromDefault();
const envConfig = fromEnv();
const [fileConfig, warnings] = fromFile(configFilePath);
const cliConfig = fromCli(argv);

// Old files might have some values no longer recognized
if (warnings.length) {
  warnings.forEach(warning => console.warn(warning));
}

const all = Object.assign({}, defaultConfig, envConfig, fileConfig, cliConfig);

exports.get = function get(key) {
  if (!key) {
    throw new Error('key must be provided');
  }

  if (!all.hasOwnProperty(key)) {
    throw new Error(`config item ${key} not defined in configItems.js`);
  }
  return all[key];
};

exports.smtpConfigured = () =>
  all.smtpHost && all.smtpUser && all.smtpFrom && all.smtpPort && all.publicUrl;

exports.googleAuthConfigured = () =>
  all.publicUrl && all.googleClientId && all.googleClientSecret;
