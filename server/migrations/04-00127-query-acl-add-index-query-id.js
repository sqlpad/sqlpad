/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog) {
  await queryInterface.addIndex('query_acl', {
    fields: ['query_id'],
    name: 'query_acl_query_id',
  });
}

module.exports = {
  up,
};
