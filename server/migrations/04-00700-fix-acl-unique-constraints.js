const Sequelize = require('sequelize');
const migrationUtils = require('../lib/migration-utils');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 * @param {object} sequelizeDb - sequelize instance
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb, sequelizeDb) {
  async function tryRemove(tableName, constraintName) {
    try {
      await queryInterface.removeConstraint(tableName, constraintName);
    } catch (error) {
      // ignore error. constraint may not exist depending on backend database
    }
  }

  // Try removing existing query_acl unique constraints
  // They need to be updated for non-null values for SQL Server compat
  await tryRemove('query_acl', 'query_acl_user_email_query_id_key');
  await tryRemove('query_acl', 'query_acl_group_id_query_id_key');
  await tryRemove('query_acl', 'query_acl_user_id_query_id_key');

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
