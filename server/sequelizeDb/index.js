const path = require('path');
const { Sequelize } = require('sequelize');
const appLog = require('../lib/appLog');

class SequelizeDb {
  constructor(config) {
    this.config = config;

    const sequelize = new Sequelize({
      dialect: 'sqlite',
      // sequelize may pass more than message,
      // but it appears to be the sequelize object and it is quite excessive
      logging: message => {
        appLog.debug(message);
      },
      storage: config.get('dbInMemory')
        ? ':memory:'
        : path.join(config.get('dbPath'), 'sqlpad.sqlite')
    });

    this.sequelize = sequelize;
    this.Sequelize = Sequelize;

    this.QueryAcl = require('./QueryAcl')(sequelize);
  }
}

module.exports = SequelizeDb;
