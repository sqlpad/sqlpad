/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog) {
  // Add unique constraint for (user_email, query_id) and (group_id, query_id)
  await queryInterface.addConstraint('query_acl', {
    type: 'unique',
    name: 'query_acl_user_email_query_id_key',
    fields: ['user_email', 'query_id'],
  });
}

module.exports = {
  up,
};
