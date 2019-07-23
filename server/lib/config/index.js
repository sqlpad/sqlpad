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

function setBy(cliConfig, savedCliConfig, envConfig, key) {
  if (cliConfig[key]) {
    return 'cli';
  } else if (savedCliConfig[key]) {
    return 'saved cli';
  } else if (envConfig[key]) {
    return 'env';
  } else {
    return 'default';
  }
}

/**
 * TODO FIXME XXX - this is no longer necessary as config helper is all the config.
 * there is no more db to consider
 * @returns {object} configMap
 */
exports.getPreDbConfig = function getPreDbConfig() {
  return Object.assign({}, defaultConfig, envConfig, savedCliConfig, cliConfig);
};

/**
 * Gets config helper using all config sources
 * @returns {Promise} configHelper
 */
exports.getHelper = function getHelper() {
  const all = Object.assign(
    {},
    defaultConfig,
    envConfig,
    savedCliConfig,
    cliConfig
  );

  const configHelper = {
    get: key => {
      if (!all.hasOwnProperty(key)) {
        throw new Error(`config item ${key} not defined in configItems.js`);
      }
      return all[key];
    },
    getConfigItems: () => {
      return definitions.map(definition => {
        return Object.assign({}, definition, {
          effectiveValue: all[definition.key],
          effectiveValueSource: setBy(
            cliConfig,
            savedCliConfig,
            envConfig,
            definition.key
          ),
          envValue: envConfig[definition.key],
          cliValue: cliConfig[definition.key],
          savedCliValue: savedCliConfig[definition.key]
        });
      });
    },
    getUiConfig: () => {
      return definitions
        .filter(item => item.uiDependency)
        .reduce((configMap, item) => {
          configMap[item.key] = all[item.key];
          return configMap;
        }, {});
    },
    smtpConfigured: () =>
      all.smtpHost &&
      all.smtpUser &&
      all.smtpFrom &&
      all.smtpPort &&
      all.publicUrl,
    googleAuthConfigured: () =>
      all.publicUrl && all.googleClientId && all.googleClientSecret
  };

  return configHelper;
};
