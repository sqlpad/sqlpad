/* eslint-disable class-methods-use-this */
const appLog = require('../app-log');
const configItems = require('./config-items');
const validateConnection = require('../validate-connection');
const {
  getFromCli,
  getFromDefault,
  getFromEnv,
  getOldConfigWarning,
  parseConnectionsFromEnv,
  isConnectionEnv,
} = require('./config-utils');
const drivers = require('../../drivers');

class Config {
  constructor(argv, env) {
    this.argv = argv;
    this.env = env;

    const configFilePath = argv.config || env.SQLPAD_CONFIG;

    const defaultConfig = getFromDefault();
    const envConfig = getFromEnv(env);
    const cliConfig = getFromCli(argv);

    const all = { ...defaultConfig, ...envConfig, ...cliConfig };

    // Clean string boolean values
    Object.keys(all).forEach((key) => {
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

    const allowedStores = ['redis', 'database', 'file', 'memory'];
    if (!allowedStores.includes(this.all.sessionStore)) {
      errors.push(
        `SQLPAD_SESSION_STORE must be one of ${allowedStores.join(', ')}`
      );
    }

    if (!allowedStores.includes(this.all.queryResultStore)) {
      errors.push(
        `SQLPAD_QUERY_RESULT_STORE must be one of ${allowedStores.join(', ')}`
      );
    }

    if (this.all.queryResultStore === 'redis' && !this.all.redisUri) {
      errors.push(
        `Redis query result store requires SQLPAD_REDIS_URI to be set`
      );
    }

    if (this.all.sessionStore === 'redis' && !this.all.redisUri) {
      errors.push(`Redis session store requires SQLPAD_REDIS_URI to be set`);
    }

    // Check for any old environment variables in env.
    // Any key that starts with SQLPAD_ that isn't known should raise a message.
    // An exception is SQLPAD_CONNECTIONS__ variables as they are dynamic and depend on database defined
    Object.keys(this.env).forEach((key) => {
      if (key.startsWith('SQLPAD_') && !isConnectionEnv(key)) {
        const foundDefinition = configItems.find((item) => item.envVar === key);
        if (!foundDefinition) {
          errors.push(
            `CONFIG NOT RECOGNIZED: Environment variable "${key}" no longer supported.`
          );
        }
      }
    });

    // Parse connections from env and error for anything invalid
    // This is easy to mess up and being strict will help avoid confusion
    const parsedConnections = parseConnectionsFromEnv(this.env);
    parsedConnections.forEach((parsedConnection) => {
      const {
        id,
        name,
        description,
        driver,
        multiStatementTransactionEnabled,
        idleTimeoutSeconds,
        ...driverSpecificFields
      } = parsedConnection;
      if (!name) {
        errors.push(
          `Environment config SQLPAD_CONNECTIONS__${id}__name missing`
        );
      }
      if (!driver) {
        errors.push(
          `Environment config SQLPAD_CONNECTIONS__${id}__driver missing`
        );
      } else {
        const driverImplementation = drivers[driver];
        if (!driverImplementation) {
          errors.push(
            `Environment config SQLPAD_CONNECTIONS__${id}__driver invalid. "${driver}" not a supported driver.`
          );
        } else {
          const validDriverFieldMap = {};
          driverImplementation.fields.forEach((fieldConfig) => {
            validDriverFieldMap[fieldConfig.key] = true;
          });
          Object.keys(driverSpecificFields).forEach((driverField) => {
            if (!validDriverFieldMap[driverField]) {
              errors.push(
                `Environment config SQLPAD_CONNECTIONS__${id}__${driverField} invalid. "${driverField}" not a known field for ${driver}.`
              );
            }
          });

          // parsedConnections are also run through a validateConnections function on read in .getConnections()
          // Run parsedConnection through that function now as well to catch any missed checks here
          // This connection loading/checking should be cleaned up in future to reduce duplicate checks
          // TODO - perform validation checks in constructor, getValidations() gets these values
          try {
            validateConnection(parsedConnection);
          } catch (error) {
            errors.push(
              `Environment connection configuration failed for ${
                parsedConnection.id
              }. ${error.toString()}`
            );
          }
        }
      }
    });

    // Check CLI config for any unknown flags
    // Flag must be from config-items + select values (-v -h --version --help, _ is used for all non-named values)
    const additionalCliFlags = ['_', 'h', 'help', 'v', 'version'];
    Object.keys(this.argv).forEach((key) => {
      const inAdditional = additionalCliFlags.includes(key);
      const inConfigItems = Boolean(
        configItems.find((item) => item.key === key)
      );
      if (!inAdditional && !inConfigItems) {
        errors.push(`CONFIG NOT RECOGNIZED: cli flag "${key}"`);
      }
    });

    // Check for deprecated keys provided in config
    const userProvidedConfigs = {
      ...this.envConfig,
      ...this.cliConfig,
    };
    Object.keys(userProvidedConfigs)
      .filter((key) => key !== 'connections')
      .forEach((key) => {
        const configItem = configItems.find((item) => item.key === key);
        if (configItem && configItem.deprecated) {
          warnings.push(
            `DEPRECATED CONFIG: ${configItem.key} / ${configItem.envVar}. ${configItem.deprecated}`
          );
        }
      });

    return {
      errors,
      warnings,
    };
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

  oidcConfigured() {
    return Boolean(
      this.all.publicUrl &&
        this.all.oidcClientId &&
        this.all.oidcClientSecret &&
        this.all.oidcIssuer &&
        this.all.oidcAuthorizationUrl &&
        this.all.oidcTokenUrl &&
        this.all.oidcUserInfoUrl
    );
  }

  /**
   * Get connections from config.
   * These are provided at runtime and not upserted
   * This allows supporting cases where connections can be defined then later removed via config changes alone
   *
   * Connection environment variables must follow the format:
   * SQLPAD_CONNECTIONS__<connectionId>__<connectionFieldName>
   *
   * <connectionId> can be any value to associate a grouping a fields to a connection instance
   * If supplying a connection that was previously defined in the embedded database,
   * this would map internally to connection.id object.
   *
   * <connectionFieldName> should be a field name identified in drivers.
   *
   * To define connections via envvars, `driver` field should be supplied.
   * id field is not required, as it is defined in second env var fragment.
   *
   * Example: SQLPAD_CONNECTIONS__ab123__sqlserverEncrypt=""
   *
   * @param {object} [env] - optional environment override for testing
   * @returns {array<object>} arrayOfConnections
   */
  getConnections(env = process.env) {
    // Create a map of connections from parsing environment variable
    const parsedConnections = parseConnectionsFromEnv(env);

    const cleanedConnections = [];
    parsedConnections.forEach((connection) => {
      try {
        connection = validateConnection(connection);
        connection.editable = false;
        cleanedConnections.push(connection);
      } catch (error) {
        appLog.error(
          error,
          'Environment connection configuration failed for %s',
          connection.id
        );
      }
    });

    return cleanedConnections;
  }
}

module.exports = Config;
