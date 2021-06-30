const Sequelize = require('@rickbergfalk/sequelize');
const migrationUtils = require('../lib/migration-utils');

/**
 * NOTE: This migration has been consolidated and altered since its original authoring
 * These changes were made 04/22/2021, at which point SQLPad was version 6.6.0
 * The contents of this migration as it is today create the end result as it would have been as of 5.0.0 release.
 * For new installations, it effectively sets up what is needed by 5.0.0
 * For existing installations, SQLPad is guaranteed to be at 5.0.0 or later,
 * and since this migration name remains unchanged, it will not run.
 *
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} sequelizeDb - sequelize instance
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, sequelizeDb) {
  if (config.get('backendDatabaseUri').startsWith('mssql')) {
    await sequelizeDb.query(
      `
        IF TYPE_ID('JSON') IS NULL
        BEGIN
          CREATE TYPE [dbo].[JSON] FROM [NVARCHAR](MAX) NULL;
        END 
      `
    );
  }

  await queryInterface.createTable('query_acl', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    query_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    write: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
    },
    group_id: {
      type: Sequelize.STRING,
    },
  });

  await queryInterface.addIndex('query_acl', {
    fields: ['query_id'],
    name: 'query_acl_query_id',
  });

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'query_acl',
    'query_acl_group_id_query_id_key',
    ['group_id', 'query_id'],
    {
      unique: true,
      where: {
        group_id: {
          [Sequelize.Op.ne]: null,
        },
      },
    }
  );

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'query_acl',
    'query_acl_user_id_query_id_key',
    ['user_id', 'query_id'],
    {
      unique: true,
      where: {
        user_id: {
          [Sequelize.Op.ne]: null,
        },
      },
    }
  );
}

module.exports = {
  up,
};
