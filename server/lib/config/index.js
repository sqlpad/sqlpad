const minimist = require('minimist');
const fromDefault = require('./fromDefault');
const fromEnv = require('./fromEnv');
const fromCli = require('./fromCli');
const fromFile = require('./fromFile');
const getOldConfigWarning = require('./getOldConfigWarning');

const argv = minimist(process.argv.slice(2));
const configFilePath = argv.config || process.env.SQLPAD_CONFIG;

const defaultConfig = fromDefault();
const envConfig = fromEnv();
const [fileConfig, warnings] = fromFile(configFilePath);
const cliConfig = fromCli(argv);

// Old files might have some values no longer recognized
if (warnings.length) {
  warnings.forEach(warning => console.warn(warning));
}

const all = Object.assign({}, defaultConfig, envConfig, fileConfig, cliConfig);

// Clean string boolean values
Object.keys(all).forEach(key => {
  const value = all[key];
  if (typeof value === 'string') {
    if (value.trim().toLowerCase() === 'true') {
      all[key] = true;
    } else if (value.trim().toLowerCase() === 'false') {
      all[key] = false;
    }
  }
});

exports.get = function get(key) {
  if (!key) {
    throw new Error('key must be provided');
  }

  if (!all.hasOwnProperty(key)) {
    throw new Error(`config item ${key} not defined in configItems.js`);
  }

  if (key === 'dbPath' && !all.dbPath) {
    console.error(getOldConfigWarning());
    throw new Error(`dbPath not defined`);
  }

  return all[key];
};

exports.smtpConfigured = () =>
  all.smtpHost && all.smtpUser && all.smtpFrom && all.smtpPort && all.publicUrl;

exports.googleAuthConfigured = () =>
  all.publicUrl && all.googleClientId && all.googleClientSecret;
