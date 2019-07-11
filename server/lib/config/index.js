const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const definitions = require('./configItems');
const fromDb = require('./fromDb');
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

function makeSave(db) {
  return async function save(key, value) {
    const definition = definitions.find(definition => definition.key === key);

    if (definition.interface !== 'ui') {
      throw new Error(
        `Config Item ${key} must use ui interface to be saved to db`
      );
    }

    const doc = await db.config.findOne({ key });
    if (doc) {
      doc.value = value;
      doc.modifiedDate = new Date();
      return db.config.update({ _id: doc._id }, doc, {});
    }
    const newConfigValue = {
      key,
      value,
      createdDate: new Date(),
      modifiedDate: new Date()
    };
    return db.config.insert(newConfigValue);
  };
}

function setBy(cliConfig, savedCliConfig, envConfig, dbConfig, key) {
  if (cliConfig[key]) {
    return 'cli';
  } else if (savedCliConfig[key]) {
    return 'saved cli';
  } else if (envConfig[key]) {
    return 'env';
  } else if (dbConfig[key]) {
    return 'db';
  } else {
    return 'default';
  }
}

/**
 * Get all config item values sans values from UI/db
 * @returns {object} configMap
 */
exports.getPreDbConfig = function getPreDbConfig() {
  return Object.assign({}, defaultConfig, envConfig, savedCliConfig, cliConfig);
};

/**
 * Gets config helper using all config sources
 * @param {db} db
 * @returns {Promise} configHelper
 */
exports.getHelper = async function getHelper(db) {
  const dbConfig = await fromDb(db);

  const all = Object.assign(
    {},
    defaultConfig,
    dbConfig,
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
      return definitions
        .map(definition => {
          return Object.assign({}, definition, {
            effectiveValue: all[definition.key],
            effectiveValueSource: setBy(
              cliConfig,
              savedCliConfig,
              envConfig,
              dbConfig,
              definition.key
            ),
            envValue: envConfig[definition.key],
            cliValue: cliConfig[definition.key],
            savedCliValue: savedCliConfig[definition.key],
            dbValue: dbConfig[definition.key]
          });
        })
        .map(item => {
          if (item.sensitive && item.interface === 'env') {
            item.effectiveValue = item.effectiveValue ? '**********' : '';
            item.dbValue = item.dbValue ? '**********' : '';
            item.default = item.default ? '**********' : '';
            item.envValue = item.envValue ? '**********' : '';
            item.cliValue = item.cliValue ? '**********' : '';
            item.savedCliValue = item.savedCliValue ? '**********' : '';
          }
          return item;
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
    save: makeSave(db),
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
