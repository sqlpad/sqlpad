const path = require('path');
const { Sequelize } = require('sequelize');
const appLog = require('../lib/app-log');

class SequelizeDb {
  constructor(config) {
    this.config = config;

    const connectionUri =
      config.get('backendDatabaseUri') ||
      'sqlite:' +
        (config.get('dbInMemory')
          ? ':memory:'
          : path.join(config.get('dbPath'), 'sqlpad.sqlite'));

    const sequelize = new Sequelize(connectionUri, {
      // sequelize may pass more than message,
      // but it appears to be the sequelize object and it is quite excessive
      logging: (message) => {
        appLog.debug(message);
      },
    });

    this.sequelize = sequelize;
    this.Sequelize = Sequelize;

    this.QueryAcl = require('./query-acl')(sequelize);
    this.ServiceTokens = require('./service-tokens')(sequelize);
    this.Queries = require('./queries')(sequelize);
    this.QueryTags = require('./query-tags')(sequelize);
    this.Connections = require('./connections')(sequelize);
    this.Users = require('./users')(sequelize);
    this.QueryHistory = require('./query-history')(sequelize);
    this.ConnectionAccesses = require('./connections-accesses')(sequelize);
    this.Cache = require('./cache')(sequelize);
    this.Batches = require('./batches')(sequelize);
    this.Statements = require('./statements')(sequelize);
  }
}

module.exports = SequelizeDb;
