const path = require('path');
const Umzug = require('umzug');

function makeMigrator(config, appLog, nedb, sequelizeInstance) {
  const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize: sequelizeInstance,
      tableName: 'schema_version',
    },
    logging: (message) => {
      appLog.info(message);
    },
    migrations: {
      params: [
        sequelizeInstance.queryInterface,
        config,
        appLog,
        nedb,
        sequelizeInstance,
      ],
      path: path.join(__dirname, '../migrations'),
      // The pattern that determines whether or not a file is a migration.
      pattern: /^\d+[\w-]+\.js$/,
    },
  });

  return {
    migrate() {
      return umzug.up();
    },
    async schemaUpToDate() {
      const pending = await umzug.pending();
      const upToDate = pending.length === 0;
      return upToDate;
    },
  };
}

module.exports = makeMigrator;
