const _ = require('lodash');
const appLog = require('../appLog');
const validateConnection = require('../validate-connection');
const fromDefault = require('./fromDefault');
const fromEnv = require('./fromEnv');
const fromCli = require('./fromCli');
const fromFile = require('./fromFile');
const getOldConfigWarning = require('./getOldConfigWarning');

class Config {
  constructor(argv, env) {
    this.argv = argv;

    const configFilePathFromConfig = argv.config || env.SQLPAD_CONFIG;

    const defaultConfig = fromDefault();
    const envConfig = fromEnv(env);
    const [fileConfig, warnings] = fromFile(configFilePathFromConfig);
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

    this.fileConfig = fileConfig;
    this.warnings = warnings;
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

    // By default dbPath will exist as empty string, which is not valid
    if (this.all.dbPath === '') {
      errors.push(getOldConfigWarning());
    }

    return {
      errors,
      warnings: [...this.warnings]
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
