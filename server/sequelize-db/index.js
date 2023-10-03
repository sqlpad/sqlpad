const path = require('path');
const { Sequelize } = require('sequelize');
const appLog = require('../lib/app-log');

// Sequelize logging function
function logging(message) {
  appLog.debug(message);
}

class SequelizeDb {
  constructor(config) {
    this.config = config;

    // As of Sequelize 5.21.11
    // Sequelize & SQLite on Windows may error with `SQLITE_CANTOPEN: unable to open database file`
    // if sqlite connection string is provided as a URI
    // If backendDatabaseUri is not set, we fall back to a SQLite specific sequelize config
    let sequelize;
    if (config.get('backendDatabaseUri')) {
      sequelize = new Sequelize(config.get('backendDatabaseUri'), {
        logging,
      });
    } else {
      sequelize = new Sequelize({
        dialect: 'sqlite',
        logging,
        storage: config.get('dbInMemory')
          ? ':memory:'
          : path.join(config.get('dbPath'), 'sqlpad.sqlite'),
      });
    }

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
    this.Sessions = require('./sessions')(sequelize);
  }
}

module.exports = SequelizeDb;
