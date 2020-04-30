/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {import('../lib/config')} config
 * @param {import('../lib/logger')} appLog
 * @param {object} nedb - collection of nedb objects created in /lib/db.js
 */
// eslint-disable-next-line no-unused-vars
async function up(queryInterface, config, appLog, nedb) {
  // Add unique constraint for (user_email, query_id) and (group_id, query_id)
  await queryInterface.addConstraint('query_acl', ['user_email', 'query_id'], {
    type: 'unique',
    name: 'query_acl_user_email_query_id_key',
  });
}

module.exports = {
  up,
};
