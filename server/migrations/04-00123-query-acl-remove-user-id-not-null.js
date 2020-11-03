const Sequelize = require('sequelize');

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog) {
  // remove not-null constraint for user_id
  await queryInterface.changeColumn('query_acl', 'user_id', {
    type: Sequelize.STRING,
    allowNull: true,
  });
}

module.exports = {
  up,
};
