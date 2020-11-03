/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog) {
  await queryInterface.addConstraint('query_acl', {
    type: 'unique',
    name: 'query_acl_group_id_query_id_key',
    fields: ['group_id', 'query_id'],
  });
}

module.exports = {
  up,
};
