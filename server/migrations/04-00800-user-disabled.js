const Sequelize = require('sequelize');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog) {
  await queryInterface.addColumn('users', 'disabled', {
    type: Sequelize.BOOLEAN,
  });
}

module.exports = {
  up,
};
