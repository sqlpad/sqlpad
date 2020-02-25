const path = require('path');
const Umzug = require('umzug');

function runMigrations(config, appLog, nedb, sequelizeInstance) {
  appLog.info('Running migrations');
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize: sequelizeInstance,
      tableName: 'schema_version'
    },
    logging: message => {
      appLog.info(message);
    },
    migrations: {
      params: [sequelizeInstance.queryInterface, config, appLog, nedb],
      path: path.join(__dirname, '../migrations'),
      // The pattern that determines whether or not a file is a migration.
      pattern: /^\d+[\w-]+\.js$/
    }
  });

  return umzug.up();
}

module.exports = runMigrations;
