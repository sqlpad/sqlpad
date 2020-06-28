/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb) {
  // Swap unique constraint around for (query_id, user_id) for index strategy, then add query_id index
  await queryInterface.addConstraint('query_acl', {
    type: 'unique',
    name: 'query_acl_user_id_query_id_key',
    fields: ['user_id', 'query_id'],
  });
}

module.exports = {
  up,
};
