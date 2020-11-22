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
    await queryInterface.removeConstraint('users', 'users_password_reset_id');
  } catch (error) {
    // ignore error. constraint may not exist depending on backend database
  }

  await migrationUtils.addOrReplaceIndex(
    queryInterface,
    'users',
    'users_password_reset_id',
    ['password_reset_id'],
    {
      unique: true,
      where: {
        password_reset_id: {
          [Sequelize.Op.ne]: null,
        },
      },
    }
  );
}

module.exports = {
  up,
};
