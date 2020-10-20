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

    async getDbMajorVersion() {
      const executed = await umzug.executed();
      if (executed.length === 0) {
        return 0;
      }

      const migrationFileRegex = /\d\d-\d\d\d\d\d-(\w|-)+\.js/;

      const migrationFiles = executed
        .map((migration) => migration.file)
        .sort()
        .filter((name) => {
          // regex.test() is stateful if /g is set
          // It isn't in use now, but it was during initial dev and caused confusion
          // Using string.search() to ensure this stops functioning in case of /g being set in future
          return name.search(migrationFileRegex) > -1;
        });

      const lastMigrationFile = migrationFiles.pop();

      // Migration files have format of 'nn-nnnnn-some-text.js'
      // Those initial 2 numbers were intended on being the major version...
      // but I messed that up pretty eary on 😬
      //
      // v5 migrations = anything starting with 05, or >= 04-00200
      // 04-00200-nedb-sqlite-tables.js
      // ... all the way to
      // 05-00100-sessions.js
      //
      // v4 migrations = 04-00000 - 04-00199
      // 04-00100-query-acl-schema.js
      // ... all the way to
      // 04-00129-service-tokens-schema.js
      //
      const [majorString, minorString] = lastMigrationFile.split('-');
      const major = parseInt(majorString, 10);
      const minor = parseInt(minorString, 10);

      if (major === 5) {
        return 5;
      }

      if (major === 4) {
        if (minor >= 200) {
          return 5;
        }
        return 4;
      }

      return -1;
    },
  };
}

module.exports = makeMigrator;
