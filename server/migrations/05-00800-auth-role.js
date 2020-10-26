const Sequelize = require('sequelize');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb) {
  await queryInterface.addColumn('users', 'sync_auth_role', {
    type: Sequelize.BOOLEAN,
  });
}

module.exports = {
  up,
};
