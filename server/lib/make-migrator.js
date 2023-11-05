import path from 'path';
import Umzug from 'umzug';
import serverDirname from '../server-dirname.cjs';

function makeMigrator(config, appLog, sequelizeInstance) {
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
        sequelizeInstance,
      ],
      path: path.join(serverDirname, 'migrations'),
      // The pattern that determines whether or not a file is a migration.
      pattern: /^\d+[\w-]+\.js$/,

      // A function that maps a file path to a migration object in the form
      // { up: Function, down: Function }. The default for this is to require(...)
      // the file as javascript, but you can use this to transpile TypeScript,
      // read raw sql etc.
      // See https://github.com/sequelize/umzug/blob/v2.x/test/fixtures/index.js
      // for examples.
      customResolver: (path) => {
        const filePath = `file:///${path.replace(/\\/g, '/')}`;
        const getModule = () => import(filePath);
        return {
          up: async (upParams, config, appLog, sequelizeInstance) =>
            (await getModule()).up(upParams, config, appLog, sequelizeInstance),
          down: async (downParams) => (await getModule()).down(downParams),
        };
      },
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

    /**
     * Returns promise containing major version of the database
     * If migrations have not yet run, 0 is returned.
     * If the version cannot be determined, -1 is returned
     */
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
      // 04-00200
      // ... all the way to
      // 05-00100
      // 5.0.0 release specifically included up to 04-00900 migration
      //
      // v4 migrations = 04-00000 - 04-00199
      // 04-00100
      // ... all the way to
      // 04-00129
      //
      const [majorString, minorString] = lastMigrationFile.split('-');
      const major = parseInt(majorString, 10);
      const minor = parseInt(minorString, 10);

      if (major === 4) {
        if (minor >= 200) {
          return 5;
        }
        return 4;
      }

      // Otherwise returns major as is (it'll be 5 or later)
      return major;
    },
  };
}

export default makeMigrator;
