const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const appLog = require('../lib/appLog');

const instances = {};

class SequelizeDao {
  constructor(config) {
    this.config = config;
    // TODO - testing can eventually be in memory with storage default ':memory:'
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      // sequelize may pass more than message,
      // but it appears to be the sequelize object and it is quite excessive
      logging: message => {
        appLog.debug(message);
      },
      storage: path.join(config.get('dbPath'), 'sqlpad.sqlite')
    });

    this.sequelize = sequelize;
    this.Sequelize = Sequelize;
    this.QueryAcl = require('./QueryAcl')(sequelize, DataTypes);
  }
}

/**
 * Initializes a sequelize instance for a given config.
 * Ensures that this only happens once for a given alias.
 * If this were called multiple times weird things could happen
 * @param {object} config
 * @param {string} instanceAlias
 */
function makeDb(config, instanceAlias = 'default') {
  // makeDb should only be called once for a given alias
  if (instances[instanceAlias]) {
    throw new Error(`db instance ${instanceAlias} already made`);
  }

  const instance = new SequelizeDao(config);

  instances[instanceAlias] = instance;
  return instance;
}

/**
 * Get sequelize instance for an optional alias.
 * Returns sequelize instance
 * @param {string} [instanceAlias]
 * @returns {SequelizeDao}
 */
function getDb(instanceAlias = 'default') {
  const instance = instances[instanceAlias];
  if (!instance) {
    throw new Error('db instance must be created first');
  }
  return instance;
}

module.exports = {
  makeDb,
  getDb
};
