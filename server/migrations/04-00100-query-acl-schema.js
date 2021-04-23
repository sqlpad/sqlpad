const Sequelize = require('sequelize');
const migrationUtils = require('../lib/migration-utils');

/**
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
    user_email: {
      type: Sequelize.STRING,
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
    'query_acl_user_email_query_id_key',
    ['user_email', 'query_id'],
    {
      unique: true,
      where: {
        user_email: {
          [Sequelize.Op.ne]: null,
        },
      },
    }
  );

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
