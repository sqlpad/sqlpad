const _ = require('lodash');
const appLog = require('../app-log');
const configItems = require('./config-items');
const validateConnection = require('../validate-connection');
const removedEnv = require('./removed-env');
const fromDefault = require('./from-default');
const fromEnv = require('./from-env');
const fromCli = require('./from-cli');
const fromFile = require('./from-file');
const getOldConfigWarning = require('./get-old-config-warning');

class Config {
  constructor(argv, env) {
    this.argv = argv;
    this.env = env;

    const configFilePath = argv.config || env.SQLPAD_CONFIG;

    const defaultConfig = fromDefault();
    const envConfig = fromEnv(env);
    const fileConfig = fromFile(configFilePath);
    const cliConfig = fromCli(argv);

    const all = { ...defaultConfig, ...envConfig, ...fileConfig, ...cliConfig };

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

    this.configFilePath = configFilePath;
    this.envConfig = envConfig;
    this.fileConfig = fileConfig;
    this.cliConfig = cliConfig;
    this.all = all;
  }

  get(key) {
    const { connections, ...rest } = this.all;
    if (!key) {
      return rest;
    }

    if (!this.all.hasOwnProperty(key)) {
      throw new Error(`config item ${key} not defined in configItems.js`);
    }

    return this.all[key];
  }

  getValidations() {
    const errors = [];
    const warnings = [];

    // By default dbPath will exist as empty string, which is not valid
    if (this.all.dbPath === '') {
      errors.push(getOldConfigWarning());
    }

    // Check for any old environment variables in env.
    // This must be handled separately from other unknown checks,
    // as fromEnv() only gets config it knows about, so it will never have unknown values
    removedEnv.forEach(key => {
      if (this.env.hasOwnProperty(key)) {
        errors.push(
          `CONFIG NOT RECOGNIZED: Environment variable "${key}" no longer supported.`
        );
      }
    });

    // Check CLI config for any unknown flags
    // Flag must be from config-items + select values (-v -h --version --help, _ is used for all non-named values)
    const additionalCliFlags = ['_', 'h', 'help', 'v', 'version'];
    Object.keys(this.argv).forEach(key => {
      const inAdditional = additionalCliFlags.includes(key);
      const inConfigItems = Boolean(configItems.find(item => item.key === key));
      if (!inAdditional && !inConfigItems) {
        errors.push(`CONFIG NOT RECOGNIZED: cli flag "${key}"`);
      }
    });

    // Check fileConfig for unknown keys
    // Connections key is filtered out from consideration here because it is not driven by config-items
    // If key is not found in config items, raise error message to prevent application startup
    Object.keys(this.fileConfig)
      .filter(key => key !== 'connections')
      .filter(key => !configItems.find(item => item.key === key))
      .forEach(key => {
        errors.push(
          `CONFIG NOT RECOGNIZED: Key "${key}" in file ${this.configFilePath}.`
        );
      });

    // Check for deprecated keys provided in config
    const userProvidedConfigs = {
      ...this.envConfig,
      ...this.fileConfig,
      ...this.cliConfig
    };
    Object.keys(userProvidedConfigs)
      .filter(key => key !== 'connections')
      .forEach(key => {
        const configItem = configItems.find(item => item.key === key);
        if (configItem && configItem.deprecated) {
          warnings.push(
            `DEPRECATED CONFIG: ${configItem.key} / ${configItem.envVar}. ${configItem.deprecated}`
          );
        }
      });

    return {
      errors,
      warnings
    };
  }

  smtpConfigured() {
    return (
      this.all.smtpHost &&
      this.all.smtpUser &&
      this.all.smtpFrom &&
      this.all.smtpPort &&
      this.all.publicUrl
    );
  }

  googleAuthConfigured() {
    return (
      this.all.publicUrl &&
      this.all.googleClientId &&
      this.all.googleClientSecret
    );
  }

  samlAuthConfigured() {
    return (
      this.all.samlEntryPoint &&
      this.all.samlIssuer &&
      this.all.samlCallbackUrl &&
      this.all.samlCert &&
      this.all.samlAuthContext
    );
  }

  /**
   * Get connections from config.
   * These are provided at runtime and not upserted
   * This allows supporting cases where connections can be defined then later removed via config changes alone
   *
   * For environment variables:
   * connection env vars must follow the format:
   * SQLPAD_CONNECTIONS__<connectionId>__<connectionFieldName>
   *
   * <connectionId> can be any value to associate a grouping a fields to a connection instance
   * If supplying a connection that was previously defined in the nedb database,
   * this would map internally to connection._id object.
   *
   * <connectionFieldName> should be a field name identified in drivers.
   *
   * To define connections via envvars, `driver` field should be supplied.
   * _id field is not required, as it is defined in second env var fragment.
   *
   * Example: SQLPAD_CONNECTIONS__ab123__sqlserverEncrypt=""
   *
   * From file, resulting parsed configuration from file is expected to follow format `connections.<id>.<fieldname>`
   * {
   *   connections: {
   *     ab123: {
   *       sqlserverEncrypt: true
   *     }
   *   }
   * }
   *
   * @param {object} [env] - optional environment override for testing
   * @returns {array<object>} arrayOfConnections
   */
  getConnections(env = process.env) {
    // Create a map of connections from parsing environment variable
    const connectionsMapFromEnv = Object.keys(env)
      .filter(key => key.startsWith('SQLPAD_CONNECTIONS__'))
      .reduce((connectionsMap, envVar) => {
        // eslint-disable-next-line no-unused-vars
        const [prefix, id, field] = envVar.split('__');
        if (!connectionsMap[id]) {
          connectionsMap[id] = {};
        }
        connectionsMap[id][field] = env[envVar];
        return connectionsMap;
      }, {});

    // Get copy of connections from config file
    const { connections } = _.cloneDeep(this.fileConfig);

    // connections key from file matches format that is constructed from env
    // merge the 2 together then create an array out of them
    const connectionsMap = { ...connectionsMapFromEnv, ...connections };

    const connectionsFromConfig = [];
    Object.keys(connectionsMap).forEach(id => {
      try {
        let connection = connectionsMap[id];
        connection._id = id;
        connection = validateConnection(connection);
        connection.editable = false;
        connectionsFromConfig.push(connection);
      } catch (error) {
        appLog.error(
          error,
          'Environment connection configuration failed for %s',
          id
        );
      }
    });

    return connectionsFromConfig;
  }
}

module.exports = Config;
