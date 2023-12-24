import Sequelize from 'sequelize';

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
export async function up(queryInterface, config, appLog) {
  await queryInterface.addColumn('users', 'sync_auth_role', {
    type: Sequelize.BOOLEAN,
  });
}

export default {
  up,
};
