/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog) {
  // Remove unique constraint on query_id_user_id (it'll be added again switched around later)
  await queryInterface.removeConstraint(
    'query_acl',
    'query_acl_query_id_user_id_key'
  );
}

module.exports = {
  up,
};
