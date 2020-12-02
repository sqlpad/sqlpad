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
  try {
    // remove unique not-null constraint for email
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false,
    });
  } catch (error) {
    // ignore error. constraint may not exist depending on backend database
  }

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'users',
    'users_email',
    ['email'],
    {
      unique: true,
      where: {
        email: {
          [Sequelize.Op.ne]: null,
        },
      },
    }
  );

  await queryInterface.addColumn('users', 'ldap_id', {
    type: Sequelize.STRING,
  });

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'users',
    'users_ldap_id',
    ['ldap_id'],
    {
      unique: true,
      where: {
        ldap_id: {
          [Sequelize.Op.ne]: null,
        },
      },
    }
  );
}

module.exports = {
  up,
};
